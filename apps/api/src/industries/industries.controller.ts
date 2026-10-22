import { archiveCatalog } from '../admin/catalog-archive.js';
import { safeProjectReferences } from '../projects/project-public.js';
import { publicSolutionWhere } from '../solutions/solutions.controller.js';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Req,
  Inject,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Header,
} from '@nestjs/common';
import {
  industryQuerySchema,
  industryWriteSchema,
  industryTranslationSchema,
  serviceSlugSchema,
} from '@tevoniq/validation';
import type { IndustryBlock } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { CmsGuard, CmsAdminGuard } from '../cms/cms.guard.js';
import type { CmsRequest } from '../cms/cms.guard.js';
import {
  parse,
  idSchema,
  versionSchema,
  localeQuerySchema,
  publicServiceWhere,
  publicProjectWhere,
  reordered,
} from '../cms/content-policy.js';
import type { Prisma, Locale } from '../generated/prisma/client.js';

export const publicIndustryWhere = (locale: Locale): Prisma.IndustryWhereInput => ({
  active: true,
  published: true,
  status: 'PUBLISHED',
  translations: { some: { locale, published: true } },
});
const include = {
  translations: true,
  services: { orderBy: { sortOrder: 'asc' as const } },
  solutions: { orderBy: { industrySortOrder: 'asc' as const } },
  projects: { orderBy: { sortOrder: 'asc' as const } },
};
type Row = Prisma.IndustryGetPayload<{ include: typeof include }>;
function cmsRecord(row: Row) {
  const { services, solutions, projects, ...data } = row;
  return {
    ...data,
    serviceIds: services.map((r) => r.serviceId),
    solutionIds: solutions.map((r) => r.solutionId),
    projectIds: projects.map((r) => r.projectId),
  };
}
@Controller('industries')
export class IndustriesController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  async list(@Query() query: unknown) {
    const { locale, page, limit, q, featured, service } = parse(industryQuerySchema, query);
    const where: Prisma.IndustryWhereInput = {
      ...publicIndustryWhere(locale),
      ...(featured ? { featured: featured === 'true' } : {}),
      ...(q
        ? {
            translations: {
              some: { locale, published: true, name: { contains: q, mode: 'insensitive' } },
            },
          }
        : {}),
      ...(service
        ? { services: { some: { service: { ...publicServiceWhere(locale), slug: service } } } }
        : {}),
    };
    const [rows, total] = await this.db.$transaction([
      this.db.industry.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { slug: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
      this.db.industry.count({ where }),
    ]);
    return {
      items: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        featured: r.featured,
        name: r.translations[0]!.name,
        shortDescription: r.translations[0]!.shortDescription,
      })),
      total,
      page,
      limit,
    };
  }
  @Get(':slug')
  @Header('Cache-Control', 'no-store')
  async detail(@Param('slug') raw: string, @Query() query: unknown) {
    const slug = serviceSlugSchema.safeParse(raw);
    if (!slug.success) throw new NotFoundException();
    const { locale } = parse(localeQuerySchema, query);
    const row = await this.db.industry.findFirst({
      where: { ...publicIndustryWhere(locale), slug: slug.data },
      include: { ...include, translations: { where: { published: true } } },
    });
    if (!row) throw new NotFoundException();
    return this.present(row, locale);
  }
  async present(row: Row, locale: Locale, preview = false) {
    const translation = row.translations.find((t) => t.locale === locale);
    if (!translation) throw new NotFoundException();
    const content = {
      locale: translation.locale,
      name: translation.name,
      shortDescription: translation.shortDescription,
      published: translation.published,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      blocks: translation.blocks,
    };
    const parsed = industryTranslationSchema.safeParse(content);
    if (!parsed.success) throw new NotFoundException();
    const [services, projects, solutions] = await Promise.all([
      this.db.service.findMany({
        where: { ...publicServiceWhere(locale), id: { in: row.services.map((r) => r.serviceId) } },
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
      this.db.project.findMany({
        where: { ...publicProjectWhere(locale), id: { in: row.projects.map((r) => r.projectId) } },
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
      this.db.solution.findMany({
        where: {
          ...publicSolutionWhere(locale),
          id: { in: row.solutions.map((r) => r.solutionId) },
          translations: { some: { locale, published: true } },
        },
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
    ]);
    const cards = (rows: typeof services | typeof projects) =>
      rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.translations[0]!.title,
        summary: r.translations[0]!.summary,
      }));
    const ordered = <T extends { id: string }>(items: T[], ids: string[]) =>
      ids.flatMap((id) => items.filter((r) => r.id === id));
    return {
      id: row.id,
      slug: row.slug,
      featured: row.featured,
      locale,
      name: content.name,
      shortDescription: content.shortDescription,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      blocks: parsed.data.blocks,
      availableLocales: preview
        ? []
        : row.translations.filter((t) => t.published).map((t) => t.locale),
      services: ordered(
        cards(services),
        row.services.map((r) => r.serviceId),
      ),
      projects: ordered(
        safeProjectReferences(projects, locale),
        row.projects.map((r) => r.projectId),
      ),
      solutions: ordered(
        solutions.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.translations[0]!.name,
          summary: r.translations[0]!.shortDescription,
        })),
        row.solutions.map((r) => r.solutionId),
      ),
    };
  }
}
@Controller('cms/industries')
@UseGuards(CmsGuard)
export class CmsIndustriesController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  async list(@Query() query: unknown) {
    const { q, page, limit } = parse(industryQuerySchema, query);
    const where: Prisma.IndustryWhereInput = q
      ? {
          OR: [
            { slug: { contains: q, mode: 'insensitive' } },
            { translations: { some: { name: { contains: q, mode: 'insensitive' } } } },
          ],
        }
      : {};
    where.deletedAt = null;
    const [rows, total] = await this.db.$transaction([
      this.db.industry.findMany({
        where,
        include,
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.industry.count({ where }),
    ]);
    return { items: rows.map(cmsRecord), total, page, limit };
  }
  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async detail(@Param('id') raw: string) {
    const row = await this.db.industry.findUnique({ where: { id: parse(idSchema, raw) }, include });
    if (!row) throw new NotFoundException();
    return cmsRecord(row);
  }
  @Get(':id/preview')
  @Header('Cache-Control', 'private, no-store')
  async preview(@Param('id') raw: string, @Query() query: unknown) {
    const row = await this.db.industry.findUnique({ where: { id: parse(idSchema, raw) }, include });
    if (!row) throw new NotFoundException();
    return new IndustriesController(this.db).present(
      row,
      parse(localeQuerySchema, query).locale,
      true,
    );
  }
  @Get(':id/audit')
  @Header('Cache-Control', 'private, no-store')
  async audit(@Param('id') raw: string, @Query() query: unknown) {
    const entityId = parse(idSchema, raw);
    const { page, limit } = parse(industryQuerySchema, query);
    const where = { entityId, action: { startsWith: 'industry.' } };
    const [items, total] = await this.db.$transaction([
      this.db.cmsAudit.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.cmsAudit.count({ where }),
    ]);
    return { items, total, page, limit };
  }
  @Post()
  @UseGuards(CmsAdminGuard)
  create(@Body() body: unknown, @Req() req: CmsRequest) {
    return this.save(undefined, body, req.cmsUser.id);
  }
  @Put(':id')
  @UseGuards(CmsAdminGuard)
  update(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    return this.save(parse(idSchema, raw), body, req.cmsUser.id);
  }
  @Delete(':id')
  @UseGuards(CmsAdminGuard)
  async remove(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const id = parse(idSchema, raw),
      { version } = parse(versionSchema, body);
    return this.db.$transaction(async (tx) => {
      return archiveCatalog(tx, 'industry', id, version, req.cmsUser.id);
    });
  }
  private async save(id: string | undefined, body: unknown, actorId: string) {
    const value = parse(industryWriteSchema, body);
    if (!id && value.version !== 0)
      throw new BadRequestException('New records must start at version 0');
    try {
      return await this.db.$transaction(async (tx) => {
        const before = id ? await tx.industry.findUnique({ where: { id }, include }) : null;
        const data = {
          slug: value.slug,
          status: value.status,
          active: value.active,
          published: value.published,
          featured: value.featured,
          sortOrder: value.sortOrder,
          updatedById: actorId,
        };
        let target = id;
        if (target) {
          const changed = await tx.industry.updateMany({
            where: { id: target, version: value.version, deletedAt: null },
            data: { ...data, version: { increment: 1 } },
          });
          if (changed.count !== 1)
            throw new ConflictException('The industry changed. Reload before saving.');
        } else target = (await tx.industry.create({ data: { ...data, createdById: actorId } })).id;
        await tx.industryTranslation.deleteMany({
          where: { industryId: target, locale: { notIn: value.translations.map((t) => t.locale) } },
        });
        for (const t of value.translations) {
          const data = { ...t, blocks: t.blocks as unknown as Prisma.InputJsonValue };
          await tx.industryTranslation.upsert({
            where: { industryId_locale: { industryId: target, locale: t.locale } },
            create: { ...data, industryId: target },
            update: data,
          });
        }
        await tx.industryService.deleteMany({ where: { industryId: target } });
        await tx.industryService.createMany({
          data: value.serviceIds.map((serviceId, sortOrder) => ({
            industryId: target!,
            serviceId,
            sortOrder,
          })),
        });
        // Keep the same join rows used by Solutions; each side owns its display order.
        await tx.solutionIndustry.deleteMany({
          where: { industryId: target, solutionId: { notIn: value.solutionIds } },
        });
        for (const [industrySortOrder, solutionId] of value.solutionIds.entries()) {
          await tx.solutionIndustry.upsert({
            where: { solutionId_industryId: { solutionId, industryId: target } },
            create: { solutionId, industryId: target, industrySortOrder },
            update: { industrySortOrder },
          });
        }
        const previousSolutions = before?.solutions.map((r) => r.solutionId) ?? [];
        const changedSolutions = [...new Set([...previousSolutions, ...value.solutionIds])].filter(
          (id) => previousSolutions.includes(id) !== value.solutionIds.includes(id),
        );
        if (changedSolutions.length)
          await tx.solution.updateMany({
            where: { id: { in: changedSolutions } },
            data: { version: { increment: 1 } },
          });
        await tx.industryProject.deleteMany({
          where: { industryId: target, projectId: { notIn: value.projectIds } },
        });
        for (const [sortOrder, projectId] of value.projectIds.entries())
          await tx.industryProject.upsert({
            where: { industryId_projectId: { industryId: target, projectId } },
            create: { industryId: target, projectId, sortOrder },
            update: { sortOrder },
          });
        const oldProjects = before?.projects.map((r) => r.projectId) ?? [];
        const changedProjects = [...new Set([...oldProjects, ...value.projectIds])].filter(
          (id) => oldProjects.includes(id) !== value.projectIds.includes(id),
        );
        if (changedProjects.length)
          await tx.project.updateMany({
            where: { id: { in: changedProjects } },
            data: { version: { increment: 1 } },
          });
        const actions = [id ? 'industry.update' : 'industry.create'];
        for (const [key, yes, no] of [
          ['active', 'activate', 'deactivate'],
          ['published', 'publish', 'unpublish'],
          ['featured', 'feature', 'unfeature'],
        ] as const)
          if ((before?.[key] ?? false) !== value[key])
            actions.push(`industry.${value[key] ? yes : no}`);
        if (before && before.sortOrder !== value.sortOrder) actions.push('industry.reorder');
        for (const locale of ['en', 'tr', 'ar'] as const) {
          const oldT = before?.translations.find((t) => t.locale === locale),
            nextT = value.translations.find((t) => t.locale === locale);
          if ((oldT?.published ?? false) !== (nextT?.published ?? false))
            actions.push(`industry.${nextT?.published ? 'publish' : 'unpublish'}.${locale}`);
          if (
            oldT &&
            nextT &&
            reordered(
              (oldT.blocks as unknown as IndustryBlock[]).map((b) => b.content.id),
              nextT.blocks.map((b) => b.content.id),
            )
          )
            actions.push(`industry.reorder.${locale}`);
        }
        if (
          JSON.stringify(before?.services.map((r) => r.serviceId) ?? []) !==
          JSON.stringify(value.serviceIds)
        )
          actions.push('industry.services.update');
        if (
          before &&
          reordered(
            before.services.map((r) => r.serviceId),
            value.serviceIds,
          )
        )
          actions.push('industry.services.reorder');
        if (
          JSON.stringify(before?.solutions.map((r) => r.solutionId) ?? []) !==
          JSON.stringify(value.solutionIds)
        )
          actions.push('industry.solutions.update');
        if (
          JSON.stringify(before?.projects.map((r) => r.projectId) ?? []) !==
          JSON.stringify(value.projectIds)
        )
          actions.push('industry.projects.update');
        await tx.cmsAudit.createMany({
          data: actions.map((action) => ({ actorId, entityId: target!, action })),
        });
        return cmsRecord(await tx.industry.findUniqueOrThrow({ where: { id: target }, include }));
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2002')
          throw new ConflictException('This industry slug is already in use');
        if (error.code === 'P2003')
          throw new BadRequestException(
            'A linked record no longer exists. Reload the relationships.',
          );
      }
      throw error;
    }
  }
}
