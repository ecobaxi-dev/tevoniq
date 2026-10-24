import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { EmailTransport } from '../email/email-transport.js';
import type { Prisma } from '../generated/prisma/client.js';
import { registrationEnabled, registrationKey } from './registration-config.js';
import {
  registrationInputSchema,
  verificationInputSchema,
  hash,
  equalDigest,
  inputDigest,
  verificationCode,
  codeDigest,
  registrationTicket,
} from './registration-protocol.js';

async function transaction<T>(
  db: DatabaseService,
  action: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    return await db.$transaction(action, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      ['P2002', 'P2034'].includes(String(error.code))
    )
      throw new ConflictException('Registration changed. Retry the same request.');
    throw error;
  }
}
@Injectable()
export class PestoRegistrationService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(EmailTransport) private readonly email: EmailTransport,
  ) {}

  ensureEnabled() {
    if (!registrationEnabled(this.config) || !this.email.enabled)
      throw new ServiceUnavailableException('Pesto registration is not available yet.');
  }
  async register(raw: unknown) {
    this.ensureEnabled();
    const parsed = registrationInputSchema.safeParse(raw);
    if (!parsed.success) throw new BadRequestException('Invalid Pesto registration details.');
    const input = parsed.data;
    const key = registrationKey(this.config);
    try {
      await transaction(this.db, async (tx) => {
        const prior = await tx.pestoRegistration.findUnique({ where: { id: input.requestId } });
        if (prior) {
          if (!equalDigest(prior.inputHash, inputDigest(input)))
            throw new ConflictException('This request identity is already in use.');
          return; // Identical transport retries do not resend, extend expiry or change a profile.
        }
        const now = new Date(),
          nonce = randomBytes(32).toString('hex');
        await tx.pestoRegistration.create({
          data: {
            id: input.requestId,
            installationId: input.installationId,
            deviceHash: input.deviceHash,
            email: input.email,
            managerName: input.managerName,
            businessName: input.businessName,
            country: input.country,
            phone: input.phone,
            language: input.language,
            consentAt: now,
            consentVersion: 'pesto-registration-v1',
            inputHash: inputDigest(input),
            clientSecretHash: hash(input.clientSecret),
            codeNonce: nonce,
            codeHash: codeDigest(
              key,
              input.requestId,
              verificationCode(key, input.requestId, nonce),
            ),
            expiresAt: new Date(now.getTime() + 20 * 60000),
            availableAt: now,
          },
        });
      });
      // Deliberately identical for a new/known email; no customer account details are returned.
      return { requestId: input.requestId, status: 'pending' as const, canStartTrial: false };
    } finally {
      key.fill(0);
    }
  }

  async verify(raw: unknown) {
    this.ensureEnabled();
    const parsed = verificationInputSchema.safeParse(raw);
    if (!parsed.success)
      throw new BadRequestException('Verification details are invalid or expired.');
    const input = parsed.data,
      key = registrationKey(this.config);
    try {
      const result = await transaction(this.db, async (tx) => {
        const now = new Date();
        const row = await tx.pestoRegistration.findUnique({ where: { id: input.requestId } });
        if (
          !row ||
          row.expiresAt <= now ||
          !equalDigest(row.clientSecretHash, hash(input.clientSecret))
        )
          return null;
        const proof = codeDigest(key, row.id, input.code);
        if (row.verifiedAt) {
          if (
            !equalDigest(row.codeHash, proof) ||
            !row.ticketExpiresAt ||
            row.ticketExpiresAt <= now ||
            row.ticketConsumedAt
          )
            return null;
          const ticket = registrationTicket(key, row.id, row.codeNonce, row.clientSecretHash);
          if (!row.ticketHash || !equalDigest(row.ticketHash, hash(ticket))) return null;
          return {
            registrationTicket: ticket,
            expiresAt: row.ticketExpiresAt.toISOString(),
            canStartTrial: false,
          };
        }
        const attempted = await tx.pestoRegistration.updateMany({
          where: {
            id: row.id,
            verifiedAt: null,
            verificationAttempts: { lt: 5 },
            expiresAt: { gt: now },
          },
          data: { verificationAttempts: { increment: 1 } },
        });
        if (!attempted.count || !equalDigest(row.codeHash, proof)) return null;
        const customer = await tx.pestoCustomer.upsert({
          where: { email: row.email },
          update: {},
          create: {
            email: row.email,
            managerName: row.managerName,
            businessName: row.businessName,
            country: row.country,
            phone: row.phone,
            language: row.language,
            emailVerifiedAt: now,
          },
        });
        const ticket = registrationTicket(key, row.id, row.codeNonce, row.clientSecretHash);
        const expiresAt = new Date(now.getTime() + 15 * 60000);
        await tx.pestoRegistration.update({
          where: { id: row.id },
          data: {
            customerId: customer.id,
            verifiedAt: now,
            ticketHash: hash(ticket),
            ticketExpiresAt: expiresAt,
          },
        });
        return {
          registrationTicket: ticket,
          expiresAt: expiresAt.toISOString(),
          canStartTrial: false,
        };
      });
      // Throw after transaction commits so failed-code counters cannot roll back with the error.
      if (!result) throw new BadRequestException('Verification details are invalid or expired.');
      return result;
    } finally {
      key.fill(0);
    }
  }
}

/** Future trial issuance must consume this grant in the SAME transaction as the trial record. */
export async function consumePestoRegistration(
  tx: Prisma.TransactionClient,
  ticket: string,
  installationId: string,
  deviceHash: string,
  now = new Date(),
) {
  if (!/^[a-f0-9]{64}$/.test(ticket)) return null;
  const row = await tx.pestoRegistration.findUnique({ where: { ticketHash: hash(ticket) } });
  if (
    !row?.customerId ||
    !row.verifiedAt ||
    !row.ticketExpiresAt ||
    row.ticketExpiresAt <= now ||
    row.ticketConsumedAt ||
    row.installationId !== installationId ||
    row.deviceHash !== deviceHash
  )
    return null;
  const claimed = await tx.pestoRegistration.updateMany({
    where: { id: row.id, ticketConsumedAt: null, ticketExpiresAt: { gt: now } },
    data: { ticketConsumedAt: now },
  });
  return claimed.count
    ? { customerId: row.customerId, installationId: row.installationId, deviceHash: row.deviceHash }
    : null;
}
