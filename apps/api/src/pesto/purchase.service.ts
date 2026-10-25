import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { purchaseActivationInputSchema, purchaseIssueInputSchema } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { EmailTransport } from '../email/email-transport.js';
import { registrationKey } from './registration-config.js';
import { hash } from './registration-protocol.js';
import { consumePestoRegistration } from './registration.service.js';
import { readTrialKey, signPerpetual } from './trial-signing.js';

// Purpose separated from email codes/tickets. Raw purchase keys are never persisted.
export function purchaseKey(secret: Buffer, id: string, nonce: string) {
  return (
    'PSTO-' +
    createHmac('sha256', secret)
      .update(`Pesto.Purchase.Key.v1:${id}:${nonce}`)
      .digest('hex')
      .toUpperCase()
  );
}

@Injectable()
export class PestoPurchaseService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(EmailTransport) private readonly email: EmailTransport,
  ) {}
  async list(raw: Record<string, unknown>) {
    const keys = Object.keys(raw);
    const page = raw.page === undefined ? 1 : Number(raw.page);
    const search = typeof raw.search === 'string' ? raw.search.trim() : '';
    const status = raw.status === undefined ? 'all' : raw.status;
    if (
      keys.some((key) => !['page', 'search', 'status'].includes(key)) ||
      !Number.isInteger(page) ||
      page < 1 ||
      page > 100000 ||
      (raw.page !== undefined &&
        (typeof raw.page !== 'string' || !/^[1-9][0-9]*$/.test(raw.page))) ||
      (raw.search !== undefined && typeof raw.search !== 'string') ||
      search.length > 120 ||
      !['all', 'unused', 'activated', 'revoked'].includes(status as string)
    )
      throw new BadRequestException('Invalid purchase filters.');
    const pageSize = 20;
    const where = {
      ...(status === 'unused' ? { revokedAt: null, consumedAt: null, license: { is: null } } : {}),
      ...(status === 'activated' ? { consumedAt: { not: null } } : {}),
      ...(status === 'revoked' ? { revokedAt: { not: null } } : {}),
      ...(search
        ? {
            OR: [
              { reference: { contains: search, mode: 'insensitive' as const } },
              { customer: { email: { contains: search, mode: 'insensitive' as const } } },
              { customer: { businessName: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };
    const [total, rows] = await this.db.$transaction([
      this.db.pestoPurchaseKey.count({ where }),
      this.db.pestoPurchaseKey.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          reference: true,
          createdAt: true,
          revokedAt: true,
          consumedAt: true,
          customer: { select: { email: true, businessName: true } },
          license: {
            select: {
              id: true,
              issuedAt: true,
              delivery: {
                select: { status: true, attempts: true, sentAt: true },
              },
            },
          },
        },
      }),
    ]);
    return {
      enabled:
        this.config.get('PESTO_PURCHASE_ENABLED') === 'true' &&
        this.config.get('PESTO_REGISTRATION_ENABLED') === 'true' &&
        this.email.enabled,
      page,
      pageSize,
      total,
      items: rows.map((row) => ({
        purchaseId: row.id,
        reference: row.reference,
        email: row.customer.email,
        businessName: row.customer.businessName,
        createdAt: row.createdAt,
        status: row.revokedAt ? 'revoked' : row.consumedAt ? 'activated' : 'unused',
        revokedAt: row.revokedAt,
        consumedAt: row.consumedAt,
        activationId: row.license?.id ?? null,
        issuedAt: row.license?.issuedAt ?? null,
        delivery: row.license?.delivery ?? null,
      })),
    };
  }
  ensureEnabled() {
    if (
      this.config.get('PESTO_PURCHASE_ENABLED') !== 'true' ||
      this.config.get('PESTO_REGISTRATION_ENABLED') !== 'true' ||
      !this.email.enabled
    )
      throw new ServiceUnavailableException('Purchase activation is not available.');
  }
  async issue(raw: unknown, actorId: string) {
    this.ensureEnabled();
    const parsed = purchaseIssueInputSchema.safeParse(raw);
    if (!parsed.success || !actorId) throw new BadRequestException('Invalid purchase details.');
    const input = parsed.data;
    const secret = registrationKey(this.config);
    try {
      return await this.db.$transaction(
        async (tx) => {
          const customer = await tx.pestoCustomer.findUnique({ where: { email: input.email } });
          if (!customer?.emailVerifiedAt)
            throw new BadRequestException('A verified Pesto customer is required.');
          let row = await tx.pestoPurchaseKey.findUnique({ where: { id: input.requestId } });
          if (
            row &&
            (row.customerId !== customer.id || row.reference !== input.reference || row.revokedAt)
          )
            throw new ConflictException('Purchase request already exists with different details.');
          if (!row) {
            const nonce = randomBytes(32).toString('hex');
            const token = purchaseKey(secret, input.requestId, nonce);
            row = await tx.pestoPurchaseKey.create({
              data: {
                id: input.requestId,
                customerId: customer.id,
                keyNonce: nonce,
                keyHash: hash(token),
                reference: input.reference,
                createdById: actorId,
              },
            });
          }
          const token = purchaseKey(secret, row.id, row.keyNonce);
          if (hash(token) !== row.keyHash)
            throw new ServiceUnavailableException('Purchase issuer configuration changed.');
          // Only the authenticated company-admin endpoint may return this value.
          return { purchaseId: row.id, purchaseKey: token, email: customer.email };
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      return this.databaseFailure(error);
    } finally {
      secret.fill(0);
    }
  }
  async revoke(id: string, actorId: string) {
    this.ensureEnabled();
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new BadRequestException('Invalid purchase reference.');
    const changed = await this.db.pestoPurchaseKey.updateMany({
      where: { id, revokedAt: null, consumedAt: null, license: { is: null } },
      data: { revokedAt: new Date(), revokedById: actorId },
    });
    if (!changed.count) throw new ConflictException('Only an unused purchase key can be revoked.');
    return { revoked: true };
  }
  async activate(raw: unknown) {
    this.ensureEnabled();
    const parsed = purchaseActivationInputSchema.safeParse(raw);
    if (!parsed.success) throw new BadRequestException('Activation details are invalid.');
    const input = parsed.data;
    const keyId = this.config.get<string>('PESTO_LICENSE_KEY_ID') ?? '';
    let signer;
    try {
      if (!/^[A-Za-z0-9_-]{1,80}$/.test(keyId)) throw new Error();
      signer = readTrialKey(this.config.get<string>('PESTO_LICENSE_PRIVATE_KEY') ?? '');
    } catch {
      throw new ServiceUnavailableException('Purchase signing is not configured.');
    }
    try {
      return await this.db.$transaction(
        async (tx) => {
          const now = new Date();
          const purchase = await tx.pestoPurchaseKey.findUnique({
            where: { keyHash: hash(input.purchaseKey) },
          });
          const proof = await tx.pestoRegistration.findUnique({
            where: { ticketHash: hash(input.registrationTicket) },
          });
          if (
            !purchase ||
            purchase.revokedAt ||
            !proof?.verifiedAt ||
            !proof.customerId ||
            proof.customerId !== purchase.customerId ||
            proof.installationId !== input.installationId ||
            proof.deviceHash !== input.deviceHash
          )
            throw new BadRequestException('Activation details are invalid.');
          const grant = await tx.pestoActivationGrant.findUnique({
            where: { registrationId: proof.id },
            include: { license: true },
          });
          if (grant) {
            if (
              grant.retryUntil <= now ||
              grant.license.purchaseId !== purchase.id ||
              grant.license.installationId !== input.installationId ||
              grant.license.deviceHash !== input.deviceHash
            )
              throw new BadRequestException('Activation details are invalid.');
            return { activationId: grant.licenseId, status: 'email-queued' as const };
          }
          const consumed = await consumePestoRegistration(
            tx,
            input.registrationTicket,
            input.installationId,
            input.deviceHash,
            now,
          );
          if (!consumed) throw new BadRequestException('Activation details are invalid.');
          const existing = await tx.pestoPerpetualLicense.findFirst({
            where: {
              OR: [
                { purchaseId: purchase.id },
                { installationId: input.installationId },
                { deviceHash: input.deviceHash },
              ],
            },
          });
          if (
            existing &&
            (existing.purchaseId !== purchase.id ||
              existing.customerId !== purchase.customerId ||
              existing.installationId !== input.installationId ||
              existing.deviceHash !== input.deviceHash)
          )
            throw new ConflictException(
              'Purchase or device already activated. Contact support for transfer.',
            );
          const trial = await tx.pestoTrial.findFirst({
            where: {
              OR: [{ installationId: input.installationId }, { deviceHash: input.deviceHash }],
            },
          });
          if (
            trial &&
            (trial.customerId !== purchase.customerId ||
              trial.installationId !== input.installationId ||
              trial.deviceHash !== input.deviceHash)
          )
            throw new ConflictException('Device ownership requires support review.');
          let license = existing;
          if (!license) {
            // Write the purchase row too: activation and revocation cannot both win.
            const claimed = await tx.pestoPurchaseKey.updateMany({
              where: { id: purchase.id, consumedAt: null, revokedAt: null },
              data: { consumedAt: now },
            });
            if (!claimed.count) throw new ConflictException('Purchase key is no longer available.');
            const id = randomUUID();
            // Windows pins registrationId on first permit; preserve it during trial -> purchase.
            const registrationId = trial?.registrationId ?? proof.id;
            const envelope = signPerpetual(signer, keyId, {
              licenseId: id,
              registrationId,
              installationId: input.installationId,
              deviceHash: input.deviceHash,
              issuedAt: now,
            });
            license = await tx.pestoPerpetualLicense.create({
              data: {
                id,
                purchaseId: purchase.id,
                customerId: purchase.customerId,
                registrationId,
                installationId: input.installationId,
                deviceHash: input.deviceHash,
                issuedAt: now,
                envelope,
              },
            });
            await tx.pestoLicenseDelivery.create({ data: { licenseId: license.id } });
          }
          await tx.pestoActivationGrant.create({
            data: {
              registrationId: proof.id,
              licenseId: license.id,
              retryUntil: new Date(now.getTime() + 15 * 60000),
            },
          });
          // The actual signed operating permit is delivered to the verified email, not this caller.
          return { activationId: license.id, status: 'email-queued' as const };
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      return this.databaseFailure(error);
    }
  }
  private databaseFailure(error: unknown): never {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      ['P2002', 'P2034'].includes(String(error.code))
    )
      throw new ConflictException('Purchase activation changed. Retry the same request.');
    throw error;
  }
}
