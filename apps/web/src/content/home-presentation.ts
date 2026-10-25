import type { HomeContent } from '@tevoniq/validation';
import type { Locale } from '@tevoniq/types';

export const approvedArabicHero = {
  eyebrow: 'TEVONIQ',
  title: 'حلول رقمية تنظّم أعمالك',
  accent: 'تقنيات متقدمة لغد أكثر ذكاءً',
  body: 'نساعد أصحاب المنشآت الصغيرة والمتوسطة على تطوير مواقع وأنظمة وأتمتة تسهّل متابعة الطلبات وتقلّل العمل المتكرر، بتواصل مباشر ونطاق واضح وتنفيذ على مراحل.',
};
export const approvedArabicHeroActions = {
  start: 'لنناقش احتياجك',
  explore: 'استكشف الخدمات',
};
export const approvedArabicValues = [
  { title: 'تواصل مباشر', body: 'نفهم احتياجك بوضوح' },
  { title: 'حلول عملية', body: 'تسهّل عملك اليومي' },
  { title: 'خطوات واضحة', body: 'من الفكرة إلى التسليم' },
];
const legacyValues = [
  { title: 'الناس', body: 'معاً أقوى' },
  { title: 'التقنية', body: 'تقود التقدم' },
  { title: 'غد أفضل', body: 'لعالم أكثر إشراقاً' },
];
const legacyHero = {
  eyebrow: 'تقنية من أجل غد أكثر إشراقاً',
  title: 'تقنية متقدمة',
  accent: 'لغد أكثر ذكاءً',
  body: 'تقدم TEVONIQ حلولاً تقنية مبتكرة تربط الناس والأعمال بمستقبل أكثر إشراقاً. من أجل عالم أكثر ذكاءً وأماناً واستدامة.',
};

/** Upgrade the old bootstrap wording without replacing subsequent CMS edits. */
export function presentHomeContent(locale: Locale, content: HomeContent): HomeContent {
  if (locale !== 'ar') return content;
  const hero = { ...content.hero };
  if (hero.start === 'ابدأ الآن') hero.start = approvedArabicHeroActions.start;
  for (const key of ['eyebrow', 'title', 'accent', 'body'] as const)
    if (hero[key] === legacyHero[key]) hero[key] = approvedArabicHero[key];
  hero.values = hero.values.map((value, index) => {
    const prior = legacyValues[index];
    return prior && value.title === prior.title && value.body === prior.body
      ? { ...approvedArabicValues[index]! }
      : value;
  });
  const copy = { ...content.copy };
  if (copy.headline === legacyHero.title) copy.headline = approvedArabicHero.title;
  if (copy.accent === legacyHero.accent) copy.accent = approvedArabicHero.accent;
  if (
    copy.introduction ===
    'تقدم TEVONIQ حلولاً تقنية متقدمة مصممة لربط الأعمال الحديثة وتأمينها وأتمتتها وتطويرها.'
  )
    copy.introduction = approvedArabicHero.body;
  return { ...content, hero, copy };
}
