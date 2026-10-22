-- Live view: publication changes and deletions are reflected in the same transaction.
-- Explicit simple configuration supports English, Turkish and Arabic tokenization.
CREATE INDEX "ServiceTranslation_search_idx" ON "ServiceTranslation" USING GIN ((setweight(to_tsvector('simple', "title"), 'A') || setweight(to_tsvector('simple', "summary"), 'B')));
CREATE INDEX "SolutionTranslation_search_idx" ON "SolutionTranslation" USING GIN ((setweight(to_tsvector('simple', "name"), 'A') || setweight(to_tsvector('simple', "shortDescription"), 'B')));
CREATE INDEX "IndustryTranslation_search_idx" ON "IndustryTranslation" USING GIN ((setweight(to_tsvector('simple', "name"), 'A') || setweight(to_tsvector('simple', "shortDescription"), 'B')));
CREATE INDEX "ProjectTranslation_search_idx" ON "ProjectTranslation" USING GIN ((setweight(to_tsvector('simple', "title"), 'A') || setweight(to_tsvector('simple', "summary"), 'B')));
CREATE INDEX "InsightArticle_search_idx" ON "InsightArticle" USING GIN ((setweight(to_tsvector('simple', title), 'A') || setweight(to_tsvector('simple', excerpt), 'B')));
CREATE VIEW public_search_documents AS
SELECT p.id, 'service'::text AS type, t.locale::text AS locale, t."title" AS title, t."summary" AS excerpt, '/' || t.locale::text || '/services/' || p.slug AS url, setweight(to_tsvector('simple', t."title"), 'A') || setweight(to_tsvector('simple', t."summary"), 'B') AS vector
FROM "Service" p JOIN "ServiceTranslation" t ON t."serviceId" = p.id
WHERE p.active AND p."deletedAt" IS NULL AND t.published
UNION ALL
SELECT p.id, 'solution'::text AS type, t.locale::text AS locale, t."name" AS title, t."shortDescription" AS excerpt, '/' || t.locale::text || '/solutions/' || p.slug AS url, setweight(to_tsvector('simple', t."name"), 'A') || setweight(to_tsvector('simple', t."shortDescription"), 'B') AS vector
FROM "Solution" p JOIN "SolutionTranslation" t ON t."solutionId" = p.id
WHERE p.active AND p.published AND p.status = 'PUBLISHED' AND p."deletedAt" IS NULL AND t.published
UNION ALL
SELECT p.id, 'industry'::text AS type, t.locale::text AS locale, t."name" AS title, t."shortDescription" AS excerpt, '/' || t.locale::text || '/industries/' || p.slug AS url, setweight(to_tsvector('simple', t."name"), 'A') || setweight(to_tsvector('simple', t."shortDescription"), 'B') AS vector
FROM "Industry" p JOIN "IndustryTranslation" t ON t."industryId" = p.id
WHERE p.active AND p.published AND p.status = 'PUBLISHED' AND p."deletedAt" IS NULL AND t.published
UNION ALL
SELECT p.id, 'project'::text AS type, t.locale::text AS locale, t."title" AS title, t."summary" AS excerpt, '/' || t.locale::text || '/projects/' || p.slug AS url, setweight(to_tsvector('simple', t."title"), 'A') || setweight(to_tsvector('simple', t."summary"), 'B') AS vector
FROM "Project" p JOIN "ProjectTranslation" t ON t."projectId" = p.id
WHERE p.published AND p.verified AND p."deletedAt" IS NULL AND t.published
UNION ALL
SELECT id, CASE WHEN kind = 'resource' THEN 'resource' ELSE 'blog' END, language::text, title, excerpt, '/' || language::text || '/insights/blog/' || slug, setweight(to_tsvector('simple', title), 'A') || setweight(to_tsvector('simple', excerpt), 'B')
FROM "InsightArticle" WHERE status IN ('published', 'scheduled') AND "publicationDate" <= CURRENT_TIMESTAMP
UNION ALL
SELECT slug || ':' || locale::text, 'page', locale::text, content->>'title', coalesce(content->>'seoDescription', ''), '/' || locale::text || '/company/' || slug,
to_tsvector('simple', coalesce(content->>'title', '') || ' ' || coalesce(content->>'seoDescription', ''))
FROM "CompanyPage" WHERE published
UNION ALL
SELECT p.id, 'page', l.key, l.value->>'title', coalesce(l.value->>'seoDescription', ''), '/' || l.key || CASE WHEN p.path = '/' THEN '' ELSE p.path END,
to_tsvector('simple', coalesce(l.value->>'title', '') || ' ' || coalesce(l.value->>'seoDescription', ''))
FROM "CmsPage" p CROSS JOIN LATERAL jsonb_each(p.published->'translations') l
WHERE p."deletedAt" IS NULL AND p."publishedAt" IS NOT NULL AND l.key IN ('en', 'tr', 'ar') AND l.value->>'title' IS NOT NULL
UNION ALL
SELECT 'route:' || path, 'page', locale, title, excerpt, '/' || locale || path,
to_tsvector('simple', title || ' ' || excerpt)
FROM (VALUES
('', 'en', 'Home', 'TEVONIQ'),
('', 'tr', 'Ana Sayfa', 'TEVONIQ'),
('', 'ar', 'الرئيسية', 'TEVONIQ'),
('/contact', 'en', 'Contact', ''),
('/contact', 'tr', 'İletişim', ''),
('/contact', 'ar', 'اتصل بنا', ''),
('/request-quote', 'en', 'Request a Quote', ''),
('/request-quote', 'tr', 'Teklif Al', ''),
('/request-quote', 'ar', 'طلب عرض سعر', ''),
('/careers', 'en', 'Careers', ''),
('/careers', 'tr', 'Kariyer', ''),
('/careers', 'ar', 'الوظائف', ''),
('/services', 'en', 'Services', ''),
('/services', 'tr', 'Hizmetler', ''),
('/services', 'ar', 'الخدمات', ''),
('/solutions', 'en', 'Solutions', ''),
('/solutions', 'tr', 'Çözümler', ''),
('/solutions', 'ar', 'الحلول', ''),
('/industries', 'en', 'Industries', ''),
('/industries', 'tr', 'Sektörler', ''),
('/industries', 'ar', 'القطاعات', ''),
('/projects', 'en', 'Projects', ''),
('/projects', 'tr', 'Projeler', ''),
('/projects', 'ar', 'المشاريع', ''),
('/insights/blog', 'en', 'Blog', ''),
('/insights/blog', 'tr', 'Blog', ''),
('/insights/blog', 'ar', 'المدونة', ''),
('/insights/resources', 'en', 'Resources', ''),
('/insights/resources', 'tr', 'Kaynaklar', ''),
('/insights/resources', 'ar', 'الموارد', '')
) AS routes(path, locale, title, excerpt);
