import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conceptPayload, loadConcepts } from '../scripts/lib/solution-concepts.mjs';

test('solution concepts have complete, distinct EN/TR/AR CMS sections and honest publication copy', async () => {
  const concepts = await loadConcepts();
  assert.equal(concepts.length, 5);
  assert.equal(new Set(concepts.map((c) => c.slug)).size, 5);
  const allIds = new Set();
  for (const [order, concept] of concepts.entries()) {
    const payload = conceptPayload(concept, order);
    assert.deepEqual(payload.projectIds, [], 'Concepts must not masquerade as client case studies');
    assert.deepEqual(payload.industryIds, []);
    for (const t of payload.translations) {
      assert.equal(t.blocks.length, 9);
      assert.equal(t.blocks[0].area, 'hero');
      assert.ok(
        t.shortDescription.startsWith(
          { en: 'Solution concept:', tr: 'Çözüm konsepti:', ar: 'تصور حل:' }[t.locale],
        ),
      );
      assert.equal(
        t.seoDescription,
        t.shortDescription,
        'Search snippets retain the concept label',
      );
      const faq = t.blocks.find((b) => b.area === 'faq').content;
      assert.equal(faq.items.length, 2);
      assert.match(faq.items[0].answer, /not a completed|değil|وليس مشروعًا/);
      for (const block of t.blocks) {
        assert.ok(!allIds.has(block.content.id));
        allIds.add(block.content.id);
      }
      assert.equal(t.blocks.at(-1).content.href, '/contact');
      assert.ok(concept.translations[t.locale].measurement.length > 100);
    }
    assert.deepEqual(
      payload,
      conceptPayload(concept, order),
      'Block IDs remain stable across imports',
    );
    assert.ok(concept.sources.every((url) => new URL(url).protocol === 'https:'));
  }
});
