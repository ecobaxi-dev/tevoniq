import { Prisma } from '../generated/prisma/client.js';
import {
  adminModules,
  hasPermission,
  moduleResource,
  type adminQuerySchema,
} from '@tevoniq/validation';
import type { z } from 'zod';

export type AdminSearchQuery = z.infer<typeof adminQuerySchema>;
export type AdminSearchRow = {
  id: string;
  title: string;
  status: string;
  module: string;
  href: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  updatedById: string | null;
};
const columns = (alias: string) =>
  Prisma.raw(
    `${alias}."createdAt", ${alias}."updatedAt", ${alias}."createdById", ${alias}."updatedById"`,
  );
const empty = Prisma.sql`SELECT NULL::text AS id, NULL::text AS title, NULL::text AS status,
  NULL::text AS module, NULL::text AS href, NULL::timestamp AS "createdAt",
  NULL::timestamp AS "updatedAt", NULL::text AS "createdById", NULL::text AS "updatedById" WHERE FALSE`;

/** Fixed SQL identifiers only. Visitor filters, role-derived module values and pagination are parameters. */
export function adminSearchSource(role: string, trash = false) {
  const parts: Prisma.Sql[] = [];
  const catalog = [
    {
      table: 'Service',
      translation: 'ServiceTranslation',
      fk: 'serviceId',
      label: 'title',
      module: 'services',
      kind: 'service',
      status: `CASE WHEN r.active AND EXISTS (SELECT 1 FROM "ServiceTranslation" t WHERE t."serviceId" = r.id AND t.published) THEN 'published' ELSE 'draft' END`,
    },
    {
      table: 'Solution',
      translation: 'SolutionTranslation',
      fk: 'solutionId',
      label: 'name',
      module: 'solutions',
      kind: 'solution',
      status: `lower(r.status::text)`,
    },
    {
      table: 'Industry',
      translation: 'IndustryTranslation',
      fk: 'industryId',
      label: 'name',
      module: 'industries',
      kind: 'industry',
      status: `lower(r.status::text)`,
    },
    {
      table: 'Project',
      translation: 'ProjectTranslation',
      fk: 'projectId',
      label: 'title',
      module: 'projects',
      kind: 'project',
      status: `CASE WHEN r.published THEN 'published' ELSE 'draft' END`,
    },
  ];
  for (const entry of catalog) {
    if (!hasPermission(role, `${entry.module}.read`)) continue;
    const title = trash
      ? Prisma.raw('r.slug')
      : Prisma.raw(
          `COALESCE((SELECT t."${entry.label}" FROM "${entry.translation}" t WHERE t."${entry.fk}" = r.id ORDER BY t.locale LIMIT 1), r.slug)`,
        );
    parts.push(Prisma.sql`SELECT r.id, ${title} AS title,
      ${trash ? Prisma.sql`'archived'::text` : Prisma.raw(entry.status)} AS status,
      ${trash ? entry.kind : entry.module}::text AS module, ${'/admin/' + entry.module}::text AS href,
      ${columns('r')} FROM ${Prisma.raw('"' + entry.table + '"')} r
      WHERE ${trash ? Prisma.sql`r."deletedAt" IS NOT NULL` : Prisma.sql`r."deletedAt" IS NULL`}`);
  }
  if (!trash) {
    const modules = adminModules.filter(
      (m) =>
        !['leads', 'messages', 'site-settings', 'job-applications', 'newsletter'].includes(m) &&
        hasPermission(role, `${moduleResource(m)}.read`),
    );
    if (modules.length)
      parts.push(Prisma.sql`SELECT r.id, r.title, r.status, r.module,
      '/admin/' || CASE WHEN r.module = 'pages' THEN 'page-records' ELSE r.module END AS href,
      ${columns('r')} FROM "AdminRecord" r WHERE r."deletedAt" IS NULL AND r.module IN (${Prisma.join(modules)})`);
    if (hasPermission(role, 'blog.read'))
      parts.push(Prisma.sql`SELECT r.id, r.title, r.status,
      CASE WHEN r.kind = 'resource' THEN 'resources' ELSE 'blog' END AS module,
      '/admin/insights'::text AS href, ${columns('r')} FROM "InsightArticle" r`);
    if (hasPermission(role, 'pages.read')) {
      parts.push(Prisma.sql`SELECT r.slug || '/' || r.locale::text AS id,
        'Company / ' || r.slug || ' (' || r.locale::text || ')' AS title,
        CASE WHEN r.published THEN 'published' ELSE 'draft' END AS status,
        'company'::text AS module, '/admin/company'::text AS href, ${columns('r')} FROM "CompanyPage" r`);
      // Extract only the summary fields; never fetch full draft/published document bodies.
      parts.push(Prisma.sql`SELECT r.id,
        COALESCE(NULLIF(r.draft #>> '{translations,en,title}', ''), NULLIF(r.draft #>> '{translations,tr,title}', ''), NULLIF(r.draft #>> '{translations,ar,title}', ''), r.path) AS title,
        CASE WHEN r."publishedAt" IS NOT NULL THEN 'published' ELSE 'draft' END AS status,
        'pages'::text AS module, '/admin/pages?id=' || r.id AS href, ${columns('r')}
        FROM "CmsPage" r WHERE r."deletedAt" IS NULL`);
    }
    if (hasPermission(role, 'leads.read'))
      parts.push(Prisma.sql`SELECT r.id,
      concat_ws(' ', r.name, r.company, r.email) AS title, r.status::text AS status,
      'leads'::text AS module, '/admin/leads?lead=' || r.id AS href,
      r."createdAt", r."updatedAt", NULL::text AS "createdById", r."updatedById"
      FROM "Lead" r WHERE r."deletedAt" IS NULL`);
  }
  return parts.length ? Prisma.join(parts, ' UNION ALL ') : empty;
}
export function adminSearchQueries(q: AdminSearchQuery, role: string, trash = false) {
  const source = adminSearchSource(role, trash);
  const filter = Prisma.sql`WITH all_rows AS (${source}), filtered AS (
    SELECT * FROM all_rows WHERE (${q.q} = '' OR strpos(lower(title), lower(${q.q})) > 0 OR (module = 'pages' AND EXISTS (SELECT 1 FROM "CmsPage" p WHERE p.id = all_rows.id AND strpos(lower(p.path), lower(${q.q})) > 0)))
      AND (${q.status} = '' OR status = ${q.status})
  )`;
  const sort = Prisma.raw(`"${q.sort}"`); // Validated enum, never raw caller input.
  const direction = q.direction === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  return {
    count: Prisma.sql`${filter} SELECT count(*)::int AS total FROM filtered`,
    rows: Prisma.sql`${filter} SELECT * FROM filtered ORDER BY ${sort} ${direction}, id ASC, module ASC
      LIMIT ${q.limit} OFFSET ${(q.page - 1) * q.limit}`,
  };
}
