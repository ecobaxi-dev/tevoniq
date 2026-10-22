import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Req,
  Inject,
  UseGuards,
  ConflictException,
  Header,
} from '@nestjs/common';
import { localeSchema, homeContentSchema, homeWriteSchema } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { CmsGuard, type CmsRequest } from '../cms/cms.guard.js';
import { requirePermission } from '../cms/permissions.js';
import { parse } from '../cms/content-policy.js';
import type { Prisma } from '../generated/prisma/client.js';

const key = (locale: string) => `homepage/${locale}`;
function stored(value: Prisma.JsonValue) {
  const data = value as { draft?: unknown; published?: unknown };
  return {
    draft: homeContentSchema.parse(data.draft),
    published: data.published ? homeContentSchema.parse(data.published) : null,
  };
}
@Controller('home')
export class HomeController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get(':locale')
  @Header('Cache-Control', 'no-store')
  async get(@Param('locale') raw: string) {
    const locale = parse(localeSchema, raw);
    const [row, partners] = await Promise.all([
      this.db.adminRecord.findFirst({
        where: { module: 'homepage', title: key(locale), language: locale, deletedAt: null },
      }),
      this.db.adminRecord.findMany({
        where: {
          module: 'partners',
          language: locale,
          status: 'published',
          deletedAt: null,
          data: { path: ['verified'], equals: 'true' },
        },
        select: { id: true, title: true, data: true },
        orderBy: [{ title: 'asc' }, { id: 'asc' }],
        take: 12,
      }),
    ]);
    return {
      content: row ? stored(row.data).published : null,
      partners: partners.map((p) => ({
        id: p.id,
        title: p.title,
        description:
          typeof (p.data as Record<string, unknown>).description === 'string'
            ? (p.data as Record<string, string>).description
            : '',
      })),
    };
  }
}
@Controller('cms/home')
@UseGuards(CmsGuard)
export class CmsHomeController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get(':locale')
  async get(@Param('locale') raw: string, @Req() req: CmsRequest) {
    requirePermission(req, 'pages.read');
    const locale = parse(localeSchema, raw);
    const row = await this.db.adminRecord.findFirst({
      where: { module: 'homepage', title: key(locale), language: locale, deletedAt: null },
    });
    return row
      ? { ...stored(row.data), version: row.version }
      : { draft: null, published: null, version: 0 };
  }
  @Put(':locale')
  async save(@Param('locale') raw: string, @Body() body: unknown, @Req() req: CmsRequest) {
    requirePermission(req, 'pages.update');
    const locale = parse(localeSchema, raw),
      input = parse(homeWriteSchema, body);
    if (input.action !== 'save') requirePermission(req, 'pages.publish');
    return this.db
      .$transaction(
        async (tx) => {
          const row = await tx.adminRecord.findFirst({
            where: { module: 'homepage', title: key(locale), language: locale, deletedAt: null },
          });
          if ((row?.version ?? 0) !== input.version)
            throw new ConflictException('Homepage changed. Reload before saving.');
          const published =
            input.action === 'publish'
              ? input.content
              : input.action === 'unpublish'
                ? null
                : row
                  ? stored(row.data).published
                  : null;
          const data = { draft: input.content, published } as unknown as Prisma.InputJsonValue;
          const saved = row
            ? await tx.adminRecord.update({
                where: { id: row.id },
                data: {
                  data,
                  status: published ? 'published' : 'draft',
                  version: { increment: 1 },
                  updatedById: req.cmsUser.id,
                },
              })
            : await tx.adminRecord.create({
                data: {
                  id: {
                    en: '00000000-0000-4000-8000-000000007001',
                    tr: '00000000-0000-4000-8000-000000007002',
                    ar: '00000000-0000-4000-8000-000000007003',
                  }[locale],
                  module: 'homepage',
                  title: key(locale),
                  language: locale,
                  status: published ? 'published' : 'draft',
                  data,
                  createdById: req.cmsUser.id,
                  updatedById: req.cmsUser.id,
                },
              });
          await tx.cmsAudit.create({
            data: {
              actorId: req.cmsUser.id,
              entityId: saved.id,
              action: `homepage.${input.action}`,
            },
          });
          return { ...stored(saved.data), version: saved.version };
        },
        { isolationLevel: 'Serializable' },
      )
      .catch((error: unknown) => {
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          ['P2002', 'P2034'].includes(String(error.code))
        )
          throw new ConflictException('Homepage changed. Reload before saving.');
        throw error;
      });
  }
}
