import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  consultingQuestions,
  consultingResults,
} from '../apps/web/src/content/technology-consulting.ts';
import {
  parseConsultingAnswers,
  recommendConsulting,
  consultingBrief,
  consultingGuideHref,
  consultingLeadMessage,
} from '../apps/web/src/lib/consulting-guide.ts';
const base = {
  business: 'services',
  goal: 'requests',
  tools: 'files',
  frequency: 'daily',
  clarity: 'clear',
};
test('consulting answers are validated as a complete closed set and extra fields are discarded', () => {
  assert.deepEqual(parseConsultingAnswers({ ...base, secret: 'ignored' }), base);
  for (const input of [
    null,
    [],
    {},
    { ...base, goal: 'unknown' },
    { ...base, business: ['services'] },
    { ...base, frequency: undefined },
  ])
    assert.equal(parseConsultingAnswers(input), null);
});
test('unclear needs and unknown software capabilities take priority over proposing implementation', () => {
  assert.equal(recommendConsulting({ ...base, clarity: 'unclear' }), 'clarify');
  assert.equal(recommendConsulting({ ...base, tools: 'unsure' }), 'clarify');
  assert.equal(recommendConsulting({ ...base, goal: 'unsure', tools: 'software-fits' }), 'clarify');
});
test('suitable existing software is reviewed before replacement and infrequent work before automation', () => {
  assert.equal(recommendConsulting({ ...base, tools: 'software-fits' }), 'improve-existing');
  assert.equal(
    recommendConsulting({
      ...base,
      goal: 'repetition',
      frequency: 'occasional',
      tools: 'software-gaps',
    }),
    'light-step',
  );
  assert.equal(
    recommendConsulting({
      ...base,
      goal: 'repetition',
      frequency: 'daily',
      tools: 'software-fits',
    }),
    'improve-existing',
  );
});
test('four service directions and data preparation follow the selected need and current tools', () => {
  assert.equal(recommendConsulting({ ...base, goal: 'presence' }), 'website');
  assert.equal(recommendConsulting(base), 'work-system');
  assert.equal(
    recommendConsulting({ ...base, goal: 'repetition', tools: 'software-gaps' }),
    'automation',
  );
  assert.equal(
    recommendConsulting({ ...base, goal: 'repetition', tools: 'files' }),
    'organise-data',
  );
  assert.equal(recommendConsulting({ ...base, goal: 'visibility' }), 'dashboard');
  assert.equal(
    recommendConsulting({ ...base, goal: 'visibility', tools: 'none' }),
    'organise-data',
  );
});
test('every valid combination returns a defined result and only approved gallery destinations', () => {
  const allowed = new Set([
    null,
    '/website-designs',
    '/work-systems',
    '/automation-demos',
    '/dashboard-demos',
  ]);
  let checked = 0;
  function walk(index, answers) {
    if (index === consultingQuestions.length) {
      const parsed = parseConsultingAnswers(answers);
      assert.ok(parsed);
      const result = consultingResults[recommendConsulting(parsed)];
      assert.ok(result.ar.title && result.en.title);
      assert.equal(result.ar.steps.length, 3);
      assert.ok(allowed.has(result.gallery));
      checked++;
      return;
    }
    const question = consultingQuestions[index];
    for (const option of question.options)
      walk(index + 1, { ...answers, [question.key]: option.value });
  }
  walk(0, {});
  assert.equal(checked, 900);
});
test('a guide result passes closed choices to contact and a local text brief without arbitrary query data', () => {
  for (const locale of ['ar', 'en']) {
    const url = new URL(consultingGuideHref(base, locale), 'https://example.invalid');
    assert.equal(url.pathname, `/${locale}/contact`);
    const query = Object.fromEntries(url.searchParams);
    assert.equal(consultingLeadMessage(query, locale), consultingBrief(base, locale));
    assert.ok(
      consultingBrief(base, locale).includes(consultingResults['work-system'][locale].title),
    );
    assert.equal(
      consultingLeadMessage({ ...query, tools: '<script>bad</script>' }, locale),
      undefined,
    );
  }
});
test('comparison and example handoffs use only known selections and malformed queries are ignored', () => {
  assert.match(
    consultingLeadMessage({ consulting: 'comparison', route: 'existing' }, 'en'),
    /Improve existing tools/,
  );
  assert.match(consultingLeadMessage({ consulting: 'example', example: 'workshop' }, 'ar'), /ورشة/);
  assert.ok(consultingLeadMessage({ consulting: 'scope' }, 'ar'));
  for (const query of [
    { consulting: 'comparison', route: 'https://outside.invalid' },
    { consulting: 'guide', ...base, clarity: ['clear'] },
    { consulting: 'example', example: 'unknown' },
    { consulting: ['scope'] },
    {},
  ])
    assert.equal(consultingLeadMessage(query, 'ar'), undefined);
});
