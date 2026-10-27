import { test } from 'node:test';
import assert from 'node:assert/strict';
import { erpBrief, erpLeadMessage } from '../apps/web/src/lib/erp-service.ts';
import { erpModules, erpCopy } from '../apps/web/src/content/erp-service.ts';
import { findWorkSystem } from '../apps/web/src/content/work-systems.ts';
test('each ERP module links to an existing illustrative system and exports a scoped brief in both languages', () => {
  assert.equal(new Set(erpModules.map((module) => module.id)).size, 6);
  for (const module of erpModules) {
    assert.ok(findWorkSystem(module.model), module.id);
    for (const locale of ['ar', 'en']) {
      const brief = erpBrief(module.id, locale);
      for (const value of [
        module[locale].title,
        module[locale].output,
        module[locale].boundary,
        ...module[locale].fields,
      ])
        assert.ok(brief.includes(value));
      assert.ok(brief.includes(locale === 'ar' ? 'ليس عرض تنفيذ' : 'not an implementation offer'));
    }
  }
  assert.equal(erpBrief('unknown', 'ar'), undefined);
});
test('ERP contact handoffs accept only known modes, modules and options and ignore arbitrary visitor text', () => {
  for (const locale of ['ar', 'en']) {
    for (const module of erpModules) {
      const message = erpLeadMessage({ erp: 'module', module: module.id, note: 'PRIVATE' }, locale);
      assert.ok(message.includes(module[locale].title));
      assert.ok(!message.includes('PRIVATE'));
    }
    for (const option of ['ready', 'custom'])
      assert.ok(
        erpLeadMessage({ erp: 'option', option }, locale).includes(
          erpCopy[locale].options[option].title,
        ),
      );
    assert.ok(erpLeadMessage({ erp: 'scope' }, locale));
    for (const query of [
      {},
      { erp: ['scope'] },
      { erp: 'module' },
      { erp: 'module', module: ['sales'] },
      { erp: 'module', module: 'https://external.invalid' },
      { erp: 'option', option: '<script>' },
      { erp: 'other', module: 'sales' },
    ])
      assert.equal(erpLeadMessage(query, locale), undefined);
  }
});
