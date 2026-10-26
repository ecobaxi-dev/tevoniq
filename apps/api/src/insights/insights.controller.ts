import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Req,
  Inject,
  UseGuards,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  articleWriteSchema,
  insightQuerySchema,
  insightSlugSchema,
  taxonomyWriteSchema,
  publicArticleSchema,
  insightStatusSchema,
} from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { hasPermission } from '@tevoniq/validation';
import { requirePermission } from '../cms/permissions.js';
import { CmsGuard, CmsAdminGuard, type CmsRequest } from '../cms/cms.guard.js';
import { parse, idSchema, localeQuerySchema } from '../cms/content-policy.js';
import type { Locale, Prisma } from '../generated/prisma/client.js';
import { retiredArticleSlugs } from '@tevoniq/types';

export const articleInclude = { category: true, tags: { include: { tag: true } } } as const;
type ArticleRow = Prisma.InsightArticleGetPayload<{ include: typeof articleInclude }>;
export function publicArticleWhere(
  language: Locale,
  now = new Date(),
): Prisma.InsightArticleWhereInput {
  return {
    language,
    slug: { notIn: retiredArticleSlugs },
    status: { in: ['published', 'scheduled'] },
    publicationDate: { lte: now },
  };
}
export function publicArticle(row: ArticleRow) {
  return publicArticleSchema.parse({
    ...row,
    publicationDate: row.publicationDate?.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    tags: row.tags.map((t) => t.tag),
  });
}
const cmsRecord = (row: ArticleRow) => ({ ...row, tagIds: row.tags.map((t) => t.tagId) });
async function unique<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002')
      throw new ConflictException('This slug already exists in this language.');
    throw error;
  }
}
const cmsQuery = insightQuerySchema.extend({ status: insightStatusSchema.optional() });

