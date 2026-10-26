import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isUntouchedService,
  loadServiceContent,
  serviceContentPayload,
  seedTitles,
} from '../scripts/lib/service-content.mjs';

test('service content provides seven distinct, complete three-language CMS entries', async () => {
  const content = await loadServiceContent();
  assert.equal(content.length, 7);
  assert.equal(new Set(content.map((c) => c.slug)).size, 7);
  const blockIds = new Set();
  for (const [order, entry] of content.entries()) {
    const value = serviceContentPayload(entry, order);
    assert.equal(value.translations.length, 3);
    assert.deepEqual(value, serviceContentPayload(entry, order));
    assert.ok(seedTitles[entry.slug]);
    for (const t of value.translations) {
      assert.equal(t.blocks.length, 9);
      assert.equal(t.blocks[0].type, 'hero');
      assert.equal(t.blocks.at(-1).type, 'cta');
      assert.equal(t.blocks.at(-1).href, '/contact');
      assert.equal(t.seoDescription, t.summary);
      assert.ok(
        t.summary.startsWith(
          { en: 'Proposed service:', tr: 'Önerilen hizmet:', ar: 'نطاق خدمة مقترح:' }[t.locale],
        ),
      );
      assert.equal(t.blocks.find((b) => b.type === 'faq').items.length, 2);
      assert.ok(
        !t.blocks.some((b) => b.type === 'related-projects'),
        'Do not invent completed engagements',
      );
      for (const block of t.blocks) {
        assert.ok(!blockIds.has(block.id));
        blockIds.add(block.id);
      }
    }
  }
});

test('import eligibility preserves all published, modified, archived and translated records', () => {
  const seed = {
    slug: 'api-integration',
    active: false,
    deletedAt: null,
    version: 0,
    sortOrder: 0,
    createdById: null,
    updatedById: null,
    translations: [
      {
        locale: 'en',
        title: 'API Integration',
        summary: '',
        seoTitle: '',
        seoDescription: '',
        published: false,
        blocks: [],
      },
    ],
  };
  assert.equal(isUntouchedService(seed), true);
  for (const change of [
    { active: true },
    { deletedAt: new Date() },
    { version: 1 },
    { sortOrder: 2 },
    { createdById: 'editor' },
    { updatedById: 'editor' },
    { slug: 'unrelated-service' },
  ])
    assert.equal(isUntouchedService({ ...seed, ...change }), false);
  for (const change of [
    { locale: 'ar' },
    { title: 'Edited title' },
    { summary: 'Editorial draft' },
    { seoTitle: 'Draft SEO' },
    { seoDescription: 'Draft metadata' },
    { published: true },
    { blocks: [{ type: 'hero' }] },
  ])
    assert.equal(
      isUntouchedService({ ...seed, translations: [{ ...seed.translations[0], ...change }] }),
      false,
    );
  assert.equal(
    isUntouchedService({
      ...seed,
      translations: [...seed.translations, { ...seed.translations[0], locale: 'tr' }],
    }),
    false,
  );
  assert.equal(isUntouchedService(null), false);
});
