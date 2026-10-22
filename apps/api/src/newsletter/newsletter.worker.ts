import { Injectable, Inject, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { NewsletterProvider, type NewsletterContact } from './newsletter.provider.js';
import { digest } from '../cms/password.js';
/** Persistent outbox: HTTP handlers only change state and enqueue work. */
@Injectable()
export class NewsletterWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private working = false;
  private readonly logger = new Logger(NewsletterWorker.name);
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService, @Inject(NewsletterProvider) private readonly provider: NewsletterProvider, @Inject(ConfigService) private readonly config: ConfigService) {}
  onModuleInit() { this.timer = setInterval(() => { void this.process().catch(() => this.logger.error('Newsletter queue failed')); }, 5000); this.timer.unref(); }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async process() {
    if (this.working) return;
    this.working = true;
    try {
      const now = new Date();
      await this.db.newsletterDeliveryJob.updateMany({ where: { status: 'RUNNING', attempts: { gte: 5 }, claimedAt: { lt: new Date(now.getTime() - 5 * 60000) } }, data: { status: 'FAILED', leaseId: null, lastError: 'Delivery lease expired after final attempt' } });
      await this.db.newsletterToken.deleteMany({ where: { expiresAt: { lte: now } } });
      const job = await this.db.newsletterDeliveryJob.findFirst({ where: { attempts: { lt: 5 }, ...(this.provider.confirmationEnabled ? {} : { kind: 'SYNC' }), OR: [{ status: 'PENDING', availableAt: { lte: now } }, { status: 'RUNNING', claimedAt: { lt: new Date(now.getTime() - 5 * 60000) } }] }, orderBy: { createdAt: 'asc' } });
      if (!job) return;
      const leaseId = randomUUID();
      const claim = await this.db.newsletterDeliveryJob.updateMany({ where: { id: job.id, status: job.status, attempts: job.attempts, leaseId: job.leaseId }, data: { status: 'RUNNING', leaseId, claimedAt: now, attempts: { increment: 1 } } });
      if (!claim.count) return;
      const owned = { id: job.id, leaseId, status: 'RUNNING' };
      try {
        const subscriber = await this.db.newsletterSubscriber.findUnique({ where: { id: job.subscriberId } });
        if (!subscriber || subscriber.generation !== job.generation || (job.kind === 'CONFIRM' && subscriber.status !== 'PENDING')) {
          await this.db.newsletterDeliveryJob.updateMany({ where: owned, data: { status: 'CANCELLED', leaseId: null } }); return;
        }
        const contact: NewsletterContact = { id: subscriber.id, email: subscriber.email, name: subscriber.name, language: subscriber.language, source: subscriber.source, status: subscriber.status, revision: subscriber.version };
        if (job.kind === 'CONFIRM') {
          const confirmation = randomBytes(32).toString('hex'), unsubscribe = randomBytes(32).toString('hex');
          await this.db.$transaction(async (tx) => {
            const valid = await tx.newsletterSubscriber.updateMany({ where: { id: subscriber.id, generation: job.generation, status: 'PENDING' }, data: { updatedAt: new Date() } });
            if (!valid.count) throw new Error('Subscription changed');
            await tx.newsletterToken.createMany({ data: [
              { subscriberId: subscriber.id, generation: job.generation, purpose: 'CONFIRM', tokenHash: digest(confirmation), expiresAt: new Date(Date.now() + 48 * 3600000) },
              { subscriberId: subscriber.id, generation: job.generation, purpose: 'UNSUBSCRIBE', tokenHash: digest(unsubscribe) },
            ] });
          });
          const link = (action: string, token: string) => { const url = new URL(`/${subscriber.language}/newsletter/${action}`, this.config.getOrThrow<string>('CORS_ORIGIN')); url.hash = `token=${token}`; return url.href; };
          await this.provider.sendConfirmation({ contact, confirmationUrl: link('confirm', confirmation), unsubscribeUrl: link('unsubscribe', unsubscribe), idempotencyKey: `${job.id}-${subscriber.version}` });
        } else await this.provider.syncContact(contact, job.id);
        await this.db.newsletterDeliveryJob.updateMany({ where: owned, data: { status: 'SENT', sentAt: new Date(), lastError: null, leaseId: null } });
      } catch {
        // Provider errors can contain recipient data or token URLs; store a safe generic message.
        await this.db.newsletterDeliveryJob.updateMany({ where: owned, data: { status: job.attempts + 1 >= 5 ? 'FAILED' : 'PENDING', leaseId: null, lastError: 'Provider delivery failed or subscription changed', availableAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts)) } });
      }
    } finally { this.working = false; }
  }
}
