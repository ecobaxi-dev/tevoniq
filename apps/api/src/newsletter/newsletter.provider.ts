import { Injectable, Inject } from '@nestjs/common';
import type { NewsletterStatus } from '@tevoniq/validation';
import { EmailTransport } from '../email/email-transport.js';
export type NewsletterContact = { id: string; email: string; name: string; language: string; source: string; status: NewsletterStatus; revision: number };
export type OptInMessage = { contact: NewsletterContact; confirmationUrl: string; unsubscribeUrl: string; idempotencyKey: string };
/** Implement this boundary for Brevo, Mailchimp, Resend or SendGrid; no vendor SDK is required. */
export abstract class NewsletterProvider {
  abstract readonly confirmationEnabled: boolean;
  abstract sendConfirmation(message: OptInMessage): Promise<void>;
  /** Adapters must respect revision ordering and suppress non-ACTIVE contacts. */
  abstract syncContact(contact: NewsletterContact, idempotencyKey: string): Promise<void>;
}
@Injectable()
export class GenericNewsletterProvider extends NewsletterProvider {
  constructor(@Inject(EmailTransport) private readonly email: EmailTransport) { super(); }
  get confirmationEnabled() { return this.email.enabled; }
  async sendConfirmation(message: OptInMessage) {
    const copy = message.contact.language === 'ar'
      ? ['تأكيد الاشتراك في نشرة TEVONIQ', 'أكّد اشتراكك خلال 48 ساعة:', 'إلغاء الاشتراك:']
      : message.contact.language === 'tr'
        ? ['TEVONIQ bülten aboneliğinizi onaylayın', 'Aboneliğinizi 48 saat içinde onaylayın:', 'Abonelikten çık:']
        : ['Confirm your TEVONIQ newsletter subscription', 'Confirm your subscription within 48 hours:', 'Unsubscribe:'];
    await this.email.send({ to: [message.contact.email], subject: copy[0]!, text: `${copy[1]}\n${message.confirmationUrl}\n\n${copy[2]}\n${message.unsubscribeUrl}`, messageId: `<newsletter-${message.idempotencyKey}@tevoniq.mail>` });
  }
  async syncContact(_contact: NewsletterContact, _idempotencyKey: string) {
    void _contact; void _idempotencyKey;
    // Generic provider keeps the local database authoritative. Vendor adapters may synchronize it.
  }
}
