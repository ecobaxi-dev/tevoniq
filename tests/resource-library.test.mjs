import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resourceLibrary, resourceDownload } from '../apps/web/src/content/resource-library.ts';
import { buildEditorialArticles } from '../scripts/lib/editorial-articles.mjs';
import { articlePath, insightsRss } from '../apps/web/src/lib/insight-format.ts';
test('Arabic resource release has distinct indexable resource paths and real direct-download files', async () => {
  const { articles } = await buildEditorialArticles(
    'https://www.tevoniq.com',
    new Date(),
    '2026-11-14-resource-library',
  );
  assert.equal(articles.length, 3);
  assert.equal(Object.keys(resourceLibrary).length, 4);
  for (const a of articles) {
    assert.equal(a.kind, 'resource');
    assert.equal(articlePath(a), `/ar/insights/resources/${a.slug}`);
    assert.ok(resourceDownload(a.slug));
    await access(new URL('../apps/web/public' + new URL(a.coverImage).pathname, import.meta.url));
    assert.ok(
      insightsRss(
        [{ ...a, category: null, tags: [], updatedAt: a.publicationDate }],
        'https://www.tevoniq.com',
        'ar',
      ).includes(`/ar/insights/resources/${a.slug}`),
    );
  }
  for (const r of Object.values(resourceLibrary)) {
    const b = await readFile(
      new URL('../apps/web/public/downloads/resources/' + r.file, import.meta.url),
    );
    assert.ok(b.length > 1000);
    assert.equal(
      b.subarray(0, r.format === 'PDF' ? 4 : 2).toString(),
      r.format === 'PDF' ? '%PDF' : 'PK',
    );
  }
  assert.equal(resourceDownload('../../.env'), null);
});
