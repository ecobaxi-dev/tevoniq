import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { solutionScenes, illustrationCopy } from '../apps/web/src/config/solution-illustrations.ts';

test('every established solution has its own explanatory scene instead of reusing three images', async () => {
  const concepts = JSON.parse(
    await readFile(
      new URL('../apps/api/prisma/content/solution-concepts.json', import.meta.url),
      'utf8',
    ),
  );
  assert.deepEqual(Object.keys(solutionScenes).sort(), concepts.map((c) => c.slug).sort());
  assert.equal(new Set(Object.values(solutionScenes)).size, concepts.length);
  for (const locale of ['en', 'ar', 'tr'])
    for (const scene of Object.values(solutionScenes)) {
      assert.ok(illustrationCopy[locale][scene].title);
      assert.ok(illustrationCopy[locale][scene].description);
      assert.equal(illustrationCopy[locale][scene].labels.length, 3);
      assert.ok(illustrationCopy[locale][scene].labels.every((label) => label.length > 0));
    }
});
