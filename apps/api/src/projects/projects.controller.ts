import { archiveCatalog } from '../admin/catalog-archive.js';
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
  Header,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { projectQuerySchema, projectWriteSchema, projectSlugSchema } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { CmsGuard, CmsAdminGuard } from '../cms/cms.guard.js';
import type { CmsRequest } from '../cms/cms.guard.js';
import {
  parse,
  idSchema,
  versionSchema,
  localeQuerySchema,
  publicProjectWhere,
  publicServiceWhere,
  publicIndustryWhere,
} from '../cms/content-policy.js';
import { publicSolutionWhere } from '../solutions/solutions.controller.js';
import { projectCard, projectContent } from './project-public.js';
import { Prisma, type Locale } from '../generated/prisma/client.js';

const include = {
  translations: true,
  industries: { orderBy: { projectSortOrder: 'asc' as const } },
  services: { orderBy: { sortOrder: 'asc' as const } },
  solutions: { orderBy: { projectSortOrder: 'asc' as const } },
};
type Row = Prisma.ProjectGetPayload<{ include: typeof include }>;
function cmsRecord(row: Row) {
  const { industries, services, solutions, ...data } = row;
  return {
    ...data,
    projectDate: row.projectDate?.toISOString().slice(0, 10) ?? null,
    industryIds: industries.map((r) => r.industryId),
    serviceIds: services.map((r) => r.serviceId),
    solutionIds: solutions.map((r) => r.solutionId),
  };
}

@Controller('projects')
export class ProjectsController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(@Query() query: unknown) {
    const { locale, q, industry, service, solution, featured, page, limit } = parse(
      projectQuerySchema,
      query,
    );
    const where: Prisma.ProjectWhereInput = {
      ...publicProjectWhere(locale),
      ...(q
        ? {
            translations: {
              some: { locale, published: true, title: { contains: q, mode: 'insensitive' } },
            },
          }
        : {}),
      ...(featured ? { featured: featured === 'true' } : {}),
      ...(industry
        ? { industries: { some: { industry: { ...publicIndustryWhere(locale), slug: industry } } } }
        : {}),
      ...(service
        ? { services: { some: { service: { ...publicServiceWhere(locale), slug: service } } } }
        : {}),
      ...(solution
        ? { solutions: { some: { solution: { ...publicSolutionWhere(locale), slug: solution } } } }
        : {}),
    };
    // Apply the privacy projection before counting/paginating, so invalid legacy content cannot leak through search or totals.
    const rows = await this.db.project.findMany({
      where,
      include: { translations: true },
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { projectDate: { sort: 'desc', nulls: 'last' } },
        { slug: 'asc' },
      ],
    });
    const cards = rows.flatMap((r) => {
      const card = projectCard(r, locale);
      return card ? [card] : [];
    });
    return {
      items: cards.slice((page - 1) * limit, page * limit),
      total: cards.length,
      page,
      limit,
    };
  }

  @Get('filters')
  @Header('Cache-Control', 'no-store')
  async filters(@Query() query: unknown) {
    const { locale } = parse(localeQuerySchema, query);
    const [industries, services, solutions] = await Promise.all([
      this.db.industry.findMany({
        where: publicIndustryWhere(locale),
        include: { translations: { where: { locale, published: true } } },
        orderBy: { slug: 'asc' },
      }),
      this.db.service.findMany({
        where: publicServiceWhere(locale),
        include: { translations: { where: { locale, published: true } } },
        orderBy: { slug: 'asc' },
      }),
      this.db.solution.findMany({
        where: publicSolutionWhere(locale),
        include: { translations: { where: { locale, published: true } } },
        orderBy: { slug: 'asc' },
      }),
    ]);
    return {
      industries: industries.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.translations[0]!.name,
        summary: r.translations[0]!.shortDescription,
      })),
      services: services.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.translations[0]!.title,
        summary: r.translations[0]!.summary,
      })),
      solutions: solutions.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.translations[0]!.name,
        summary: r.translations[0]!.shortDescription,
      })),
    };
  }

  @Get(':slug')
  @Header('Cache-Control', 'no-store')
  async detail(@Param('slug') raw: string, @Query() query: unknown) {
    const slug = projectSlugSchema.safeParse(raw);
    if (!slug.success) throw new NotFoundException();
    const { locale } = parse(localeQuerySchema, query);
    const row = await this.db.project.findFirst({
      where: { ...publicProjectWhere(locale), slug: slug.data },
      include,
    });
    if (!row) throw new NotFoundException();
    return this.present(row, locale);
  }
  async present(row: Row, locale: Locale, preview = false) {
    const content = projectContent(row, locale, preview);
    if (!content)
      throw new NotFoundException(
        'Complete and review this translation before previewing or publishing',
      );
    // A case study only needs its own relationships. Loading every published
    // filter option here made the detail response and its three queries grow
    // with the entire catalogue.
    const [industries, services, solutions] = await Promise.all([
      this.db.industry.findMany({
        where: {
          ...publicIndustryWhere(locale),
          id: { in: row.industries.map((relation) => relation.industryId) },
        },
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
      this.db.service.findMany({
        where: {
          ...publicServiceWhere(locale),
          id: { in: row.services.map((relation) => relation.serviceId) },
        },
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
      this.db.solution.findMany({
        where: {
          ...publicSolutionWhere(locale),
          id: { in: row.solutions.map((relation) => relation.solutionId) },
        },
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
    ]);
    const refs = {
      industries: industries.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.translations[0]!.name,
        summary: item.translations[0]!.shortDescription,
      })),
      services: services.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.translations[0]!.title,
        summary: item.translations[0]!.summary,
      })),
      solutions: solutions.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.translations[0]!.name,
        summary: item.translations[0]!.shortDescription,
      })),
    };
    const ordered = <T extends { id: string }>(items: T[], ids: string[]) =>
      ids.flatMap((id) => items.filter((r) => r.id === id));
    return {
      ...content,
      locale,
      availableLocales: preview
        ? []
        : row.translations.filter((t) => projectContent(row, t.locale)).map((t) => t.locale),
      industries: ordered(
        refs.industries,
        row.industries.map((r) => r.industryId),
      ),
      services: ordered(
        refs.services,
        row.services.map((r) => r.serviceId),
      ),
      solutions: ordered(
        refs.solutions,
        row.solutions.map((r) => r.solutionId),
      ),
    };
  }
}

