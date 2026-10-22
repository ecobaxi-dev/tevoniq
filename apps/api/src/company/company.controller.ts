import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  Req,
  Inject,
  UseGuards,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { companySlugSchema, companyWriteSchema, defaultCompanyContent } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { hasPermission } from '@tevoniq/validation';
import { CmsGuard, CmsAdminGuard, type CmsRequest } from '../cms/cms.guard.js';
import { parse, localeQuerySchema } from '../cms/content-policy.js';

@Controller('company')
export class CompanyController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get(':slug')
  async get(@Param('slug') raw: string, @Query() query: unknown) {
    const slug = parse(companySlugSchema, raw),
      { locale } = parse(localeQuerySchema, query);
    const page = await this.db.companyPage.findUnique({ where: { slug_locale: { slug, locale } } });
    if (page && !page.published) throw new NotFoundException();
    if (!page && locale !== 'en') throw new NotFoundException();
    return page?.content ?? defaultCompanyContent(slug);
  }
}

@Controller('cms/company')
@UseGuards(CmsGuard)
export class CmsCompanyController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get(':slug')
  async get(@Param('slug') raw: string, @Query() query: unknown) {
    const slug = parse(companySlugSchema, raw),
      { locale } = parse(localeQuerySchema, query);
    return (
      (await this.db.companyPage.findUnique({ where: { slug_locale: { slug, locale } } })) ?? {
        slug,
        locale,
        content: defaultCompanyContent(slug),
        published: false,
        version: 0,
      }
    );
  }
  @Put(':slug')
  @UseGuards(CmsAdminGuard)
  async save(
    @Param('slug') raw: string,
    @Query() query: unknown,
    @Body() body: unknown,
    @Req() req: CmsRequest,
  ) {
    const slug = parse(companySlugSchema, raw),
      { locale } = parse(localeQuerySchema, query);
    const data = parse(companyWriteSchema, body);
    return this.db.$transaction(async (tx) => {
      if (data.version === 0) {
        const created = await tx.companyPage.createMany({
          data: [
            {
              slug,
              locale,
              content: data.content,
              published: data.published,
              createdById: req.cmsUser.id,
              updatedById: req.cmsUser.id,
            },
          ],
          skipDuplicates: true,
        });
        if (!created.count) throw new ConflictException('Page changed. Reload before saving.');
      } else {
        const updated = await tx.companyPage.updateMany({
          where: { slug, locale, version: data.version, ...(!hasPermission(req.cmsUser.role, 'pages.publish') ? { published: false } : {}) },
          data: {
            content: data.content,
            published: data.published,
            updatedById: req.cmsUser.id,
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException('Page changed. Reload before saving.');
      }
      await tx.cmsAudit.create({
        data: {
          actorId: req.cmsUser.id,
          entityId: `company/${slug}/${locale}`,
          action: data.published ? 'company.publish' : 'company.save-draft',
        },
      });
      return tx.companyPage.findUniqueOrThrow({ where: { slug_locale: { slug, locale } } });
    });
  }
}
