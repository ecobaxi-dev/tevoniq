import { test } from 'node:test';
import assert from 'node:assert/strict';
import { engineeringLeadMessage } from '../apps/web/src/lib/software-engineering.ts';
import {
  engineeringCases,
  engineeringServices,
  engineeringStages,
} from '../apps/web/src/content/software-engineering.ts';
import { findWorkSystem } from '../apps/web/src/content/work-systems.ts';
import { findAutomationCase } from '../apps/web/src/content/automation-cases.ts';
test('engineering scenario studies point to existing demos and include scope, acceptance and deferrals', () => {
  for (const item of engineeringCases) {
    const [gallery, id] = item.model.split('/');
    assert.ok(gallery === 'work-systems' ? findWorkSystem(id) : findAutomationCase(id));
    for (const locale of ['ar', 'en']) {
      const c = item[locale];
      assert.equal(c.scope.length, 3);
      assert.equal(c.checks.length, 3);
      assert.ok(c.problem && c.integration && c.defer && c.outcome);
    }
  }
});
test('engineering handoffs whitelist their kind and id and never echo arbitrary visitor fields', () => {
  for (const locale of ['ar', 'en'])
    for (const [kind, items] of [
      ['case', engineeringCases],
      ['service', engineeringServices],
      ['stage', engineeringStages],
    ])
      for (const item of items) {
        const message = engineeringLeadMessage(
          { engineering: kind, id: item.id, note: 'PRIVATE' },
          locale,
        );
        assert.ok(message.includes(item[locale].title));
        assert.ok(!message.includes('PRIVATE'));
      }
  for (const query of [
    {},
    { engineering: 'case', id: 'unknown' },
    { engineering: 'case', id: ['service-requests'] },
    { engineering: ['case'], id: 'service-requests' },
    { engineering: 'service', id: 'service-requests' },
    { engineering: 'other', id: 'define' },
    { engineering: 'stage', id: 'https://external.invalid' },
  ])
    assert.equal(engineeringLeadMessage(query, 'ar'), undefined);
});