@Controller('cms/projects')
@UseGuards(CmsGuard)
export class CmsProjectsController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Query() query: unknown) {
    const { q, page, limit } = parse(projectQuerySchema, query);
    const where: Prisma.ProjectWhereInput = q
      ? {
          OR: [
            { slug: { contains: q, mode: 'insensitive' } },
            { clientName: { contains: q, mode: 'insensitive' } },
            { translations: { some: { title: { contains: q, mode: 'insensitive' } } } },
          ],
        }
      : {};
    where.deletedAt = null;
    const [rows, total] = await this.db.$transaction([
      this.db.project.findMany({
        where,
        include,
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.project.count({ where }),
    ]);
    return { items: rows.map(cmsRecord), total, page, limit };
  }
  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  async detail(@Param('id') raw: string) {
    const row = await this.db.project.findUnique({ where: { id: parse(idSchema, raw) }, include });
    if (!row) throw new NotFoundException();
    return cmsRecord(row);
  }
  @Get(':id/preview')
  @Header('Cache-Control', 'private, no-store')
  async preview(@Param('id') raw: string, @Query() query: unknown) {
    const row = await this.db.project.findUnique({ where: { id: parse(idSchema, raw) }, include });
    if (!row) throw new NotFoundException();
    return new ProjectsController(this.db).present(
      row,
      parse(localeQuerySchema, query).locale,
      true,
    );
  }
  @Get(':id/audit')
  @Header('Cache-Control', 'private, no-store')
  async audit(@Param('id') raw: string, @Query() query: unknown) {
    const { page, limit } = parse(projectQuerySchema, query);
    const where = { entityId: parse(idSchema, raw), action: { startsWith: 'project.' } };
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
      return archiveCatalog(tx, 'project', id, version, req.cmsUser.id);
    });
  }
  private async save(id: string | undefined, body: unknown, actorId: string) {
    const value = parse(projectWriteSchema, body);
    if (!id && value.version !== 0) throw new BadRequestException('New records start at version 0');
    try {
      return await this.db.$transaction(async (tx) => {
        const before = id ? await tx.project.findUnique({ where: { id }, include }) : null;
        const data = {
          slug: value.slug,
          clientName: value.clientName,
          clientVisibility: value.clientVisibility,
          country: value.country,
          city: value.city,
          projectDate: value.projectDate ? new Date(value.projectDate) : null,
          published: value.published,
          verified: value.verified,
          featured: value.featured,
          sortOrder: value.sortOrder,
          updatedById: actorId,
        };
        let target = id;
        if (target) {
          if (
            (
              await tx.project.updateMany({
                where: { id: target, version: value.version, deletedAt: null },
                data: { ...data, version: { increment: 1 } },
              })
            ).count !== 1
          )
            throw new ConflictException('The project changed. Reload before saving.');
        } else target = (await tx.project.create({ data: { ...data, createdById: actorId } })).id;
        await tx.projectTranslation.deleteMany({
          where: { projectId: target, locale: { notIn: value.translations.map((t) => t.locale) } },
        });
        for (const t of value.translations) {
          const { heroImage, ...rest } = t;
          const data = { ...rest, heroImage: heroImage ?? Prisma.JsonNull };
          await tx.projectTranslation.upsert({
            where: { projectId_locale: { projectId: target, locale: t.locale } },
            create: { ...data, projectId: target },
            update: data,
          });
        }
        await tx.projectService.deleteMany({ where: { projectId: target } });
        await tx.projectService.createMany({
          data: value.serviceIds.map((serviceId, sortOrder) => ({
            projectId: target!,
            serviceId,
            sortOrder,
          })),
        });
        await tx.industryProject.deleteMany({
          where: { projectId: target, industryId: { notIn: value.industryIds } },
        });
        for (const [projectSortOrder, industryId] of value.industryIds.entries())
          await tx.industryProject.upsert({
            where: { industryId_projectId: { industryId, projectId: target } },
            create: { industryId, projectId: target, projectSortOrder },
            update: { projectSortOrder },
          });
        await tx.solutionProject.deleteMany({
          where: { projectId: target, solutionId: { notIn: value.solutionIds } },
        });
        for (const [projectSortOrder, solutionId] of value.solutionIds.entries())
          await tx.solutionProject.upsert({
            where: { solutionId_projectId: { solutionId, projectId: target } },
            create: { solutionId, projectId: target, projectSortOrder },
            update: { projectSortOrder },
          });
        const changed = (old: string[], next: string[]) =>
          [...new Set([...old, ...next])].filter((id) => old.includes(id) !== next.includes(id));
        const industries = changed(
          before?.industries.map((r) => r.industryId) ?? [],
          value.industryIds,
        );
        const solutions = changed(
          before?.solutions.map((r) => r.solutionId) ?? [],
          value.solutionIds,
        );
        if (industries.length)
          await tx.industry.updateMany({
            where: { id: { in: industries } },
            data: { version: { increment: 1 } },
          });
        if (solutions.length)
          await tx.solution.updateMany({
            where: { id: { in: solutions } },
            data: { version: { increment: 1 } },
          });
        const actions = [id ? 'project.update' : 'project.create'];
        for (const key of ['published', 'verified', 'featured', 'clientVisibility'] as const)
          if (before?.[key] !== value[key]) actions.push(`project.${key}.${value[key]}`);
        for (const t of value.translations)
          if (
            (before?.translations.find((b) => b.locale === t.locale)?.published ?? false) !==
            t.published
          )
            actions.push(`project.${t.published ? 'publish' : 'unpublish'}.${t.locale}`);
        if (
          JSON.stringify(before?.services.map((r) => r.serviceId) ?? []) !==
          JSON.stringify(value.serviceIds)
        )
          actions.push('project.services.update');
        if (industries.length) actions.push('project.industries.update');
        if (solutions.length) actions.push('project.solutions.update');
        await tx.cmsAudit.createMany({
          data: actions.map((action) => ({ actorId, entityId: target!, action })),
        });
        return cmsRecord(await tx.project.findUniqueOrThrow({ where: { id: target }, include }));
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2002')
          throw new ConflictException('This project slug is already in use');
        if (error.code === 'P2003')
          throw new BadRequestException('A linked record no longer exists. Reload relationships.');
        if (error.code === 'P2034')
          throw new ConflictException('A related record changed. Reload before saving.');
      }
      throw error;
    }
  }
}
