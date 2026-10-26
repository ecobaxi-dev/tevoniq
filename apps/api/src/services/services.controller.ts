import { archiveCatalog } from '../admin/catalog-archive.js';
import { retiredServiceSlugs, isRetiredService } from '@tevoniq/types';
import { safeProjectReferences } from '../projects/project-public.js';
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
import { z } from 'zod';
import {
  serviceQuerySchema,
  serviceSlugSchema,
  serviceWriteSchema,
  serviceTranslationSchema,
} from '@tevoniq/validation';
import type { ServiceBlock } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { CmsGuard, CmsAdminGuard } from '../cms/cms.guard.js';
import type { CmsRequest } from '../cms/cms.guard.js';
import type { Prisma } from '../generated/prisma/client.js';
import {
  parse,
  idSchema,
  publicServiceWhere,
  publicProjectWhere,
  reordered,
} from '../cms/content-policy.js';
@Controller('services')
export class ServicesController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  async list(@Query() query: unknown) {
    const { locale, page, limit, q } = parse(serviceQuerySchema, query);
    const where: Prisma.ServiceWhereInput = {
      slug: { notIn: [...retiredServiceSlugs] },
      active: true,
      translations: {
        some: {
          locale,
          published: true,
          ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
        },
      },
    };
    const [rows, total] = await this.db.$transaction([
      this.db.service.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
      this.db.service.count({ where }),
    ]);
    return {
      items: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.translations[0]!.title,
        summary: row.translations[0]!.summary,
      })),
      total,
      page,
      limit,
    };
  }
  @Get(':slug')
  @Header('Cache-Control', 'no-store')
  async detail(@Param('slug') raw: string, @Query() query: unknown) {
    const parsedSlug = serviceSlugSchema.safeParse(raw);
    if (!parsedSlug.success) throw new NotFoundException();
    const slug = parsedSlug.data;
    if (isRetiredService(slug)) throw new NotFoundException();
    const { locale } = parse(
      z.object({ locale: z.enum(['en', 'tr', 'ar']).default('en') }).strict(),
      query,
    );
    const row = await this.db.service.findFirst({
      where: { slug, active: true },
      include: { translations: { where: { locale, published: true }, take: 1 } },
    });
    const translation = row?.translations[0];
    if (!row || !translation) throw new NotFoundException();
    const parsed = serviceTranslationSchema.safeParse({
      locale: translation.locale,
      title: translation.title,
      summary: translation.summary,
      published: translation.published,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      blocks: translation.blocks,
    });
    if (!parsed.success) throw new NotFoundException();
    const blocks = parsed.data.blocks;
    const ids = (type: ServiceBlock['type']) =>
      blocks.flatMap((block) => (block.type === type && 'ids' in block ? block.ids : []));
    const [services, projects] = await Promise.all([
      this.db.service.findMany({
        where: {
          id: { in: ids('related-services'), not: row.id },
          ...publicServiceWhere(locale),
        },
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
      this.db.project.findMany({
        where: {
          id: { in: ids('related-projects') },
          ...publicProjectWhere(locale),
        },
        include: { translations: { where: { locale, published: true }, take: 1 } },
      }),
    ]);
    const cards = (rows: typeof services | typeof projects) =>
      rows.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.translations[0]!.title,
        summary: item.translations[0]!.summary,
      }));
    return {
      id: row.id,
      slug: row.slug,
      locale,
      title: translation.title,
      summary: translation.summary,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      blocks,
      relatedServices: cards(services),
      relatedProjects: safeProjectReferences(projects, locale),
    };
  }
}
@Controller('cms/services')
@UseGuards(CmsGuard)
export class CmsServicesController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  async list(@Query() query: unknown) {
    const { page, limit, q } = parse(serviceQuerySchema, query);
    const where: Prisma.ServiceWhereInput = q
      ? {
          OR: [
            { slug: { contains: q, mode: 'insensitive' } },
            { translations: { some: { title: { contains: q, mode: 'insensitive' } } } },
          ],
        }
      : {};
    where.deletedAt = null;
    const [items, total] = await this.db.$transaction([
      this.db.service.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { translations: true },
      }),
      this.db.service.count({ where }),
    ]);
    return { items, total, page, limit };
  }
  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async detail(@Param('id') raw: string) {
    const id = parse(idSchema, raw);
    const row = await this.db.service.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!row) throw new NotFoundException();
    return row;
  }
  @Post()
  @UseGuards(CmsAdminGuard)
  async create(@Body() body: unknown, @Req() req: CmsRequest) {
    return this.save(undefined, body, req.cmsUser.id);
  }
  @Put(':id')
  @UseGuards(CmsAdminGuard)
  async update(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    return this.save(parse(idSchema, raw), body, req.cmsUser.id);
  }
  @Delete(':id')
  @UseGuards(CmsAdminGuard)
  async remove(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const id = parse(idSchema, raw);
    const { version } = parse(z.object({ version: z.number().int().min(0) }).strict(), body);
    return this.db.$transaction(async (tx) => {
      return archiveCatalog(tx, 'service', id, version, req.cmsUser.id);
    });
  }
  private async save(id: string | undefined, body: unknown, actorId: string) {
    const value = parse(serviceWriteSchema, body);
    if (!id && value.version !== 0)
      throw new BadRequestException('New records must start at version 0');
    try {
      return await this.db.$transaction(async (tx) => {
        let target = id;
        const before = target
          ? await tx.service.findUnique({ where: { id: target }, include: { translations: true } })
          : null;
        if (target) {
          const updated = await tx.service.updateMany({
            where: { id: target, version: value.version, deletedAt: null },
            data: {
              slug: value.slug,
              active: value.active,
              sortOrder: value.sortOrder,
              updatedById: actorId,
              version: { increment: 1 },
            },
          });
          if (updated.count !== 1)
            throw new ConflictException('The record changed. Reload before saving.');
          await tx.serviceTranslation.deleteMany({ where: { serviceId: target } });
        } else {
          const created = await tx.service.create({
            data: {
              slug: value.slug,
              active: value.active,
              sortOrder: value.sortOrder,
              createdById: actorId,
              updatedById: actorId,
            },
          });
          target = created.id;
        }
        await tx.serviceTranslation.createMany({
          data: value.translations.map((t) => ({
            ...t,
            serviceId: target!,
            blocks: t.blocks as Prisma.InputJsonValue,
          })),
        });
        const actions = [id ? 'service.update' : 'service.create'];
        if (value.active !== (before?.active ?? false))
          actions.push(value.active ? 'service.activate' : 'service.deactivate');
        for (const locale of ['en', 'tr', 'ar'] as const) {
          const oldTranslation = before?.translations.find((t) => t.locale === locale);
          const nextTranslation = value.translations.find((t) => t.locale === locale);
          if ((oldTranslation?.published ?? false) !== (nextTranslation?.published ?? false))
            actions.push(
              `service.${nextTranslation?.published ? 'publish' : 'unpublish'}.${locale}`,
            );
          if (oldTranslation && nextTranslation) {
            const oldIds = (oldTranslation.blocks as ServiceBlock[]).map((b) => b.id);
            const nextIds = nextTranslation.blocks.map((b) => b.id);
            if (reordered(oldIds, nextIds)) actions.push(`service.reorder.${locale}`);
          }
        }
        if (before && before.sortOrder !== value.sortOrder) actions.push('service.reorder');
        await tx.cmsAudit.createMany({
          data: actions.map((action) => ({ actorId, entityId: target!, action })),
        });
        return tx.service.findUniqueOrThrow({
          where: { id: target },
          include: { translations: true },
        });
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002')
        throw new ConflictException('This service slug is already in use');
      throw error;
    }
  }
}