@Controller('insights')
export class InsightsController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get('taxonomies')
  async taxonomies(@Query() raw: unknown) {
    const { locale } = parse(localeQuerySchema, raw),
      visibility = publicArticleWhere(locale);
    return {
      items: await this.db.insightTaxonomy.findMany({
        where: {
          language: locale,
          OR: [{ articles: { some: visibility } }, { tags: { some: { article: visibility } } }],
        },
        orderBy: { name: 'asc' },
      }),
    };
  }
  @Get()
  async list(@Query() raw: unknown) {
    const query = parse(insightQuerySchema, raw);
    const where: Prisma.InsightArticleWhereInput = {
      ...publicArticleWhere(query.locale),
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.featured ? { featured: query.featured === 'true' } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.tag ? { tags: { some: { tag: { slug: query.tag } } } } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { excerpt: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.insightArticle.findMany({
        where,
        include: articleInclude,
        orderBy: [{ publicationDate: 'desc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.db.insightArticle.count({ where }),
    ]);
    return { items: items.map(publicArticle), total, page: query.page, limit: query.limit };
  }
  @Get(':slug')
  async detail(@Param('slug') raw: string, @Query() query: unknown) {
    const slug = parse(insightSlugSchema, raw),
      { locale } = parse(localeQuerySchema, query);
    if (retiredArticleSlugs.includes(slug)) throw new NotFoundException();
    const where = publicArticleWhere(locale);
    const article = await this.db.insightArticle.findFirst({
      where: { ...where, slug },
      include: articleInclude,
    });
    if (!article) throw new NotFoundException();
    const relations: Prisma.InsightArticleWhereInput[] = [];
    if (article.categoryId) relations.push({ categoryId: article.categoryId });
    if (article.tags.length)
      relations.push({ tags: { some: { tagId: { in: article.tags.map((t) => t.tagId) } } } });
    const related = relations.length
      ? await this.db.insightArticle.findMany({
          where: { ...where, id: { not: article.id }, OR: relations },
          include: articleInclude,
          orderBy: [{ featured: 'desc' }, { publicationDate: 'desc' }, { id: 'asc' }],
          take: 3,
        })
      : [];
    return { article: publicArticle(article), related: related.map(publicArticle) };
  }
}

@Controller('cms/insights')
@UseGuards(CmsGuard)
export class CmsInsightsController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get('taxonomies')
  async taxonomies(@Query() raw: unknown) {
    const { locale } = parse(localeQuerySchema, raw);
    return {
      items: await this.db.insightTaxonomy.findMany({
        where: { language: locale },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      }),
    };
  }
  @Post('taxonomies')
  @UseGuards(CmsAdminGuard)
  async createTaxonomy(@Body() body: unknown, @Req() req: CmsRequest) {
    const { version, ...data } = parse(taxonomyWriteSchema, body);
    if (version !== 0) throw new BadRequestException('New taxonomy requires version 0');
    return unique(() =>
      this.db.$transaction(async (tx) => {
        const item = await tx.insightTaxonomy.create({ data });
        await tx.cmsAudit.create({
          data: { actorId: req.cmsUser.id, entityId: item.id, action: 'insights.taxonomy.create' },
        });
        return item;
      }),
    );
  }
  @Put('taxonomies/:id')
  @UseGuards(CmsAdminGuard)
  async updateTaxonomy(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    const id = parse(idSchema, raw),
      { version, ...data } = parse(taxonomyWriteSchema, body);
    return unique(() =>
      this.db.$transaction(async (tx) => {
        const result = await tx.insightTaxonomy.updateMany({
          where: { id, version, type: data.type, language: data.language },
          data: { name: data.name, slug: data.slug, version: { increment: 1 } },
        });
        if (!result.count)
          throw new ConflictException('Reload the taxonomy. Type and language cannot be changed.');
        await tx.cmsAudit.create({
          data: { actorId: req.cmsUser.id, entityId: id, action: 'insights.taxonomy.update' },
        });
        return tx.insightTaxonomy.findUniqueOrThrow({ where: { id } });
      }),
    );
  }
  @Get()
  async list(@Query() raw: unknown) {
    const query = parse(cmsQuery, raw);
    const where = {
      language: query.locale,
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' as const } } : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.insightArticle.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          language: true,
          status: true,
          publicationDate: true,
          kind: true,
        },
        orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.db.insightArticle.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }
  @Get(':id')
  async get(@Param('id') raw: string) {
    const id = parse(idSchema, raw),
      row = await this.db.insightArticle.findUnique({ where: { id }, include: articleInclude });
    if (!row) throw new NotFoundException();
    return cmsRecord(row);
  }
  @Post()
  @UseGuards(CmsAdminGuard)
  create(@Body() body: unknown, @Req() req: CmsRequest) {
    return this.save(null, body, req);
  }
  @Put(':id')
  @UseGuards(CmsAdminGuard)
  update(@Param('id') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    return this.save(parse(idSchema, raw), body, req);
  }
  private async save(id: string | null, body: unknown, req: CmsRequest) {
    const { version, tagIds, ...input } = parse(articleWriteSchema, body);
    if (['published', 'scheduled'].includes(input.status)) requirePermission(req, 'blog.publish');
    if (!id && version !== 0) throw new BadRequestException('New article requires version 0');
    const publicationDate = input.publicationDate ? new Date(input.publicationDate) : null;
    if (input.status === 'published' && publicationDate && publicationDate > new Date())
      throw new BadRequestException('Use scheduled status for a future publication date');
    return unique(() =>
      this.db.$transaction(async (tx) => {
        if (
          input.categoryId &&
          !(await tx.insightTaxonomy.findFirst({
            where: { id: input.categoryId, type: 'category', language: input.language },
          }))
        )
          throw new BadRequestException('Select a category in the article language');
        if (
          tagIds.length !==
          (await tx.insightTaxonomy.count({
            where: { id: { in: tagIds }, type: 'tag', language: input.language },
          }))
        )
          throw new BadRequestException('Select tags in the article language');
        const data = { ...input, publicationDate, updatedById: req.cmsUser.id };
        let articleId = id;
        if (articleId) {
          const result = await tx.insightArticle.updateMany({
            where: {
              id: articleId,
              version,
              ...(!hasPermission(req.cmsUser.role, 'blog.publish')
                ? { status: { notIn: ['published', 'scheduled'] } }
                : {}),
            },
            data: { ...data, version: { increment: 1 } },
          });
          if (!result.count) throw new ConflictException('Article changed. Reload before saving.');
          await tx.insightArticleTag.deleteMany({ where: { articleId } });
        } else
          articleId = (
            await tx.insightArticle.create({ data: { ...data, createdById: req.cmsUser.id } })
          ).id;
        if (tagIds.length)
          await tx.insightArticleTag.createMany({
            data: tagIds.map((tagId) => ({ articleId: articleId!, tagId })),
          });
        await tx.cmsAudit.create({
          data: {
            actorId: req.cmsUser.id,
            entityId: articleId,
            action: `insights.${input.status}`,
          },
        });
        return cmsRecord(
          await tx.insightArticle.findUniqueOrThrow({
            where: { id: articleId },
            include: articleInclude,
          }),
        );
      }),
    );
  }
}
