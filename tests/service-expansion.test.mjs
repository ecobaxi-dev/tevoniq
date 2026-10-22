import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadExpansion,
  expansionPayload,
  untouchedExpansionSeed,
} from '../scripts/lib/service-expansion.mjs';

test('expanded service menu has unique slugs and valid localized CMS content', async () => {
  const catalog = await loadExpansion();
  const entries = catalog.groups.flatMap((group) => group.services);
  assert.ok(entries.length >= 40);
  const ids = new Set();
  for (const group of catalog.groups)
    for (const entry of group.services) {
      const payload = expansionPayload(entry, group, 100);
      assert.deepEqual(payload, expansionPayload(entry, group, 100));
      assert.equal(payload.translations.length, 3);
      for (const translation of payload.translations) {
        assert.equal(translation.published, true);
        assert.equal(translation.blocks[0].type, 'hero');
        assert.equal(translation.blocks.at(-1).href, '/contact');
        assert.ok(!JSON.stringify(translation).includes('N-iX'));
        for (const block of translation.blocks) {
          assert.ok(!ids.has(block.id));
          ids.add(block.id);
        }
      }
    }
});

test('expansion importer protects published, edited and archived records', () => {
  const before = {
    slug: 'devops',
    active: false,
    deletedAt: null,
    version: 0,
    sortOrder: 0,
    createdById: null,
    updatedById: null,
    translations: [
      {
        locale: 'en',
        title: 'DevOps',
        published: false,
        summary: '',
        seoTitle: '',
        seoDescription: '',
        blocks: [],
      },
    ],
  };
  assert.equal(untouchedExpansionSeed(before), true);
  for (const patch of [
    { active: true },
    { deletedAt: new Date() },
    { version: 1 },
    { sortOrder: 1 },
    { updatedById: 'editor' },
    { translations: [] },
  ])
    assert.equal(untouchedExpansionSeed({ ...before, ...patch }), false);
  for (const patch of [
    { published: true },
    { locale: 'ar' },
    { summary: 'Saved draft' },
    { blocks: [{ type: 'hero' }] },
  ])
    assert.equal(
      untouchedExpansionSeed({
        ...before,
        translations: [{ ...before.translations[0], ...patch }],
      }),
      false,
    );
});
