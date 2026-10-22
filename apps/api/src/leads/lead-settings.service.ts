import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { defaultLeadSettings, leadSettingsSchema } from '@tevoniq/validation';
@Injectable()
export class LeadSettingsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(SiteSettingsService) private readonly site: SiteSettingsService,
  ) {}
  async get() {
    const row = await this.db.leadSettings.findUnique({ where: { id: 'default' } });
    const site = await this.site.read();
    const settings = row
      ? leadSettingsSchema.parse({ ...(row.value as object), version: row.version })
      : defaultLeadSettings;
    return site.version > 0
      ? { ...settings, notificationRecipients: site.settings.email.notificationRecipients }
      : settings;
  }
}
