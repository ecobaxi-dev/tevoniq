import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  articleWriteSchema,
  articleBlockSchema,
  estimateReadingTime,
} from '../packages/validation/dist/index.js';
import {
  publicArticleWhere,
  CmsInsightsController,
} from '../apps/api/dist/insights/insights.controller.js';
import { insightsRss, articleStructuredData } from '../apps/web/src/lib/insight-format.ts';
const draft = () => ({
  title: 'Test',
  slug: 'test',
  excerpt: '',
  content: [],
  coverImage: '',
  coverImageAlt: '',
  author: '',
  categoryId: null,
  tagIds: [],
  publicationDate: null,
  readingTime: 1,
  featured: false,
  status: 'draft',
  language: 'en',
  kind: 'blog',
  seoTitle: '',
  seoDescription: '',
  ogImage: '',
  canonicalUrl: '',
  version: 0,
});
test('Insights allow incomplete drafts and archives but require complete publishable content', () => {
  assert.equal(articleWriteSchema.safeParse(draft()).success, true);
  assert.equal(articleWriteSchema.safeParse({ ...draft(), status: 'archived' }).success, true);
  for (const status of ['published', 'scheduled'])
    assert.equal(articleWriteSchema.safeParse({ ...draft(), status }).success, false);
  assert.equal(articleWriteSchema.safeParse({ ...draft(), status: 'unknown' }).success, false);
});
test('Structured articles reject raw HTML blocks and unsafe media or links', () => {
  assert.equal(
    articleBlockSchema.safeParse({ type: 'html', html: '<script>bad()</script>' }).success,
    false,
  );
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', '//example.com'])
    assert.equal(articleBlockSchema.safeParse({ type: 'link', text: 'Link', url }).success, false);
  assert.equal(
    articleWriteSchema.safeParse({ ...draft(), coverImage: 'https://example.com/image.png' })
      .success,
    false,
  );
  assert.equal(estimateReadingTime([{ type: 'paragraph', text: 'word '.repeat(401) }]), 3);
});
test('All public article queries share due-date, status, and language constraints', () => {
  const now = new Date('2026-09-09T12:00:00Z');
  assert.deepEqual(publicArticleWhere('ar', now), {
    language: 'ar',
    status: { in: ['published', 'scheduled'] },
    publicationDate: { lte: now },
  });
});
test('Stale article saves cannot change tags or audit history', async () => {
  const controller = new CmsInsightsController({
    $transaction: (fn) =>
      fn({
        insightTaxonomy: { count: async () => 0 },
        insightArticle: { updateMany: async () => ({ count: 0 }) },
        insightArticleTag: { deleteMany: () => assert.fail('Must not update tags') },
        cmsAudit: { create: () => assert.fail('Must not audit') },
      }),
  });
  await assert.rejects(
    controller.update(randomUUID(), { ...draft(), version: 1 }, { cmsUser: { id: randomUUID() } }),
    { status: 409 },
  );
});
test('RSS escapes XML and uses stable IDs; Article data includes author and canonical URL', () => {
  const article = {
    ...draft(),
    id: randomUUID(),
    title: '<Test> & "title"',
    author: 'Test Author',
    excerpt: '<script>safe text</script>',
    publicationDate: '2026-09-09T12:00:00.000Z',
    updatedAt: '2026-09-09T12:00:00.000Z',
    category: null,
    tags: [],
    canonicalUrl: 'https://example.com/original',
  };
  const xml = insightsRss([article], 'https://tevoniq.example', 'en');
  assert.match(xml, /&lt;Test&gt; &amp; &quot;title&quot;/);
  assert.doesNotMatch(xml, /<script>/);
  assert.match(xml, new RegExp(article.id));
  const structured = articleStructuredData(article, 'https://tevoniq.example');
  assert.equal(structured['@type'], 'Article');
  assert.equal(structured.author.name, 'Test Author');
  assert.equal(structured.mainEntityOfPage['@id'], article.canonicalUrl);
});
