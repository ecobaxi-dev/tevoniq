import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { buildEditorialArticles, markdownBlocks } from '../scripts/lib/editorial-articles.mjs';
import { articleWriteSchema } from '../packages/validation/dist/index.js';
import { articleStructuredData, insightsRss } from '../apps/web/src/lib/insight-format.ts';

test('Arabic editorial articles validate, reference multiple primary sources and link only to this origin internally', async () => {
  const { articles, categories } = await buildEditorialArticles(
    'https://example.test',
    new Date('2026-11-14T00:00:00Z'),
  );
  assert.equal(articles.length, 5);
  assert.equal(new Set(articles.map((a) => a.slug)).size, 5);
  const sources = new Set();
  for (const { id, ...article } of articles) {
    assert.equal(articleWriteSchema.safeParse(article).success, true);
    assert.equal(article.language, 'ar');
    assert.equal(article.author, 'TEVONIQ');
    assert.ok(categories.some((c) => c.id === article.categoryId));
    assert.ok(article.content.filter((b) => b.type === 'heading').length >= 4);
    const links = article.content.filter((b) => b.type === 'link').map((b) => new URL(b.url));
    assert.ok(links.some((u) => u.origin === 'https://example.test'));
    for (const url of links) if (url.origin !== 'https://example.test') sources.add(url.hostname);
    await access(
      new URL('../apps/web/public' + new URL(article.coverImage).pathname, import.meta.url),
    );
    const publicArticle = {
      ...article,
      id,
      category: categories.find((c) => c.id === article.categoryId),
      tags: [],
      updatedAt: article.publicationDate,
    };
    assert.equal(
      articleStructuredData(publicArticle, 'https://example.test').author['@type'],
      'Organization',
    );
    assert.ok(insightsRss([publicArticle], 'https://example.test', 'ar').includes(article.slug));
  }
  assert.ok(sources.size >= 6);
});
test('Structured Markdown converts headings, lists and adjacent source links without executable HTML', () => {
  assert.deepEqual(
    markdownBlocks('## العنوان\nنص\n[مصدر](https://example.test/)\n\n- أ\n- ب').map((b) => b.type),
    ['heading', 'paragraph', 'link', 'list'],
  );
});

test('Second release adds five distinct guides while preserving the first release IDs', async () => {
  const first = await buildEditorialArticles('https://www.tevoniq.com');
  const second = await buildEditorialArticles(
    'https://www.tevoniq.com',
    new Date(),
    '2026-11-14-growth-guides',
  );
  assert.equal(second.articles.length, 5);
  assert.equal(new Set([...first.articles, ...second.articles].map((a) => a.id)).size, 10);
  assert.equal(new Set([...first.articles, ...second.articles].map((a) => a.slug)).size, 10);
  for (const { id, ...article } of second.articles) {
    assert.equal(articleWriteSchema.safeParse(article).success, true);
    assert.ok(article.content.filter((b) => b.type === 'heading').length >= 4);
    assert.ok(
      article.content.filter((b) => b.type === 'link' && !b.url.includes('tevoniq.com')).length >=
        2,
    );
    await access(
      new URL('../apps/web/public' + new URL(article.coverImage).pathname, import.meta.url),
    );
    assert.ok(id);
  }
  await assert.rejects(
    () => buildEditorialArticles('https://www.tevoniq.com', new Date(), '../../unknown'),
    /Unknown editorial release/,
  );
});
