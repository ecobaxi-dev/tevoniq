import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service.js';
import { EmailTransport, type EmailMessage } from './email-transport.js';
import { LeadSettingsService } from '../leads/lead-settings.service.js';
import { confirmationHtml } from './confirmation-template.js';
@Injectable()
export class LeadEmailWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(LeadEmailWorker.name);
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(EmailTransport) private readonly transport: EmailTransport,
    @Inject(LeadSettingsService) private readonly settings: LeadSettingsService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.flush().catch(() => this.logger.error('Lead email queue processing failed'));
    }, 15000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async flush() {
    if (this.running) return;
    this.running = true;
    try {
      await this.db.leadThrottle.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      if (!this.transport.enabled) return;
      const settings = await this.settings.get();
      const jobs = await this.db.leadEmail.findMany({
        where: {
          status: 'pending',
          ...(settings.notificationRecipients.length ? {} : { kind: 'confirmation' }),
          nextAttemptAt: { lte: new Date() },
          OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
        },
        orderBy: { createdAt: 'asc' },
        take: 20,
        include: { lead: true },
      });
      for (const job of jobs) {
        if (job.kind === 'notification' && !settings.notificationRecipients.length) continue;
        const claimed = await this.db.leadEmail.updateMany({
          where: {
            id: job.id,
            status: 'pending',
            OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
          },
          data: { lockedUntil: new Date(Date.now() + 120000), attempts: { increment: 1 } },
        });
        if (!claimed.count) continue;
        try {
          const current = await this.db.lead.findUniqueOrThrow({ where: { id: job.leadId } });
          if (current.deletedAt || current.status === 'SPAM') {
            await this.db.leadEmail.update({
              where: { id: job.id },
              data: { status: 'cancelled', lockedUntil: null },
            });
            continue;
          }
          const lead = current;
          const confirmation = {
            en: {
              subject: 'We received your enquiry — TEVONIQ',
              text: `Hello ${lead.name},\n\nThank you for contacting TEVONIQ. We have received your ${lead.type === 'quote' ? 'quote request' : 'message'}. Our team will review it and follow up using the contact details you provided.\n\nReference: ${lead.id}\n\nTEVONIQ`,
            },
            tr: {
              subject: 'Talebinizi aldık — TEVONIQ',
              text: `Merhaba ${lead.name},\n\nTEVONIQ ile iletişime geçtiğiniz için teşekkür ederiz. Talebinizi aldık. Ekibimiz inceleyerek paylaştığınız iletişim bilgileri üzerinden size dönüş yapacaktır.\n\nReferans: ${lead.id}\n\nTEVONIQ`,
            },
            ar: {
              subject: 'تم استلام طلبك — TEVONIQ',
              text: `مرحبًا ${lead.name}،\n\nشكرًا لتواصلك مع TEVONIQ. لقد استلمنا طلبك وسيراجعه فريقنا ويتواصل معك باستخدام بيانات الاتصال التي قدمتها.\n\nالمرجع: ${lead.id}\n\nTEVONIQ`,
            },
          }[lead.language];
          const message: EmailMessage =
            job.kind === 'confirmation'
              ? {
                  to: [lead.email],
                  ...confirmation,
                  ...(lead.language === 'en'
                    ? {
                        html: confirmationHtml({
                          name: lead.name,
                          reference: lead.id,
                          quote: lead.type === 'quote',
                          origin: this.config.getOrThrow<string>('CORS_ORIGIN'),
                        }),
                      }
                    : {}),
                  ...(settings.notificationRecipients[0]
                    ? { replyTo: settings.notificationRecipients[0] }
                    : {}),
                  messageId: `<${job.id}@${new URL(this.config.getOrThrow<string>('CORS_ORIGIN')).hostname}>`,
                }
              : {
                  to: settings.notificationRecipients,
                  subject: `New ${lead.type === 'quote' ? 'quote request' : 'contact enquiry'} — TEVONIQ`,
                  replyTo: lead.email,
                  text: `A new enquiry has been received.\n\nName: ${lead.name}\nCompany: ${lead.company}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nCountry: ${lead.country}\nSource: ${lead.sourcePage}\n\nReview the lead securely: ${this.config.getOrThrow<string>('CORS_ORIGIN')}/admin/leads?lead=${lead.id}\n\nAttachments are available only in the admin panel.`,
                  messageId: `<${job.id}@${new URL(this.config.getOrThrow<string>('CORS_ORIGIN')).hostname}>`,
                };
          await this.transport.send(message);
          await this.db.$transaction([
            this.db.leadEmail.update({
              where: { id: job.id },
              data: { status: 'sent', sentAt: new Date(), lockedUntil: null, lastError: null },
            }),
            this.db.leadActivity.create({
              data: { leadId: lead.id, action: `email.${job.kind}.sent` },
            }),
          ]);
        } catch {
          // Transport errors may contain credentials or message content; retain only a safe summary.
          await this.db.$transaction([
            this.db.leadEmail.update({
              where: { id: job.id },
              data: {
                status: job.attempts + 1 >= 5 ? 'failed' : 'pending',
                lockedUntil: null,
                lastError: 'Delivery failed. Check email transport configuration.',
                nextAttemptAt: new Date(Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts)),
              },
            }),
            this.db.leadActivity.create({
              data: {
                leadId: job.leadId,
                action: `email.${job.kind}.${job.attempts + 1 >= 5 ? 'failed' : 'retry-scheduled'}`,
                note: 'Delivery failed. Check email transport configuration.',
              },
            }),
          ]);
        }
      }
    } finally {
      this.running = false;
    }
  }
}
