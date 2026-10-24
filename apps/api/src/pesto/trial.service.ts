import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { trialInputSchema } from '@tevoniq/validation';
export { trialInputSchema } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { consumePestoRegistration } from './registration.service.js';
import { hash } from './registration-protocol.js';
import { readTrialKey, signTrial } from './trial-signing.js';

@Injectable()
export class PestoTrialService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  ensureEnabled() {
    if (
      this.config.get<string>('PESTO_TRIAL_ENABLED') !== 'true' ||
      this.config.get<string>('PESTO_REGISTRATION_ENABLED') !== 'true'
    )
      throw new ServiceUnavailableException('Pesto trials are not available yet.');
  }

  async issue(raw: unknown) {
    this.ensureEnabled();
    const parsed = trialInputSchema.safeParse(raw);
    if (!parsed.success) throw new BadRequestException('Invalid trial request.');
    const input = parsed.data;
    let key;
    const keyId = this.config.get<string>('PESTO_LICENSE_KEY_ID');
    try {
      if (!keyId || !/^[A-Za-z0-9_-]{1,80}$/.test(keyId)) throw new Error();
      key = readTrialKey(this.config.get<string>('PESTO_LICENSE_PRIVATE_KEY') ?? '');
    } catch {
      throw new ServiceUnavailableException('Trial signing is not configured.');
    }
    try {
      return await this.db.$transaction(
        async (tx) => {
          const now = new Date();
          const registration = await tx.pestoRegistration.findUnique({
            where: { ticketHash: hash(input.registrationTicket) },
          });
          if (
            !registration?.customerId ||
            !registration.verifiedAt ||
            registration.installationId !== input.installationId ||
            registration.deviceHash !== input.deviceHash
          )
            throw new BadRequestException('Registration proof is invalid or expired.');
          // A lost HTTP response may be recovered with the same proof for a bounded period.
          // A grant exists only if this ticket was consumed by a committed trial transaction.
          const grant = await tx.pestoTrialGrant.findUnique({
            where: { registrationId: registration.id },
            include: { trial: true },
          });
          if (grant) {
            if (grant.retryUntil <= now)
              throw new BadRequestException('Registration proof is invalid or expired.');
            return this.response(grant.trial.envelope, grant.trial.expiresAt, now);
          }
          const enrollment = await consumePestoRegistration(
            tx,
            input.registrationTicket,
            input.installationId,
            input.deviceHash,
            now,
          );
          if (!enrollment)
            throw new BadRequestException('Registration proof is invalid or expired.');
          // Both identities are unique. A changed installation cannot reset this device's dates.
          const existing = await tx.pestoTrial.findFirst({
            where: {
              OR: [{ deviceHash: input.deviceHash }, { installationId: input.installationId }],
            },
          });
          if (
            existing &&
            (existing.customerId !== enrollment.customerId ||
              existing.installationId !== input.installationId ||
              existing.deviceHash !== input.deviceHash)
          )
            throw new ConflictException(
              'This device or installation already has a trial. Contact support for recovery.',
            );
          const trial =
            existing ??
            (await tx.pestoTrial.create({
              data: {
                id: randomUUID(),
                customerId: enrollment.customerId,
                registrationId: registration.id,
                installationId: input.installationId,
                deviceHash: input.deviceHash,
                issuedAt: now,
                expiresAt: new Date(now.getTime() + 15 * 86400000),
                // Updated within the transaction before any response is returned.
                envelope: '',
              },
            }));
          const envelope =
            existing?.envelope ??
            signTrial(key, keyId, {
              licenseId: trial.id,
              registrationId: trial.registrationId,
              installationId: trial.installationId,
              deviceHash: trial.deviceHash,
              issuedAt: trial.issuedAt,
              expiresAt: trial.expiresAt,
            });
          if (!existing)
            await tx.pestoTrial.update({ where: { id: trial.id }, data: { envelope } });
          await tx.pestoTrialGrant.create({
            data: {
              registrationId: registration.id,
              trialId: trial.id,
              retryUntil: new Date(now.getTime() + 15 * 60000),
            },
          });
          return this.response(envelope, trial.expiresAt, now);
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        ['P2002', 'P2034'].includes(String(error.code))
      )
        throw new ConflictException('Trial enrollment changed. Retry the same request.');
      throw error;
    }
  }
  private response(permit: string, expiry: Date, now: Date) {
    return {
      permit,
      expiresAt: expiry.toISOString(),
      status: expiry <= now ? 'expired' : 'trial-active',
    };
  }
}
