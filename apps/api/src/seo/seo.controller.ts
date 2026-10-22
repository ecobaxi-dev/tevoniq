import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { settingsOrganization, publicSiteSettings } from '@tevoniq/validation';
import { Controller, Get, Header, Inject, Query } from '@nestjs/common';
import { z } from 'zod';
import { seoFieldsSchema, seoPathSchema } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { parse } from '../cms/content-policy.js';
import { projectContent } from '../projects/project-public.js';
type Translation = { locale: 'en' | 'tr' | 'ar'; canonical: string; seo: unknown };
type RouteRow = {
  id: string;
  type: string;
  route: string;
  locale: 'en' | 'tr' | 'ar';
  title: string;
  canonical: string;
  updatedAt: Date | null;
  seo: unknown;
  translations: Translation[];
  total: bigint;
};
export const publicSeoFields = (data: unknown) => {
  const result = seoFieldsSchema.safeParse(data);
  return result.success ? result.data : seoFieldsSchema.parse({});
};
@Controller('seo')
export class SeoController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(SiteSettingsService) private readonly settings: SiteSettingsService,
  ) {}
  @Get('organization')
  @Header('Cache-Control', 'no-store')
  async organization() {
    return settingsOrganization(publicSiteSettings((await this.settings.read()).settings));
  }
  @Get('routes')
  @Header('Cache-Control', 'no-store')
  async routes(@Query() raw: unknown) {
    const { path, page } = parse(
      z
        .object({
          path: seoPathSchema.optional(),
          page: z.coerce.number().int().min(0).max(100000).default(0),
        })
        .strict(),
      raw,
    );
    const rows = await this.db.$queryRaw<RouteRow[]>`
      WITH published AS (
        SELECT v.*, coalesce(o.data, '{}'::jsonb) AS seo
        FROM (
          SELECT * FROM public_seo_routes
          UNION ALL
          SELECT 'policy:' || p.route, 'page', p.route, l.locale, p.title, '', NULL::timestamp
          FROM (VALUES ('/privacy-policy', 'Privacy Policy'), ('/cookie-policy', 'Cookie Policy')) p(route,title)
          CROSS JOIN (VALUES ('en'),('tr'),('ar')) l(locale)
          WHERE NOT EXISTS (SELECT 1 FROM public_seo_routes existing WHERE existing.route=p.route AND existing.locale=l.locale)
        ) v
        LEFT JOIN LATERAL (
          SELECT data FROM "AdminRecord"
          WHERE module = 'seo' AND status = 'published' AND "deletedAt" IS NULL
            AND language::text = v.locale AND data->>'path' = v.route
          ORDER BY "updatedAt" DESC, id ASC LIMIT 1
        ) o ON true
        WHERE (${path ?? ''} = '' OR v.route = ${path ?? ''})
      )
      SELECT *, count(*) OVER () AS total,
        jsonb_agg(jsonb_build_object('locale', locale, 'canonical', canonical, 'seo', seo))
          OVER (PARTITION BY route) AS translations
      FROM published ORDER BY route, locale LIMIT 1000 OFFSET ${path ? 0 : page * 1000}
    `;
    const ids = rows.filter((r) => r.type === 'project').map((r) => r.id);
    const projects = ids.length
      ? await this.db.project.findMany({
          where: { id: { in: ids }, deletedAt: null },
          include: { translations: true },
        })
      : [];
    const publicLocales = new Map(
      projects.map((p) => [
        p.id,
        ['en', 'tr', 'ar'].filter((l) => projectContent(p, l as 'en' | 'tr' | 'ar')),
      ]),
    );
    return {
      total: Number(rows[0]?.total ?? 0),
      items: rows
        .filter((r) => r.type !== 'project' || publicLocales.get(r.id)?.includes(r.locale))
        .map((r) => ({
          route: r.route,
          locale: r.locale,
          title: r.title,
          canonical: r.canonical,
          updatedAt: r.updatedAt?.toISOString() ?? null,
          seo: publicSeoFields(r.seo),
          translations: r.translations
            .filter((t) => r.type !== 'project' || publicLocales.get(r.id)?.includes(t.locale))
            .map((t) => ({ ...t, seo: publicSeoFields(t.seo) })),
        })),
    };
  }
}
