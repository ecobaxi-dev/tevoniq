import { safeRequestLog, safeErrorLog } from './security/logging.js';
import { SiteSettingsService } from './site-settings/site-settings.service.js';
import {
  PublicSiteSettingsController,
  CmsSiteSettingsController,
} from './site-settings/site-settings.controller.js';
import { SearchController } from './search/search.controller.js';
import { SeoController } from './seo/seo.controller.js';
import { SearchProvider, PostgresSearchProvider } from './search/search.provider.js';
import { ProjectsController, CmsProjectsController } from './projects/projects.controller.js';
import { CareersController, CmsCareersController } from './careers/careers.controller.js';
import { CvSecurity } from './careers/cv-security.js';
import {
  NewsletterController,
  CmsNewsletterController,
} from './newsletter/newsletter.controller.js';
import { NewsletterService } from './newsletter/newsletter.service.js';
import { NewsletterWorker } from './newsletter/newsletter.worker.js';
import { NewsletterProvider, GenericNewsletterProvider } from './newsletter/newsletter.provider.js';
import { MediaController, PublicMediaController } from './media/media.controller.js';
import { StorageProvider, storageFactory } from './media/storage.js';
import { ConfigService } from '@nestjs/config';
import {
  PublicPagesController,
  PageBuilderController,
} from './page-builder/page-builder.controller.js';
import { LeadsController, CmsLeadsController } from './leads/leads.controller.js';
import { LeadSettingsService } from './leads/lead-settings.service.js';
import { LeadBotProtection, LeadSubmissionGuard } from './leads/bot-protection.js';
import { EmailTransport, emailTransportFactory } from './email/email-transport.js';
import { LeadEmailWorker } from './email/lead-email.worker.js';
import { AdminController } from './admin/admin.controller.js';
import { InsightsController, CmsInsightsController } from './insights/insights.controller.js';
import { CompanyController, CmsCompanyController } from './company/company.controller.js';
import { HomeController, CmsHomeController } from './company/home.controller.js';
import { PublicNavigationController } from './company/navigation.controller.js';
import {
  IndustriesController,
  CmsIndustriesController,
} from './industries/industries.controller.js';
import { ServicesController, CmsServicesController } from './services/services.controller.js';
import { SolutionsController, CmsSolutionsController } from './solutions/solutions.controller.js';
import { CmsAuthController } from './cms/auth.controller.js';
import { CmsGuard, CmsAdminGuard } from './cms/cms.guard.js';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RecoveryService } from './cms/recovery.service.js';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validateEnvironment } from './config/environment.js';
import { DatabaseService } from './database/database.service.js';
import { HealthController } from './health/health.controller.js';
import { PestoRegistrationController } from './pesto/registration.controller.js';
import { PestoTrialService } from './pesto/trial.service.js';
import { PestoRegistrationService } from './pesto/registration.service.js';
import { PestoRegistrationWorker } from './pesto/registration.worker.js';
import { PestoPurchaseService } from './pesto/purchase.service.js';
import {
  CmsPestoPurchaseController,
  PublicPestoPurchaseController,
} from './pesto/purchase.controller.js';
import { PestoLicenseDeliveryWorker } from './pesto/license-delivery.worker.js';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        serializers: { req: safeRequestLog, err: safeErrorLog },
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["x-lead-ip-signature"]',
          'res.headers["set-cookie"]',
        ],
      },
    }),
  ],
  controllers: [
    CmsPestoPurchaseController,
    PublicPestoPurchaseController,
    PestoRegistrationController,
    PublicSiteSettingsController,
    CmsSiteSettingsController,
    SeoController,
    SearchController,
    CareersController,
    NewsletterController,
    CmsNewsletterController,
    CmsCareersController,
    MediaController,
    PublicMediaController,
    PublicPagesController,
    PageBuilderController,
    LeadsController,
    CmsLeadsController,
    AdminController,
    InsightsController,
    CmsInsightsController,
    CompanyController,
    CmsCompanyController,
    HomeController,
    CmsHomeController,
    PublicNavigationController,
    HealthController,
    ProjectsController,
    CmsProjectsController,
    IndustriesController,
    CmsIndustriesController,
    ServicesController,
    CmsServicesController,
    SolutionsController,
    CmsSolutionsController,
    CmsAuthController,
  ],
  providers: [
    PestoPurchaseService,
    PestoLicenseDeliveryWorker,
    PestoTrialService,
    PestoRegistrationService,
    PestoRegistrationWorker,
    SiteSettingsService,
    { provide: SearchProvider, useClass: PostgresSearchProvider },
    CvSecurity,
    NewsletterService,
    NewsletterWorker,
    { provide: NewsletterProvider, useClass: GenericNewsletterProvider },
    { provide: StorageProvider, useFactory: storageFactory, inject: [ConfigService] },
    DatabaseService,
    CmsGuard,
    RecoveryService,
    { provide: APP_GUARD, useExisting: CmsGuard },
    CmsAdminGuard,
    LeadSettingsService,
    LeadBotProtection,
    LeadSubmissionGuard,
    LeadEmailWorker,
    {
      provide: EmailTransport,
      useFactory: emailTransportFactory,
      inject: [ConfigService, SiteSettingsService],
    },
  ],
})
export class AppModule {}
