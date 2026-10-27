import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  journeyPath,
  journeyProgress,
  automationJourneyLeadMessage,
} from '../apps/web/src/lib/automation-journey.ts';
import { automationServiceCopy } from '../apps/web/src/content/intelligent-automation.ts';
test('journey connector handles mobile, alternating desktop, mirrored layout and expanded rows', () => {
  assert.equal(journeyPath([]), '');
  assert.equal(
    journeyPath([
      { x: 30, y: 30, bottom: 230 },
      { x: 30, y: 310, bottom: 500 },
    ]),
    'M 30 30 L 30 310',
  );
  const points = [
    { x: 44, y: 44, bottom: 280, nextTop: 350 },
    { x: 650, y: 394, bottom: 600 },
  ];
  const path = journeyPath(points);
  assert.match(path, /^M 44 44 L 44 293 Q 44 315 66 315/);
  assert.ok(path.endsWith('L 650 394'));
  const mirrored = journeyPath(points.map((p) => ({ ...p, x: 1200 - p.x })));
  assert.ok(mirrored.startsWith('M 1156 44 L 1156 293 Q 1156 315 1134 315'));
  const expanded = journeyPath([
    { ...points[0], bottom: 480, nextTop: 550 },
    { ...points[1], y: 594 },
  ]);
  assert.match(expanded, /Q 44 515 66 515/);
  assert.equal(journeyPath([{ x: NaN, y: 1, bottom: 10 }]), '');
});
test('scroll progress is bounded, finite and deterministic', () => {
  assert.equal(journeyProgress(50, 550, -100), 0);
  assert.equal(journeyProgress(50, 550, 300), 0.5);
  assert.equal(journeyProgress(50, 550, 900), 1);
  assert.equal(journeyProgress(50, 50, 100), 0);
  assert.equal(journeyProgress(50, NaN, 100), 0);
});
test('all five stages have matching ids, outputs and a closed-set contact handoff in both languages', () => {
  assert.equal(automationServiceCopy.ar.stages.length, 5);
  assert.deepEqual(
    automationServiceCopy.ar.stages.map((s) => s.id),
    automationServiceCopy.en.stages.map((s) => s.id),
  );
  for (const locale of ['ar', 'en'])
    for (const stage of automationServiceCopy[locale].stages) {
      assert.ok(stage.output && stage.body && stage.tasks.length === 3);
      const message = automationJourneyLeadMessage(
        { journey: stage.id, note: 'PRIVATE-DATA' },
        locale,
      );
      assert.ok(message.includes(stage.title) && message.includes(stage.question));
      assert.ok(!message.includes('PRIVATE-DATA'));
    }
  for (const journey of [
    undefined,
    [],
    ['discovery'],
    'unknown',
    '<script>',
    'https://external.invalid',
  ])
    assert.equal(automationJourneyLeadMessage({ journey }, 'ar'), undefined);
});
