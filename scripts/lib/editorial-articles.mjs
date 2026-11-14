import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { articleWriteSchema, estimateReadingTime } from '@tevoniq/validation';
const root = new URL('../../content/blog-ar/', import.meta.url);
export const editorialReleaseId = '2026-11-14-sme-guides';
export function editorialId(key) {
  const h = createHash('sha256')
    .update(`tevoniq:editorial:${editorialReleaseId}:${key}`)
    .digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
export function markdownBlocks(markdown) {
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .flatMap((paragraph) => {
      // Each supported Markdown construct maps to a safe CMS block, never raw HTML.
      const lines = paragraph.split('\n');
      if (lines[0].startsWith('## ')) {
        if (lines.length > 1)
          return [
            { type: 'heading', level: 2, text: lines[0].slice(3) },
            ...markdownBlocks(lines.slice(1).join('\n')),
          ];
        return [{ type: 'heading', level: 2, text: lines[0].slice(3) }];
      }
      if (lines.every((line) => line.startsWith('- ')))
        return [{ type: 'list', ordered: false, items: lines.map((line) => line.slice(2)) }];
      const link = lines.at(-1).match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);
      if (link)
        return [
          ...(lines.length > 1 ? markdownBlocks(lines.slice(0, -1).join('\n')) : []),
          { type: 'link', text: link[1], url: link[2] },
        ];
      return [{ type: 'paragraph', text: paragraph }];
    });
}
export async function buildEditorialArticles(origin, publishedAt = new Date()) {
  const site = new URL(origin);
  if (
    !['https:', 'http:'].includes(site.protocol) ||
    site.username ||
    site.password ||
    site.origin !== origin
  )
    throw new Error('Exact HTTP(S) site origin required');
  const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
  if (manifest.release !== editorialReleaseId) throw new Error('Unexpected editorial release');
  const categories = [
    {
      id: editorialId('websites'),
      name: 'المواقع وتجربة المستخدم',
      slug: 'websites-and-experience',
      language: 'ar',
      type: 'category',
      version: 1,
    },
    {
      id: editorialId('operations'),
      name: 'إدارة العمل الرقمي',
      slug: 'digital-business-operations',
      language: 'ar',
      type: 'category',
      version: 1,
    },
  ];
  const articles = [];
  for (const item of manifest.articles) {
    const categoryId = categories[item.category === 'websites' ? 0 : 1].id;
    const markdown = await readFile(new URL(`${item.slug}.md`, root), 'utf8');
    const content = markdownBlocks(markdown).map((block) =>
      block.type === 'link' && block.url.startsWith('https://www.tevoniq.com/')
        ? { ...block, url: site.origin + block.url.slice('https://www.tevoniq.com'.length) }
        : block,
    );
    const image = `${site.origin}/brand/blog/${item.slug}.png`;
    const data = articleWriteSchema.parse({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content,
      coverImage: image,
      coverImageAlt: item.coverAlt,
      author: 'TEVONIQ',
      categoryId,
      tagIds: [],
      publicationDate: publishedAt.toISOString(),
      readingTime: estimateReadingTime(content),
      featured: item.featured,
      status: 'published',
      language: 'ar',
      kind: 'blog',
      seoTitle: item.seoTitle,
      seoDescription: item.excerpt,
      ogImage: '',
      canonicalUrl: '',
      version: 0,
    });
    articles.push({ id: editorialId(item.slug), ...data });
  }
  return { categories, articles };
}
/** One atomic release, insert-only: CMS edits, drafts, archives and deletions survive restarts. */
export async function publishEditorialArticles(db, origin, actorId) {
  const releaseId = editorialId('release');
  const release = await buildEditorialArticles(origin);
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(7411142026)`;
      if (
        await tx.cmsAudit.findFirst({
          where: { entityId: releaseId, action: 'editorial.release.publish' },
        })
      )
        return { alreadyApplied: true, created: 0 };
      const ids = new Map();
      for (const category of release.categories) {
        const existing = await tx.insightTaxonomy.findUnique({
          where: { slug_language_type: { slug: category.slug, language: 'ar', type: 'category' } },
        });
        const row = existing || (await tx.insightTaxonomy.create({ data: category }));
        ids.set(category.id, row.id);
      }
      let created = 0;
      for (const article of release.articles) {
        if (
          await tx.insightArticle.findUnique({
            where: { slug_language: { slug: article.slug, language: 'ar' } },
          })
        )
          continue;
        const { tagIds: _tags, version: _version, ...data } = article;
        void _tags;
        void _version;
        await tx.insightArticle.create({
          data: {
            ...data,
            publicationDate: new Date(data.publicationDate),
            categoryId: ids.get(data.categoryId),
            createdById: actorId,
            updatedById: actorId,
          },
        });
        await tx.cmsAudit.create({
          data: { actorId, entityId: data.id, action: 'insights.published' },
        });
        created++;
      }
      await tx.cmsAudit.create({
        data: { actorId, entityId: releaseId, action: 'editorial.release.publish' },
      });
      return { alreadyApplied: false, created };
    },
    { timeout: 30000 },
  );
}
