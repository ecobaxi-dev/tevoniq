import test from 'node:test';
import assert from 'node:assert/strict';
import { journeyKeyIndex, journeyCopy } from '../apps/web/src/content/solution-journey.ts';
import { solutionExperience } from '../apps/web/src/content/solution-experience.ts';

test('stage tab keyboard navigation follows physical direction in RTL and LTR and wraps', () => {
  assert.equal(journeyKeyIndex('ArrowRight', 0, 3, false), 1);
  assert.equal(journeyKeyIndex('ArrowLeft', 0, 3, false), 2);
  assert.equal(journeyKeyIndex('ArrowLeft', 0, 3, true), 1);
  assert.equal(journeyKeyIndex('ArrowRight', 0, 3, true), 2);
  assert.equal(journeyKeyIndex('Home', 2, 3, true), 0);
  assert.equal(journeyKeyIndex('End', 0, 3, false), 2);
  assert.equal(journeyKeyIndex('Tab', 0, 3, true), null);
});
test('every localized phase has matching details and an explicit deliverable', () => {
  for (const locale of ['ar', 'en', 'tr']) {
    assert.equal(journeyCopy[locale].stages.length, solutionExperience[locale].steps.length);
    assert.ok(journeyCopy[locale].stages.every((s) => s.deliverable && s.points.length === 3));
  }
});
