import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicKey, randomUUID, verify } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { EmailTransport } from '../email/email-transport.js';
import { readTrialKey } from './trial-signing.js';
import { licenseMessage } from './license-message.js';

@Injectable()
export class PestoLicenseDeliveryWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(PestoLicenseDeliveryWorker.name);
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(EmailTransport) private readonly email: EmailTransport,
  ) {}
  private enabled() {
    return (
      this.config.get('PESTO_PURCHASE_ENABLED') === 'true' &&
      this.config.get('PESTO_REGISTRATION_ENABLED') === 'true' &&
      this.email.enabled
    );
  }
  onModuleInit() {
    if (!this.enabled()) return;
    this.timer = setInterval(() => {
      void this.process().catch(() => this.logger.error('Pesto license delivery failed'));
    }, 15000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async process() {
    if (this.running || !this.enabled()) return;
    this.running = true;
    try {
      const now = new Date(),
        stale = new Date(now.getTime() - 5 * 60000);
      await this.db.pestoLicenseDelivery.updateMany({
        where: { status: 'RUNNING', attempts: { gte: 5 }, claimedAt: { lt: stale } },
        data: { status: 'FAILED', leaseId: null, lastError: 'Delivery attempts exhausted' },
      });
      const row = await this.db.pestoLicenseDelivery.findFirst({
        where: {
          attempts: { lt: 5 },
          OR: [
            { status: 'PENDING', availableAt: { lte: now } },
            { status: 'RUNNING', claimedAt: { lt: stale } },
          ],
        },
        include: { license: { include: { customer: true } } },
        orderBy: { availableAt: 'asc' },
      });
      if (!row) return;
      const leaseId = randomUUID();
      const claim = await this.db.pestoLicenseDelivery.updateMany({
        where: {
          licenseId: row.licenseId,
          leaseId: row.leaseId,
          attempts: row.attempts,
          status: row.status,
        },
        data: { status: 'RUNNING', leaseId, claimedAt: now, attempts: { increment: 1 } },
      });
      if (!claim.count) return;
      const owned = { licenseId: row.licenseId, leaseId, status: 'RUNNING' };
      try {
        const license = row.license;
        if (!license.customer.emailVerifiedAt || license.envelope.length > 12000) throw new Error();
        const envelope = JSON.parse(license.envelope);
        if (
          Object.keys(envelope).sort().join(',') !== 'keyId,payload,signature' ||
          envelope.keyId !== this.config.get('PESTO_LICENSE_KEY_ID') ||
          typeof envelope.payload !== 'string' ||
          typeof envelope.signature !== 'string' ||
          !/^[A-Za-z0-9+/]+={0,2}$/.test(envelope.payload) ||
          !/^[A-Za-z0-9+/]{86}==$/.test(envelope.signature)
        )
          throw new Error();
        const payload = Buffer.from(envelope.payload, 'base64');
        const key = createPublicKey(
          readTrialKey(this.config.get<string>('PESTO_LICENSE_PRIVATE_KEY') ?? ''),
        );
        if (
          !verify(
            'sha256',
            payload,
            { key, dsaEncoding: 'ieee-p1363' },
            Buffer.from(envelope.signature, 'base64'),
          )
        )
          throw new Error();
        const claims = JSON.parse(payload.toString('utf8'));
        if (
          claims.licenseId !== license.id ||
          claims.registrationId !== license.registrationId ||
          claims.installationId !== license.installationId ||
          claims.deviceHash !== license.deviceHash ||
          claims.version !== 1 ||
          claims.signingKeyId !== envelope.keyId ||
          claims.issuedAtUtc !== license.issuedAt.toISOString() ||
          claims.issuer !== 'TEVONIQ' ||
          claims.product !== 'Pesto.Lite' ||
          claims.kind !== 'perpetual' ||
          claims.expiresAtUtc !== null ||
          claims.emailVerified !== true ||
          claims.maxUsers !== 2 ||
          claims.maxConcurrentDevices !== 2
        )
          throw new Error();
        await this.email.send({
          to: [license.customer.email],
          ...licenseMessage(license.customer.language, license.envelope, license.id),
          messageId: `<pesto-operating-${license.id}@tevoniq.com>`,
        });
        await this.db.pestoLicenseDelivery.updateMany({
          where: owned,
          data: { status: 'SENT', sentAt: new Date(), leaseId: null, lastError: null },
        });
      } catch {
        const attempts = row.attempts + 1;
        await this.db.pestoLicenseDelivery.updateMany({
          where: owned,
          data: {
            status: attempts >= 5 ? 'FAILED' : 'PENDING',
            leaseId: null,
            lastError: 'Operating permit delivery failed',
            availableAt: new Date(Date.now() + Math.min(2 ** attempts * 30000, 5 * 60000)),
          },
        });
      }
    } finally {
      this.running = false;
    }
  }
}
