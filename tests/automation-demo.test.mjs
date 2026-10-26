import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  automationCases,
  defaultAutomationInput,
} from '../apps/web/src/content/automation-cases.ts';
import { runAutomationDemo, appendAutomationReceipt } from '../apps/web/src/lib/automation-demo.ts';
const model = (slug) => automationCases.find((item) => item.slug === slug);
const run = (slug, overrides = {}, ledger = [], failure = false) =>
  runAutomationDemo(
    model(slug),
    { ...defaultAutomationInput(slug), ...overrides },
    ledger,
    'en',
    failure,
  );
test('all six automation examples produce local outcomes with appropriate approvals', () => {
  for (const example of automationCases) {
    const result = run(example.slug, { approved: true });
    assert.equal(result.outcome, 'completed', example.slug);
    assert.ok(result.effects.length > 0);
    assert.ok(result.draft);
    assert.equal(result.steps.length, 5);
  }
});
test('pending approvals do not commit and the same event can proceed once approved', () => {
  for (const slug of ['order-sync', 'invoice-follow-up', 'stock-alerts']) {
    const waiting = run(slug);
    assert.equal(waiting.outcome, 'waiting');
    assert.deepEqual(waiting.effects, []);
    const ledger = appendAutomationReceipt([], 'DEMO-1001', waiting);
    assert.equal(ledger.length, 0);
    assert.equal(run(slug, { approved: true }, ledger).outcome, 'completed');
  }
});
test('completed event IDs are idempotent and changed payloads are conflicts', () => {
  const result = run('order-sync', { approved: true }),
    ledger = appendAutomationReceipt([], 'DEMO-1001', result);
  assert.equal(ledger.length, 1);
  assert.equal(run('order-sync', { approved: true }, ledger).outcome, 'duplicate');
  assert.equal(run('order-sync', { approved: true, quantity: 3 }, ledger).outcome, 'conflict');
  assert.equal(appendAutomationReceipt(ledger, 'DEMO-1001', result), ledger);
  assert.equal(
    run('order-sync', { approved: true, eventId: 'DEMO-1002' }, ledger).outcome,
    'completed',
  );
});
test('simulated destination failure is atomic and retry produces only one outcome', () => {
  const failed = run('order-sync', { approved: true }, [], true);
  assert.equal(failed.outcome, 'failed');
  assert.deepEqual(failed.effects, []);
  assert.equal(failed.draft, '');
  assert.equal(failed.steps[3], 'failed');
  assert.deepEqual(appendAutomationReceipt([], 'DEMO-1001', failed), []);
  const success = run('order-sync', { approved: true }),
    ledger = appendAutomationReceipt([], 'DEMO-1001', success);
  assert.equal(run('order-sync', { approved: true }, ledger, true).outcome, 'duplicate');
  assert.equal(ledger.length, 1);
});
test('order quantities cannot exceed stock or contain unsupported values', () => {
  for (const overrides of [
    { quantity: 6 },
    { quantity: 0 },
    { quantity: 1.5 },
    { stock: -1 },
    { amount: NaN },
    { amount: Infinity },
    { threshold: -1 },
    { quantity: 1000001 },
  ]) {
    const result = run('order-sync', { approved: true, ...overrides });
    assert.equal(result.outcome, 'failed');
    assert.deepEqual(result.effects, []);
  }
  const result = run('order-sync', { approved: true, quantity: 5 });
  assert.equal(result.outcome, 'completed');
  assert.equal(
    result.effects.find((effect) => effect.label === 'Proposed balance after order').value,
    '0',
  );
});
test('date and communication conditions skip reminders without producing messages', () => {
  assert.equal(run('appointment-reminders', { appointmentDate: '2026-11-01' }).outcome, 'skipped');
  assert.equal(run('appointment-reminders', { consent: false }).outcome, 'skipped');
  assert.equal(run('appointment-reminders', { appointmentDate: '2026-02-30' }).outcome, 'failed');
  const reminder = run('appointment-reminders');
  assert.equal(reminder.effects[0].value, '2026-11-04');
  const lead = run('lead-capture', { consent: false });
  assert.equal(lead.outcome, 'completed');
  assert.equal(lead.draft, '');
  assert.equal(lead.steps[3], 'skipped');
});
test('paid and not-yet-due invoices are skipped and consent is reviewed before drafting', () => {
  assert.equal(run('invoice-follow-up', { paid: true }).outcome, 'skipped');
  assert.equal(run('invoice-follow-up', { dueDate: '2026-12-01' }).outcome, 'skipped');
  assert.equal(run('invoice-follow-up', { consent: false, approved: true }).outcome, 'waiting');
  assert.equal(run('invoice-follow-up', { amount: 500 }).outcome, 'completed');
});
test('stock alerts respect the threshold and require approval before preparing a review', () => {
  assert.equal(run('stock-alerts', { stock: 11, threshold: 10 }).outcome, 'skipped');
  assert.equal(run('stock-alerts', { stock: 10, threshold: 10 }).outcome, 'waiting');
  const result = run('stock-alerts', { approved: true, stock: 5, threshold: 10 });
  assert.equal(result.effects[1].value, '15');
});
test('daily summary checks duplicate IDs and malformed amounts before aggregation', () => {
  const good = run('daily-summary');
  assert.equal(good.effects[0].value, '3');
  assert.equal(good.effects[1].value, '715 SAR');
  for (const orders of [
    '',
    'A,10\nA,20',
    'A,NaN',
    'A,-1',
    'A,',
    'A,10,20',
    Array.from({ length: 21 }, (_, i) => `A${i},1`).join('\n'),
  ]) {
    const result = run('daily-summary', { orders });
    assert.equal(result.outcome, 'failed');
    assert.deepEqual(result.effects, []);
  }
});
test('evaluation preserves its inputs and uncommitted runs do not alter the ledger', () => {
  const input = defaultAutomationInput('order-sync'),
    copy = structuredClone(input),
    ledger = [];
  runAutomationDemo(model('order-sync'), input, ledger, 'ar');
  assert.deepEqual(input, copy);
  assert.deepEqual(ledger, []);
  assert.equal(run('lead-capture', { eventId: ' ' }).outcome, 'failed');
  assert.equal(run('lead-capture', { email: 'invalid' }).outcome, 'failed');
});
