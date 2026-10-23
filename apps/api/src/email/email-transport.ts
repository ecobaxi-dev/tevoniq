import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
export type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  html?: string;
  messageId: string;
  replyTo?: string;
};
export abstract class EmailTransport {
  abstract readonly enabled: boolean;
  abstract send(message: EmailMessage): Promise<void>;
}
export class ResendEmailTransport extends EmailTransport {
  readonly enabled = true;
  constructor(private readonly config: ConfigService) {
    super();
  }
  async send(message: EmailMessage) {
    // Keep the verified sender in server configuration. Visitor addresses are Reply-To only.
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.getOrThrow<string>('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': message.messageId.replace(/[<>]/g, ''),
      },
      body: JSON.stringify({
        from: `TEVONIQ <${this.config.getOrThrow<string>('EMAIL_FROM')}>`,
        to: message.to,
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {}),
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error('Resend delivery failed');
    const result = (await response.json()) as { id?: unknown };
    if (typeof result.id !== 'string' || !result.id) throw new Error('Invalid delivery response');
  }
}
export function emailTransportFactory(config: ConfigService, settings: SiteSettingsService) {
  return config.get('EMAIL_TRANSPORT') === 'resend'
    ? new ResendEmailTransport(config)
    : new SmtpEmailTransport(config, settings);
}
@Injectable()
export class SmtpEmailTransport extends EmailTransport {
  readonly enabled: boolean;
  private readonly transport: ReturnType<typeof nodemailer.createTransport> | null;
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SiteSettingsService) private readonly settings: SiteSettingsService,
  ) {
    super();
    this.enabled = config.get('EMAIL_TRANSPORT') === 'smtp';
    this.transport = this.enabled
      ? nodemailer.createTransport({
          host: config.getOrThrow<string>('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT', 587),
          secure: config.get('SMTP_SECURE') === 'true',
          requireTLS: config.get('SMTP_SECURE') !== 'true',
          ...(config.get('SMTP_USER')
            ? {
                auth: {
                  user: config.get<string>('SMTP_USER'),
                  pass: config.get<string>('SMTP_PASSWORD'),
                },
              }
            : {}),
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 20000,
          disableFileAccess: true,
          disableUrlAccess: true,
        })
      : null;
  }
  async send(message: EmailMessage) {
    if (!this.transport) throw new Error('Email delivery is not configured');
    const { settings } = await this.settings.read();
    const result = await this.transport.sendMail({
      ...message,
      from: {
        name: settings.email.senderName || settings.general.siteName,
        address: settings.email.senderEmail || this.config.getOrThrow<string>('EMAIL_FROM'),
      },
    });
    if (result.rejected.length) throw new Error('One or more recipients were rejected');
  }
}
