import test from 'node:test';
import assert from 'node:assert/strict';
import { customSoftwareLeadMessage } from '../apps/web/src/lib/custom-software.ts';
import { customStarts, customCases } from '../apps/web/src/content/custom-software.ts';
import { findWorkSystem } from '../apps/web/src/content/work-systems.ts';
import { findWebsiteDesign } from '../apps/web/src/content/website-designs.ts';
test('custom software handoff uses approved starts and case titles, never arbitrary URL text', () => {
  for (const locale of ['ar', 'en'])
    for (const item of [...customStarts, ...customCases]) {
      const key = customStarts.includes(item) ? item.id : `case-${item.id}`;
      assert.ok(customSoftwareLeadMessage(locale, { custom: key }).includes(item[locale].title));
    }
  for (const custom of [
    undefined,
    ['launch'],
    '<script>',
    'case-unknown',
    'cloud-solutions',
    '../../',
    'launch&message=other',
  ])
    assert.equal(customSoftwareLeadMessage('ar', { custom }), undefined);
});
test('illustrative studies link to real existing demo definitions and include scope and evaluation boundaries', () => {
  for (const item of customCases) {
    const [collection, slug] = item.demo.slice(1).split('/');
    assert.ok(collection === 'work-systems' ? findWorkSystem(slug) : findWebsiteDesign(slug));
    for (const locale of ['ar', 'en'])
      for (const field of ['challenge', 'approach', 'scope', 'integration', 'measure', 'limit'])
        assert.ok(item[locale][field].length > 20);
  }
});
