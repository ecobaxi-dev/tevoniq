import test from 'node:test';
import assert from 'node:assert/strict';
import {
  qaSampleTotal,
  qaSampleSlot,
  qaSampleApproval,
  qaScenarioIds,
  runQaExample,
} from '../apps/web/src/lib/qa-lab.ts';
import { qaLeadMessage } from '../apps/web/src/lib/qa-automation.ts';
import { qaCases, qaScope } from '../apps/web/src/content/qa-automation.ts';
import { findWorkSystem } from '../apps/web/src/content/work-systems.ts';
import { findWebsiteDesign } from '../apps/web/src/content/website-designs.ts';
test('QA lab runs real sample rules and reveals meaningful defects before their correction', () => {
  for (const id of qaScenarioIds) {
    assert.ok(runQaExample(id, 'before').some((item) => !item.passed));
    assert.ok(runQaExample(id, 'after').every((item) => item.passed));
  }
  assert.equal(qaSampleTotal(1, true), 50);
  assert.equal(qaSampleTotal(10, true), 500);
  for (const quantity of [-1, 0, 0.1, 11, NaN, Infinity])
    assert.equal(qaSampleTotal(quantity, true), null);
  assert.equal(qaSampleSlot('12:00', true), true);
  for (const slot of ['10:00', '', '13:00', 'unknown'])
    assert.equal(qaSampleSlot(slot, true), false);
  for (const role of ['guest', '', 'employee', 'admin', 'unknown'])
    assert.equal(qaSampleApproval(role, true), false);
  assert.equal(qaSampleApproval('supervisor', true), true);
});
test('QA handoff accepts only known contexts, with actual demo definitions and explicit scenario limits', () => {
  for (const locale of ['ar', 'en']) {
    for (const item of qaScope)
      assert.ok(qaLeadMessage(locale, { qa: item.id }).includes(item[locale].title));
    for (const item of qaCases) {
      assert.ok(qaLeadMessage(locale, { qa: `case-${item.id}` }).includes(item[locale].title));
      for (const field of ['challenge', 'approach', 'scope', 'measure', 'limit'])
        assert.ok(item[locale][field].length > 20);
    }
    assert.ok(qaLeadMessage(locale, { qa: 'review' }));
    for (const qa of [undefined, ['review'], '<script>', 'unknown', '../', 'review&message=bad'])
      assert.equal(qaLeadMessage(locale, { qa }), undefined);
  }
  for (const item of qaCases) {
    const [collection, slug] = item.demo.slice(1).split('/');
    assert.ok(collection === 'work-systems' ? findWorkSystem(slug) : findWebsiteDesign(slug));
  }
});
