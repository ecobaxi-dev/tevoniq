import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { digest } from '../cms/password.js';
import type { Prisma, NewsletterSubscriber } from '../generated/prisma/client.js';
export const subscriberSelect = { id: true, email: true, name: true, language: true, source: true, status: true, subscribedAt: true, unsubscribedAt: true, createdAt: true, version: true } as const;
export async function newsletterTransaction<T>(db: DatabaseService, fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  try { return await db.$transaction(fn, { isolationLevel: 'Serializable' }); }
  catch (error) {
    if (error && typeof error === 'object' && 'code' in error && ['P2002', 'P2034'].includes(String(error.code))) throw new ConflictException('Subscription changed. Please retry.');
    throw error;
  }
}
export async function queueContactSync(tx: Prisma.TransactionClient, subscriber: NewsletterSubscriber) {
  const dedupeKey = `SYNC:${subscriber.id}:${subscriber.generation}:${subscriber.version}`;
  await tx.newsletterDeliveryJob.upsert({ where: { dedupeKey }, create: { subscriberId: subscriber.id, generation: subscriber.generation, kind: 'SYNC', dedupeKey }, update: {} });
}
@Injectable()
export class NewsletterService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  async subscribe(input: { email: string; name: string; language: 'en' | 'tr' | 'ar'; source: string }, consentText: string) {
    await newsletterTransaction(this.db, async (tx) => {
      const prior = await tx.newsletterSubscriber.findUnique({ where: { email: input.email } });
      // Public requests cannot edit active records or reactivate bounced addresses.
      if (prior && ['ACTIVE', 'BOUNCED'].includes(prior.status)) return;
      const subscriber = prior
        ? await tx.newsletterSubscriber.update({ where: { id: prior.id, version: prior.version }, data: { ...input, status: 'PENDING', consentAt: new Date(), consentText, generation: prior.status === 'UNSUBSCRIBED' ? { increment: 1 } : prior.generation, version: { increment: 1 } } })
        : await tx.newsletterSubscriber.create({ data: { ...input, consentAt: new Date(), consentText } });
      const dedupeKey = `CONFIRM:${subscriber.id}:${subscriber.generation}`;
      const job = await tx.newsletterDeliveryJob.upsert({ where: { dedupeKey }, create: { subscriberId: subscriber.id, generation: subscriber.generation, kind: 'CONFIRM', dedupeKey }, update: {} });
      if (['SENT', 'FAILED'].includes(job.status))
        await tx.newsletterDeliveryJob.updateMany({ where: { id: job.id, status: job.status }, data: { status: 'PENDING', attempts: 0, availableAt: new Date(), lastError: null, claimedAt: null, leaseId: null } });
    });
    return { ok: true, message: 'If confirmation is needed, check your email to confirm your subscription.' };
  }
  async confirm(token: string) {
    return newsletterTransaction(this.db, async (tx) => {
      const stored = await tx.newsletterToken.findUnique({ where: { tokenHash: digest(token) } });
      if (!stored || stored.purpose !== 'CONFIRM' || !stored.expiresAt || stored.expiresAt <= new Date()) throw new BadRequestException('Confirmation link is invalid or expired. Subscribe again to request a new one.');
      const changed = await tx.newsletterSubscriber.updateMany({ where: { id: stored.subscriberId, generation: stored.generation, status: 'PENDING' }, data: { status: 'ACTIVE', subscribedAt: new Date(), unsubscribedAt: null, version: { increment: 1 } } });
      if (!changed.count) throw new BadRequestException('Confirmation link is invalid or expired');
      await tx.newsletterToken.deleteMany({ where: { subscriberId: stored.subscriberId, purpose: 'CONFIRM' } });
      await queueContactSync(tx, await tx.newsletterSubscriber.findUniqueOrThrow({ where: { id: stored.subscriberId } }));
      await tx.cmsAudit.create({ data: { actorId: 'newsletter-subscriber', entityId: stored.subscriberId, action: 'newsletter.confirm' } });
      return { ok: true };
    });
  }
  async unsubscribe(token: string) {
    return newsletterTransaction(this.db, async (tx) => {
      const stored = await tx.newsletterToken.findUnique({ where: { tokenHash: digest(token) } });
      if (!stored || stored.purpose !== 'UNSUBSCRIBE' || (stored.expiresAt && stored.expiresAt <= new Date())) return { ok: true };
      const changed = await tx.newsletterSubscriber.updateMany({ where: { id: stored.subscriberId, generation: stored.generation, status: { in: ['PENDING', 'ACTIVE'] } }, data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date(), generation: { increment: 1 }, version: { increment: 1 } } });
      if (changed.count) {
        await tx.newsletterToken.deleteMany({ where: { subscriberId: stored.subscriberId } });
        await queueContactSync(tx, await tx.newsletterSubscriber.findUniqueOrThrow({ where: { id: stored.subscriberId } }));
        await tx.cmsAudit.create({ data: { actorId: 'newsletter-subscriber', entityId: stored.subscriberId, action: 'newsletter.unsubscribe' } });
      }
      return { ok: true };
    });
  }
  async suppress(id: string, status: 'UNSUBSCRIBED' | 'BOUNCED', version: number, actorId: string) {
    return newsletterTransaction(this.db, async (tx) => {
      const changed = await tx.newsletterSubscriber.updateMany({ where: { id, version }, data: { status, ...(status === 'UNSUBSCRIBED' ? { unsubscribedAt: new Date() } : {}), generation: { increment: 1 }, version: { increment: 1 } } });
      if (!changed.count) throw new ConflictException('Subscriber changed. Reload first.');
      await tx.newsletterToken.deleteMany({ where: { subscriberId: id } });
      const subscriber = await tx.newsletterSubscriber.findUniqueOrThrow({ where: { id } });
      await queueContactSync(tx, subscriber);
      await tx.cmsAudit.create({ data: { actorId, entityId: id, action: `newsletter.${status.toLowerCase()}` } });
      return { ok: true };
    });
  }
}
