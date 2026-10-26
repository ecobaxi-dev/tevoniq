import { test } from 'node:test';
import assert from 'node:assert/strict';
import { workSystems } from '../apps/web/src/content/work-systems.ts';
import {
  initialSystemRecords,
  moveDemoStock,
  demoSystemSummary,
} from '../apps/web/src/lib/work-system-demo.ts';
const system = (slug) => workSystems.find((item) => item.slug === slug);
test('system previews receive independent data in each language and do not mutate the catalogue', () => {
  const model = system('maintenance'),
    first = initialSystemRecords(model, 'ar'),
    second = initialSystemRecords(model, 'en');
  first[0].title = 'changed';
  first[0].notes.push('local');
  first[0].history.push('local');
  assert.equal(second[0].title, 'AC inspection');
  assert.deepEqual(second[0].notes, []);
  assert.equal(model.records[0].ar.title, 'فحص جهاز تكييف');
  assert.equal(initialSystemRecords(model, 'ar')[0].history.length, 1);
});
test('stock movements cross thresholds, preserve history and leave the previous record intact', () => {
  const record = initialSystemRecords(system('inventory'), 'en')[1];
  const replenished = moveDemoStock(record, 5, '  receipt  ');
  assert.equal(replenished.quantity, 10);
  assert.equal(replenished.status, 0);
  assert.equal(replenished.history[0], '+5 · receipt');
  assert.equal(record.quantity, 5);
  const low = moveDemoStock(replenished, -1, 'issue');
  assert.equal(low.status, 1);
  const empty = moveDemoStock(low, -9, 'issue remaining');
  assert.equal(empty.status, 2);
  assert.equal(empty.quantity, 0);
  assert.equal(empty.history.length, 4);
});
test('stock movements reject overdraw, non-integers, missing reasons and unsupported balances', () => {
  const record = initialSystemRecords(system('inventory'), 'en')[1];
  for (const delta of [-6, 0, 1.5, NaN, Infinity, 1000000, Number.MAX_SAFE_INTEGER])
    assert.throws(() => moveDemoStock(record, delta, 'test'));
  assert.throws(() => moveDemoStock(record, 1, '  '));
  assert.equal(record.quantity, 5);
});
test('inventory summaries reflect quantity, low-stock conditions and unit value after a movement', () => {
  const model = system('inventory'),
    records = initialSystemRecords(model, 'ar');
  assert.deepEqual(demoSystemSummary(model, records), { total: 4, open: 2, done: 1, value: 2370 });
  const changed = records.map((r) => (r.id === 2 ? moveDemoStock(r, 5, 'توريد') : r));
  assert.deepEqual(demoSystemSummary(model, changed), { total: 4, open: 1, done: 1, value: 2460 });
});
test('pipeline, appointment and task summaries exclude completed or unconfirmed work as appropriate', () => {
  for (const [slug, value] of [
    ['sales-crm', 13500],
    ['appointments', 105],
    ['projects-tasks', 10],
  ]) {
    const model = system(slug),
      records = initialSystemRecords(model, 'en');
    assert.equal(demoSystemSummary(model, records).value, value);
    assert.equal(demoSystemSummary(model, records).open, 3);
  }
  const model = system('sales-crm'),
    records = initialSystemRecords(model, 'en');
  records[0].status = 3;
  assert.equal(demoSystemSummary(model, records).value, 9500);
  assert.deepEqual(demoSystemSummary(model, []), { total: 0, open: 0, done: 0, value: 0 });
});
