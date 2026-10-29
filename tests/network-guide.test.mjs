import test from 'node:test';
import assert from 'node:assert/strict';
import {
  networkProfiles,
  networkSizes,
  networkPriorities,
  networkDelivery,
  networkGuideLabels,
  networkGuidePlan,
  networkContactHref,
  networkLeadMessage,
  networkLinkState,
  networkPlanText,
} from '../apps/web/src/lib/network-guide.ts';
import { networkCases, networkServices } from '../apps/web/src/content/network-infrastructure.ts';
test('network guide builds bounded review steps for all 54 combinations, without guessing hardware quantities', () => {
  for (const profile of networkProfiles)
    for (const size of networkSizes)
      for (const priority of networkPriorities)
        for (const delivery of networkDelivery) {
          const steps = networkGuidePlan({ profile, size, priority, delivery });
          assert.equal(steps[0], 'inventory');
          assert.ok(steps.includes(priority));
          assert.equal(steps.includes('sites'), profile === 'branches');
          assert.equal(steps.includes('operations'), profile === 'store');
          assert.equal(steps.includes('capacity'), size !== 'small');
          assert.equal(steps.at(-1), delivery === 'onsite' ? 'field' : 'remote');
          assert.equal(new Set(steps).size, steps.length);
          for (const locale of ['ar', 'en'])
            for (const step of steps) assert.ok(networkPlanText[locale][step].length > 20);
        }
});
test('network contact preserves approved selections and rejects unknown or repeated values', () => {
  for (const locale of ['ar', 'en']) {
    for (const profile of networkProfiles)
      for (const size of networkSizes)
        for (const priority of networkPriorities)
          for (const delivery of networkDelivery) {
            const input = { profile, size, priority, delivery },
              url = new URL(networkContactHref(locale, input), 'https://example.invalid'),
              message = networkLeadMessage(locale, Object.fromEntries(url.searchParams));
            assert.equal(url.pathname, `/${locale}/contact`);
            for (const value of Object.values(input))
              assert.ok(message.includes(networkGuideLabels[locale][value]));
          }
    for (const item of networkServices)
      assert.ok(
        networkLeadMessage(locale, { network: `scope-${item.id}` }).includes(item[locale].title),
      );
    for (const item of networkCases) {
      assert.ok(
        networkLeadMessage(locale, { network: `case-${item.id}` }).includes(item[locale].title),
      );
      for (const field of ['approach', 'hardware', 'software', 'acceptance', 'limit'])
        assert.ok(item[locale][field].length > 20);
    }
    assert.ok(networkLeadMessage(locale, { network: 'review' }));
    for (const network of [undefined, ['review'], 'unknown', '<script>', '../'])
      assert.equal(networkLeadMessage(locale, { network }), undefined);
    for (const key of ['profile', 'size', 'priority', 'delivery'])
      for (const value of [undefined, ['office'], 'untrusted'])
        assert.equal(
          networkLeadMessage(locale, {
            network: 'guide',
            profile: 'office',
            size: 'small',
            priority: 'coverage',
            delivery: 'remote',
            [key]: value,
          }),
          undefined,
        );
  }
});
test('network illustration distinguishes primary, backup and unavailable paths', () => {
  assert.equal(networkLinkState(true, true), 'primary');
  assert.equal(networkLinkState(true, false), 'primary');
  assert.equal(networkLinkState(false, true), 'backup');
  assert.equal(networkLinkState(false, false), 'offline');
});
