import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
export type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  messageId: string;
  replyTo?: string;
};
export abstract class EmailTransport {
  abstract readonly enabled: boolean;
  abstract send(message: EmailMessage): Promise<void>;
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
