import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homeCopy } from '../apps/web/src/content/home.ts';
import { referenceHeroCopy } from '../apps/web/src/content/reference-hero.ts';
import {
  approvedArabicHero,
  approvedArabicHeroActions,
  approvedArabicValues,
  presentHomeContent,
} from '../apps/web/src/content/home-presentation.ts';

const priorHero = {
  eyebrow: 'تقنية من أجل غد أكثر إشراقاً',
  title: 'تقنية متقدمة',
  accent: 'لغد أكثر ذكاءً',
  body: 'تقدم TEVONIQ حلولاً تقنية مبتكرة تربط الناس والأعمال بمستقبل أكثر إشراقاً. من أجل عالم أكثر ذكاءً وأماناً واستدامة.',
};
test('approved company wording upgrades existing Arabic CMS bootstrap content without mutating it', () => {
  const content = {
    copy: {
      ...homeCopy.ar,
      headline: priorHero.title,
      accent: priorHero.accent,
      introduction:
        'تقدم TEVONIQ حلولاً تقنية متقدمة مصممة لربط الأعمال الحديثة وتأمينها وأتمتتها وتطويرها.',
    },
    hero: {
      ...referenceHeroCopy.ar,
      ...priorHero,
      start: 'ابدأ الآن',
      videoUrl: 'https://example.test/intro.mp4',
    },
  };
  const original = structuredClone(content),
    result = presentHomeContent('ar', content);
  assert.deepEqual(content, original);
  for (const key of Object.keys(approvedArabicHero))
    assert.equal(result.hero[key], approvedArabicHero[key]);
  assert.equal(result.copy.headline, approvedArabicHero.title);
  assert.equal(result.copy.introduction, approvedArabicHero.body);
  assert.equal(result.hero.videoUrl, content.hero.videoUrl);
  assert.equal(result.hero.start, approvedArabicHeroActions.start);
  assert.deepEqual(result.hero.values, approvedArabicValues);
});
test('custom Arabic CMS text survives the approved bootstrap update', () => {
  const content = {
    copy: { ...homeCopy.ar, headline: 'عنوان مخصص', introduction: 'وصف مخصص' },
    hero: {
      ...referenceHeroCopy.ar,
      title: 'عنوان محرر',
      accent: 'سطر محرر',
      body: 'وصف محرر',
      eyebrow: 'تعريف محرر',
      values: [{ title: 'قيمة مخصصة', body: 'شرح مخصص' }, ...referenceHeroCopy.ar.values.slice(1)],
    },
  };
  assert.deepEqual(presentHomeContent('ar', content), content);
});
test('other existing locales are returned without any content changes', () => {
  for (const locale of ['en', 'tr']) {
    const content = { copy: homeCopy[locale], hero: referenceHeroCopy[locale] };
    assert.equal(presentHomeContent(locale, content), content);
  }
});
