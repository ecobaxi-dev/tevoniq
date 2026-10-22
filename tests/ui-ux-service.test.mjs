import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { serviceWriteSchema } from '../packages/validation/dist/index.js';

test('UI/UX content is publishable in every supported language with complete process and FAQ', async () => {
  const value = serviceWriteSchema.parse(
    JSON.parse(await readFile(new URL('../content/ui-ux-service.json', import.meta.url), 'utf8')),
  );
  assert.equal(value.slug, 'ui-ux-design');
  assert.deepEqual(value.translations.map((t) => t.locale).sort(), ['ar', 'en', 'tr']);
  for (const translation of value.translations) {
    assert.equal(translation.published, true);
    assert.equal(translation.blocks[0].type, 'hero');
    assert.equal(translation.blocks.find((b) => b.type === 'capabilities').items.length, 6);
    assert.ok(translation.blocks.find((b) => b.type === 'faq').items.length >= 5);
    assert.equal(translation.blocks.at(-1).href, '/contact');
    assert.doesNotMatch(JSON.stringify(translation), /N-iX|Fortune 500/i);
  }
});
