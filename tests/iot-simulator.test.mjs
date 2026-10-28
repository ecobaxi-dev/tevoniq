import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateIotReading, iotLeadMessage } from '../apps/web/src/lib/iot-simulator.ts';
import { iotScenarios, iotCopy } from '../apps/web/src/content/iot-service.ts';
const base = { scenario: 'temperature', value: '24', threshold: '30', age: '0', connected: true };
test('illustrative rules respect their direction and threshold equality is normal', () => {
  assert.equal(evaluateIotReading(base).state, 'normal');
  assert.equal(evaluateIotReading({ ...base, value: '35' }).state, 'alert');
  assert.equal(evaluateIotReading({ ...base, value: '30' }).state, 'normal');
  for (const scenario of ['moisture', 'tank']) {
    assert.equal(evaluateIotReading({ ...base, scenario, value: '20' }).state, 'alert');
    assert.equal(evaluateIotReading({ ...base, scenario, value: '30' }).state, 'normal');
    assert.equal(evaluateIotReading({ ...base, scenario, value: '50' }).state, 'normal');
  }
});
test('stale or offline states take precedence and a disconnected source never supplies a fresh value', () => {
  assert.equal(evaluateIotReading({ ...base, value: '35', age: '15' }).state, 'alert');
  assert.equal(evaluateIotReading({ ...base, value: '35', age: '16' }).state, 'stale');
  const offline = evaluateIotReading({ ...base, value: '35', age: '16', connected: false });
  assert.equal(offline.state, 'offline');
  assert.equal(offline.value, null);
  assert.equal(offline.percentage, null);
});
test('missing, non-finite, out-of-range and fractional-age inputs fail without a status or accepted reading', () => {
  for (const input of [
    { ...base, scenario: 'unknown' },
    { ...base, value: '' },
    { ...base, threshold: ' ' },
    { ...base, age: '' },
    { ...base, value: 'NaN' },
    { ...base, value: 'Infinity' },
    { ...base, value: '71' },
    { ...base, value: '-21' },
    { ...base, scenario: 'tank', value: '101' },
    { ...base, threshold: '90' },
    { ...base, age: '-1' },
    { ...base, age: '1.2' },
    { ...base, age: '1441' },
  ])
    assert.deepEqual(evaluateIotReading(input), { ok: false });
  for (const scenario of iotScenarios)
    for (const value of [scenario.min, scenario.max]) {
      const result = evaluateIotReading({
        ...base,
        scenario: scenario.id,
        value: String(value),
        threshold: String(scenario.threshold),
      });
      assert.equal(result.ok, true);
      assert.ok(
        Number.isFinite(result.percentage) && result.percentage >= 0 && result.percentage <= 100,
      );
    }
});
test('every scenario has bilingual original content and contact handoffs ignore raw readings and unknown keys', () => {
  for (const locale of ['ar', 'en']) {
    for (const scenario of iotScenarios) {
      const example = iotCopy[locale].examples.find((item) => item.id === scenario.id);
      assert.ok(example?.boundary);
      const message = iotLeadMessage(
        { iot: scenario.id, value: 'PRIVATE-READING', note: 'PRIVATE-NOTE' },
        locale,
      );
      assert.ok(message.includes(example.title));
      assert.ok(!message.includes('PRIVATE'));
    }
    assert.ok(iotLeadMessage({ iot: 'scope' }, locale));
    for (const query of [
      {},
      { iot: ['temperature'] },
      { iot: 'unknown' },
      { iot: 'https://external.invalid' },
    ])
      assert.equal(iotLeadMessage(query, locale), undefined);
  }
});
