import { Controller, Get, Put, Body, Req, Inject, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { publicSiteSettings, siteSettingsWriteSchema } from '@tevoniq/validation';
import { SiteSettingsService } from './site-settings.service.js';
import { parse } from '../cms/content-policy.js';
import type { CmsRequest } from '../cms/cms.guard.js';
import { requirePermission } from '../cms/permissions.js';
@Controller('site-settings')
export class PublicSiteSettingsController {
  constructor(@Inject(SiteSettingsService) private readonly settings: SiteSettingsService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  async get() {
    return publicSiteSettings((await this.settings.read()).settings);
  }
}
@Controller('cms/site-settings')
export class CmsSiteSettingsController {
  constructor(
    @Inject(SiteSettingsService) private readonly settings: SiteSettingsService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  @Get()
  @Header('Cache-Control', 'private, no-store')
  async get(@Req() req: CmsRequest) {
    requirePermission(req, 'settings.read');
    return {
      ...(await this.settings.read()),
      deployment: {
        emailConfigured: ['smtp', 'resend'].includes(
          this.config.get<string>('EMAIL_TRANSPORT', 'disabled'),
        ),
        botProtectionEnabled: this.config.get('TURNSTILE_MODE') === 'turnstile',
        storageConfigured:
          !!this.config.get('MEDIA_STORAGE') && this.config.get('MEDIA_STORAGE') !== 'disabled',
        maxUploadMB: Math.floor(
          this.config.get<number>('MEDIA_MAX_FILE_BYTES', 10485760) / 1048576,
        ),
      },
    };
  }
  @Put()
  @Header('Cache-Control', 'private, no-store')
  save(@Body() body: unknown, @Req() req: CmsRequest) {
    requirePermission(req, 'settings.update');
    requirePermission(req, 'settings.publish');
    const input = parse(siteSettingsWriteSchema, body);
    return this.settings.save(input.settings, input.version, req.cmsUser.id);
  }
}
