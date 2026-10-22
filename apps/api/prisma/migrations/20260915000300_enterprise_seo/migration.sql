-- SEO inventory follows the same public publication gates as global search.
CREATE INDEX "AdminRecord_seo_path_idx" ON "AdminRecord" (language, (data->>'path'), "updatedAt" DESC)
WHERE module = 'seo' AND status = 'published' AND "deletedAt" IS NULL;
CREATE INDEX "AdminRecord_settings_key_idx" ON "AdminRecord" ((data->>'key'), "updatedAt" DESC)
WHERE module = 'site-settings' AND status = 'published' AND "deletedAt" IS NULL;

CREATE VIEW public_seo_routes AS
SELECT d.id, d.type,
coalesce(nullif(regexp_replace(d.url, '^/(en|tr|ar)', ''), ''), '/') AS route,
d.locale, d.title, coalesce(a."canonicalUrl", '') AS canonical,
coalesce(s."updatedAt", so."updatedAt", i."updatedAt", p."updatedAt", a."updatedAt", cp."updatedAt", c."updatedAt") AS "updatedAt"
FROM public_search_documents d
LEFT JOIN "Service" s ON d.type = 'service' AND d.id = s.id
LEFT JOIN "Solution" so ON d.type = 'solution' AND d.id = so.id
LEFT JOIN "Industry" i ON d.type = 'industry' AND d.id = i.id
LEFT JOIN "Project" p ON d.type = 'project' AND d.id = p.id
LEFT JOIN "InsightArticle" a ON d.type IN ('blog','resource') AND d.id = a.id
LEFT JOIN "CmsPage" cp ON d.type = 'page' AND d.id = cp.id
LEFT JOIN "CompanyPage" c ON d.type = 'page' AND d.id = c.slug || ':' || c.locale::text
UNION ALL
SELECT j.id, 'job', '/careers/' || j.slug, l.locale, j.title, '', j."updatedAt"
FROM "CareerJob" j CROSS JOIN (VALUES ('en'),('tr'),('ar')) l(locale)
WHERE j.status = 'PUBLISHED' AND j."publishedAt" <= CURRENT_TIMESTAMP
AND (j."closingDate" IS NULL OR j."closingDate" > CURRENT_TIMESTAMP)
UNION ALL
SELECT 'company:' || v.slug, 'page', '/company/' || v.slug, 'en', v.title, '', NULL::timestamp
FROM (VALUES ('about','About TEVONIQ'),('why-tevoniq','Why TEVONIQ'),('team','Team'),('partners','Partners'),('careers','Careers')) v(slug,title)
WHERE NOT EXISTS (SELECT 1 FROM "CompanyPage" c WHERE c.slug = v.slug AND c.locale = 'en')
UNION ALL
SELECT 'route:' || v.route, 'page', v.route, l.locale, v.title, '', NULL::timestamp
FROM (VALUES ('/insights','Insights'),('/insights/case-studies','Case Studies')) v(route,title)
CROSS JOIN (VALUES ('en'),('tr'),('ar')) l(locale);

