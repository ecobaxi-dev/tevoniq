import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { EmailTransport } from '../email/email-transport.js';
import { registrationEnabled, registrationKey } from './registration-config.js';
import {
  equalDigest,
  codeDigest,
  verificationCode,
  verificationMessage,
} from './registration-protocol.js';

@Injectable()
export class PestoRegistrationWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(PestoRegistrationWorker.name);
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(EmailTransport) private readonly transport: EmailTransport,
  ) {}
  onModuleInit() {
    if (!registrationEnabled(this.config)) return;
    this.timer = setInterval(() => {
      void this.process().catch(() => this.logger.error('Pesto email queue processing failed'));
    }, 15000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async process() {
    if (this.running || !registrationEnabled(this.config) || !this.transport.enabled) return;
    const key = registrationKey(this.config);
    this.running = true;
    try {
      const now = new Date(),
        stale = new Date(now.getTime() - 5 * 60000);
      await this.db.pestoRegistration.updateMany({
        where: {
          OR: [
            { expiresAt: { lte: now }, deliveryStatus: { in: ['PENDING', 'RUNNING'] } },
            { deliveryStatus: 'RUNNING', deliveryAttempts: { gte: 5 }, claimedAt: { lt: stale } },
          ],
        },
        data: {
          deliveryStatus: 'FAILED',
          leaseId: null,
          lastError: 'Verification delivery expired',
        },
      });
      await this.db.pestoRegistration.deleteMany({
        where: { verifiedAt: null, createdAt: { lt: new Date(now.getTime() - 7 * 86400000) } },
      });
      const row = await this.db.pestoRegistration.findFirst({
        where: {
          verifiedAt: null,
          expiresAt: { gt: now },
          deliveryAttempts: { lt: 5 },
          OR: [
            { deliveryStatus: 'PENDING', availableAt: { lte: now } },
            { deliveryStatus: 'RUNNING', claimedAt: { lt: stale } },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
      if (!row) return;
      const leaseId = randomUUID();
      const claim = await this.db.pestoRegistration.updateMany({
        where: {
          id: row.id,
          deliveryStatus: row.deliveryStatus,
          deliveryAttempts: row.deliveryAttempts,
          leaseId: row.leaseId,
          verifiedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          deliveryStatus: 'RUNNING',
          deliveryAttempts: { increment: 1 },
          claimedAt: now,
          leaseId,
        },
      });
      if (!claim.count) return;
      const owned = { id: row.id, deliveryStatus: 'RUNNING', leaseId };
      try {
        const code = verificationCode(key, row.id, row.codeNonce);
        if (!equalDigest(row.codeHash, codeDigest(key, row.id, code)))
          throw new Error('Verification key changed');
        const current = await this.db.pestoRegistration.findUnique({ where: { id: row.id } });
        if (!current || current.verifiedAt || current.expiresAt <= new Date()) {
          await this.db.pestoRegistration.updateMany({
            where: owned,
            data: { deliveryStatus: 'CANCELLED', leaseId: null },
          });
          return;
        }
        await this.transport.send({
          to: [row.email],
          ...verificationMessage(row.language, code, row.id),
          messageId: `<pesto-registration-${row.id}@tevoniq.com>`,
        });
        await this.db.pestoRegistration.updateMany({
          where: owned,
          data: { deliveryStatus: 'SENT', sentAt: new Date(), leaseId: null, lastError: null },
        });
      } catch {
        const attempts = row.deliveryAttempts + 1;
        await this.db.pestoRegistration.updateMany({
          where: owned,
          data: {
            deliveryStatus: attempts >= 5 ? 'FAILED' : 'PENDING',
            availableAt: new Date(Date.now() + Math.min(2 ** attempts * 30000, 5 * 60000)),
            leaseId: null,
            lastError: 'Verification email delivery failed',
          },
        });
      }
    } finally {
      key.fill(0);
      this.running = false;
    }
  }
}
