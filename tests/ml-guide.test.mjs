import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mlGoals,
  mlDataStates,
  mlAccessStates,
  recommendMlStart,
  mlGuideContactHref,
  mlLeadMessage,
  mlGuideLabels,
} from '../apps/web/src/lib/ml-guide.ts';
import { mlCases, mlCapabilities } from '../apps/web/src/content/machine-learning.ts';
import { findWorkSystem } from '../apps/web/src/content/work-systems.ts';
import { findAutomationCase } from '../apps/web/src/content/automation-cases.ts';
test('ML guide prioritises unresolved permission and data readiness over a pilot or training', () => {
  for (const goal of mlGoals)
    for (const data of mlDataStates) {
      assert.equal(recommendMlStart({ goal, data, access: 'restricted' }), 'permission');
      const result = recommendMlStart({ goal, data, access: 'approved' });
      if (data === 'none' || (goal === 'demand' && data !== 'ready'))
        assert.equal(result, 'discovery');
      else assert.equal(result, goal === 'demand' ? 'baseline' : 'pilot');
    }
});
test('ML guide contact roundtrip preserves every valid selection and rejects arbitrary query values', () => {
  for (const locale of ['ar', 'en']) {
    for (const goal of mlGoals)
      for (const data of mlDataStates)
        for (const access of mlAccessStates) {
          const input = { goal, data, access };
          const url = new URL(mlGuideContactHref(locale, input), 'https://example.invalid');
          assert.equal(url.pathname, `/${locale}/contact`);
          const message = mlLeadMessage(locale, Object.fromEntries(url.searchParams));
          for (const id of [goal, data, access])
            assert.ok(message.includes(mlGuideLabels[locale][id]));
        }
    for (const invalid of [undefined, ['review'], 'unknown', '<script>', '../'])
      assert.equal(mlLeadMessage(locale, { ml: invalid }), undefined);
    for (const key of ['goal', 'data', 'access'])
      for (const value of [undefined, ['knowledge'], 'untrusted'])
        assert.equal(
          mlLeadMessage(locale, {
            ml: 'guide',
            goal: 'knowledge',
            data: 'ready',
            access: 'approved',
            [key]: value,
          }),
          undefined,
        );
    assert.ok(mlLeadMessage(locale, { ml: 'review' }));
    for (const item of mlCapabilities)
      assert.ok(mlLeadMessage(locale, { ml: `scope-${item.id}` }).includes(item[locale].title));
  }
});
test('ML scenario studies reference existing workflow demos and include data, evaluation and boundaries', () => {
  for (const item of mlCases) {
    const [collection, slug] = item.demo.slice(1).split('/');
    assert.ok(collection === 'work-systems' ? findWorkSystem(slug) : findAutomationCase(slug));
    for (const locale of ['ar', 'en']) {
      assert.ok(mlLeadMessage(locale, { ml: `case-${item.id}` }).includes(item[locale].title));
      for (const field of ['challenge', 'approach', 'data', 'measure', 'limit'])
        assert.ok(item[locale][field].length > 20);
    }
  }
});
