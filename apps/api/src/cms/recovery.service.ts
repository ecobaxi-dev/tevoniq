import { Injectable, Inject, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { EmailTransport } from '../email/email-transport.js';
import { digest } from './password.js';
/** Queue all addresses equally; account lookup and delivery happen outside the HTTP response. */
@Injectable()
export class RecoveryService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private working = false;
  private readonly logger = new Logger(RecoveryService.name);
  constructor(@Inject(DatabaseService) private db: DatabaseService, @Inject(EmailTransport) private email: EmailTransport, @Inject(ConfigService) private config: ConfigService) {}
  onModuleInit() {
    this.timer = setInterval(() => { void this.process().catch(() => this.logger.error('Recovery queue processing failed')); }, 2000);
    this.timer.unref();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async process() {
    if (this.working) return;
    this.working = true;
    try {
      const now = new Date();
      await this.db.cmsRecoveryJob.deleteMany({ where: { OR: [{ createdAt: { lt: new Date(now.getTime() - 30 * 60000) } }, { attempts: { gte: 3 }, claimedAt: { lt: new Date(now.getTime() - 60000) } }] } });
      await this.db.cmsPasswordReset.deleteMany({ where: { expiresAt: { lte: now } } });
      await this.db.loginThrottle.deleteMany({ where: { resetAt: { lte: now } } });
      const job = await this.db.cmsRecoveryJob.findFirst({ where: { attempts: { lt: 3 }, OR: [{ claimedAt: null }, { claimedAt: { lt: new Date(now.getTime() - 60000) } }] }, orderBy: { createdAt: 'asc' } });
      if (!job) return;
      const claimed = await this.db.cmsRecoveryJob.updateMany({ where: { id: job.id, attempts: job.attempts, claimedAt: job.claimedAt }, data: { claimedAt: now, attempts: { increment: 1 } } });
      if (!claimed.count) return;
      const user = await this.db.cmsUser.findUnique({ where: { email: job.email } });
      if (user && !user.disabled && this.email.enabled) {
        const token = randomBytes(32).toString('hex');
        const value = { tokenHash: digest(token), authVersion: user.authVersion, expiresAt: new Date(Date.now() + 30 * 60000) };
        await this.db.cmsPasswordReset.upsert({ where: { userId: user.id }, create: { userId: user.id, ...value }, update: value });
        const url = new URL('/auth/reset-password', this.config.getOrThrow<string>('CORS_ORIGIN'));
        url.hash = `reset=${token}`;
        await this.email.send({ to: [user.email], subject: 'Reset your TEVONIQ password', text: `Open this link to reset your administrator password within 30 minutes:\n\n${url}\n\nIf you did not request this, you can ignore this email.`, messageId: `<${randomUUID()}@tevoniq.auth>` });
      }
      await this.db.cmsRecoveryJob.deleteMany({ where: { id: job.id } });
    } finally { this.working = false; }
  }
}
