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
  Header,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NewsletterService } from '../newsletter/newsletter.service.js';
import { z } from 'zod';
import {
  pageDocumentSchema,
  pageWriteSchema,
  pageQuerySchema,
  pageStateSchema,
  builderPathSchema,
  builderLocales,
  gridKinds,
  pageCatalogReferences,
} from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { CmsGuard, CmsAdminGuard, type CmsRequest } from '../cms/cms.guard.js';
import { parse, idSchema } from '../cms/content-policy.js';
import { Prisma } from '../generated/prisma/client.js';
import { catalogCards, resolvePage, publishedDocument, pageSummary } from './page-content.js';
import { LeadSubmissionGuard, LeadBotProtection, submissionIp } from '../leads/bot-protection.js';
import type { Request } from 'express';
const localeSchema = z.enum(builderLocales);
@Controller('pages')
export class PublicPagesController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LeadBotProtection) private readonly bot: LeadBotProtection,
    @Inject(NewsletterService) private readonly newsletterService: NewsletterService,
  ) {}
  @Get('resolve')
  @Header('Cache-Control', 'no-store')
  async resolve(@Query() query: unknown) {
    const { path, locale } = parse(
      z.object({ path: builderPathSchema, locale: localeSchema }).strict(),
      query,
    );
    const row = await this.db.cmsPage.findFirst({
      where: { path, deletedAt: null, publishedAt: { not: null } },
    });
    const document = publishedDocument(row?.published);
    if (!row || !document || !document.translations[locale]) throw new NotFoundException();
    return {
      id: row.id,
      ...(await resolvePage(this.db, document, locale)),
      publishedAt: row.publishedAt,
      turnstileSiteKey:
        this.config.get('TURNSTILE_MODE') === 'turnstile'
          ? this.config.get<string>('TURNSTILE_SITE_KEY')
          : null,
    };
  }
  @Get('sitemap')
  @Header('Cache-Control', 'no-store')
  async sitemap() {
    const rows = await this.db.cmsPage.findMany({
      where: { deletedAt: null, publishedAt: { not: null } },
      select: { path: true, published: true, publishedAt: true },
    });
    return {
      items: rows.flatMap((r) => {
        const d = publishedDocument(r.published);
        return d
          ? builderLocales
              .filter((l) => d.translations[l])
              .map((locale) => ({ path: r.path, locale, updatedAt: r.publishedAt }))
          : [];
      }),
    };
  }
  @Post('newsletter')
  @UseGuards(LeadSubmissionGuard)
  @Header('Cache-Control', 'no-store')
  async newsletter(@Body() body: unknown, @Req() req: Request) {
    const v = parse(
      z
        .object({
          pageId: idSchema,
          sectionId: idSchema,
          locale: localeSchema,
          email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
          name: z.string().trim().max(180).default(''),
          consent: z.literal(true),
          website: z.literal('').default(''),
          turnstileToken: z.string().max(2048).default(''),
        })
        .strict(),
      body,
    );
    const row = await this.db.cmsPage.findFirst({
        where: { id: v.pageId, deletedAt: null, publishedAt: { not: null } },
      }),
      document = publishedDocument(row?.published);
    const section = document?.sections.find(
      (s) => s.id === v.sectionId && s.type === 'Newsletter' && s.visible && s.content[v.locale],
    );
    if (!document?.translations[v.locale] || !section)
      throw new BadRequestException('Subscription form is unavailable');
    await this.bot.rateLimit(`newsletter:${v.email}`, 3, 3600000);
    await this.bot.verify(
      v.turnstileToken,
      'newsletter',
      submissionIp(req, this.config.get<string>('LEAD_PROXY_SECRET')),
    );
    return this.newsletterService.subscribe(
      { email: v.email, name: v.name, language: v.locale, source: `/${v.locale}${document.path}#section-${v.sectionId}` },
      (section.content[v.locale] as { consentLabel: string }).consentLabel,
    );
  }
}
@Controller('cms/page-builder')
@UseGuards(CmsGuard)
export class PageBuilderController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get() async list(@Query() query: unknown) {
    const q = parse(pageQuerySchema, query),
      where: Prisma.CmsPageWhereInput = {
        deletedAt: q.archived === 'true' ? { not: null } : null,
        ...(q.status ? { publishedAt: q.status === 'published' ? { not: null } : null } : {}),
        ...(q.q
          ? {
              OR: [
                { path: { contains: q.q, mode: 'insensitive' } },
                { draft: { path: ['translations', 'en', 'title'], string_contains: q.q } },
                { draft: { path: ['translations', 'tr', 'title'], string_contains: q.q } },
                { draft: { path: ['translations', 'ar', 'title'], string_contains: q.q } },
              ],
            }
          : {}),
      };
    const [rows, total] = await this.db.$transaction([
      this.db.cmsPage.findMany({
        where,
        orderBy: [{ [q.sort]: q.direction }, { id: 'asc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.db.cmsPage.count({ where }),
    ]);
    return {
      items: await this.annotate(rows.map(pageSummary)),
      total,
      page: q.page,
      limit: q.limit,
    };
  }
  private async annotate<T extends { createdById: string; updatedById: string }>(rows: T[]) {
    const users = await this.db.cmsUser.findMany({
      where: { id: { in: rows.flatMap((r) => [r.createdById, r.updatedById]) } },
      select: { id: true, email: true },
    });
    return rows.map((r) => ({
      ...r,
      createdBy: users.find((u) => u.id === r.createdById)?.email || 'Not recorded',
      updatedBy: users.find((u) => u.id === r.updatedById)?.email || 'Former administrator',
    }));
  }
  @Get('options') async options(@Query() query: unknown) {
    const q = parse(
      z
        .object({
          kind: z.enum(['service', 'solution', 'industry', 'project']),
          locale: localeSchema,
          q: z.string().max(160).default(''),
        })
        .strict(),
      query,
    );
    return { items: await catalogCards(this.db, q.kind, q.locale, undefined, q.q) };
  }
  @Post('preview') async preview(@Body() body: unknown) {
    const v = parse(
      z.object({ document: pageDocumentSchema, locale: localeSchema }).strict(),
      body,
    );
    return resolvePage(this.db, v.document, v.locale);
  }
  @Get(':id') async get(@Param('id') raw: string) {
    const id = parse(idSchema, raw),
      row = await this.db.cmsPage.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    return (
      await this.annotate([
        {
          ...row,
          status: row.publishedAt ? 'published' : 'draft',
          hasChanges: JSON.stringify(row.draft) !== JSON.stringify(row.published),
        },
      ])
    )[0];
  }
  @Post() @UseGuards(CmsAdminGuard) async create(@Body() body: unknown, @Req() req: CmsRequest) {
    return this.save(undefined, body, req);
  }
  @Put(':id') @UseGuards(CmsAdminGuard) async update(
    @Param('id') raw: string,
    @Body() body: unknown,
    @Req() req: CmsRequest,
  ) {
    return this.save(parse(idSchema, raw), body, req);
  }
  private async save(id: string | undefined, body: unknown, req: CmsRequest) {
    const v = parse(pageWriteSchema, body);
    try {
      return await this.db.$transaction(
        async (tx) => {
          const before = id ? await tx.cmsPage.findUnique({ where: { id } }) : null;
          if (id && (!before || before.version !== v.version || before.deletedAt))
            throw new ConflictException('Page changed or archived. Reload before saving.');
          if (!id && v.version !== 0)
            throw new ConflictException('New pages start at version zero');
          if (before?.publishedAt && before.path !== v.document.path)
            throw new ConflictException('Unpublish before changing the page path');
          const published =
            v.action === 'publish' ? v.document : publishedDocument(before?.published);
          const refs = [
            ...pageCatalogReferences(v.document),
            ...(published ? pageCatalogReferences(published) : []),
          ];
          const unique = [...new Map(refs.map((r) => [`${r.kind}:${r.id}`, r])).values()];
          for (const ref of unique) {
            const where = { id: ref.id, deletedAt: null };
            const count =
              ref.kind === 'service'
                ? await tx.service.count({ where })
                : ref.kind === 'solution'
                  ? await tx.solution.count({ where })
                  : ref.kind === 'industry'
                    ? await tx.industry.count({ where })
                    : await tx.project.count({ where });
            if (!count) throw new BadRequestException('A referenced catalog record is unavailable');
          }
          if (v.action === 'publish')
            for (const locale of builderLocales) {
              if (!v.document.translations[locale]) continue;
              const resolved = await resolvePage(tx, v.document, locale);
              for (const s of resolved.document.sections) {
                if (!(s.type in gridKinds)) continue;
                if (
                  resolved.cards[s.id]!.length !==
                  (s.content[locale] as { ids: string[] }).ids.length
                )
                  throw new BadRequestException(
                    `Publish the selected catalog records in ${locale} first`,
                  );
              }
            }
          const data = {
            path: v.document.path,
            draft: v.document,
            updatedById: req.cmsUser.id,
            ...(v.action === 'publish' ? { published: v.document, publishedAt: new Date() } : {}),
          };
          let pageId = id;
          if (pageId) {
            if (
              !(
                await tx.cmsPage.updateMany({
                  where: { id: pageId, version: v.version, deletedAt: null },
                  data: { ...data, version: { increment: 1 } },
                })
              ).count
            )
              throw new ConflictException('Page changed. Reload first');
          } else
            pageId = (await tx.cmsPage.create({ data: { ...data, createdById: req.cmsUser.id } }))
              .id;
          await tx.pageCatalogReference.deleteMany({ where: { pageId } });
          if (unique.length)
            await tx.pageCatalogReference.createMany({
              data: unique.map((r) => ({ pageId: pageId!, [`${r.kind}Id`]: r.id })),
            });
          await tx.cmsAudit.create({
            data: {
              actorId: req.cmsUser.id,
              entityId: pageId,
              action: v.action === 'publish' ? 'page.publish' : 'page.save-draft',
            },
          });
          return tx.cmsPage.findUniqueOrThrow({ where: { id: pageId } });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e) {
        if (e.code === 'P2002') throw new ConflictException('That page path is already reserved');
        if (e.code === 'P2034')
          throw new ConflictException('Content changed during this save. Reload and retry');
      }
      throw e;
    }
  }
  @Post(':id/state') @UseGuards(CmsAdminGuard) async state(
    @Param('id') raw: string,
    @Body() body: unknown,
    @Req() req: CmsRequest,
  ) {
    const id = parse(idSchema, raw),
      v = parse(pageStateSchema, body);
    await this.db.$transaction(async (tx) => {
      if (
        !(
          await tx.cmsPage.updateMany({
            where: {
              id,
              version: v.version,
              deletedAt: v.action === 'restore' ? { not: null } : null,
            },
            data: {
              deletedAt: v.action === 'archive' ? new Date() : null,
              published: Prisma.DbNull,
              publishedAt: null,
              updatedById: req.cmsUser.id,
              version: { increment: 1 },
            },
          })
        ).count
      )
        throw new ConflictException('Page changed. Reload before continuing');
      await tx.cmsAudit.create({
        data: { actorId: req.cmsUser.id, entityId: id, action: `page.${v.action}` },
      });
      const row = await tx.cmsPage.findUniqueOrThrow({ where: { id } }),
        draft = publishedDocument(row.draft);
      await tx.pageCatalogReference.deleteMany({ where: { pageId: id } });
      const refs = draft ? pageCatalogReferences(draft) : [];
      if (refs.length)
        await tx.pageCatalogReference.createMany({
          data: refs.map((r) => ({ pageId: id, [`${r.kind}Id`]: r.id })),
        });
    });
    return { ok: true };
  }
}
