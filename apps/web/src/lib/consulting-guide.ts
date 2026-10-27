import {
  consultingQuestions,
  consultingResults,
  consultingAlternatives,
  consultingExamples,
  type ConsultingAnswers,
  type ConsultingResultKey,
  type ConsultingLocale,
} from '../content/technology-consulting.ts';
export function parseConsultingAnswers(input: unknown): ConsultingAnswers | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  for (const question of consultingQuestions)
    if (
      typeof record[question.key] !== 'string' ||
      !question.options.some((option) => option.value === record[question.key])
    )
      return null;
  return Object.fromEntries(
    consultingQuestions.map((question) => [question.key, record[question.key]]),
  ) as ConsultingAnswers;
}
export function recommendConsulting(answers: ConsultingAnswers): ConsultingResultKey {
  if (answers.clarity === 'unclear' || answers.goal === 'unsure' || answers.tools === 'unsure')
    return 'clarify';
  if (answers.tools === 'software-fits') return 'improve-existing';
  if (answers.goal === 'repetition' && answers.frequency === 'occasional') return 'light-step';
  if (answers.goal === 'presence') return 'website';
  if (answers.goal === 'requests') return 'work-system';
  if (answers.goal === 'repetition')
    return answers.tools === 'software-gaps' ? 'automation' : 'organise-data';
  return answers.tools === 'none' ? 'organise-data' : 'dashboard';
}
export function consultingAnswerLines(answers: ConsultingAnswers, locale: ConsultingLocale) {
  return consultingQuestions.map(
    (question) =>
      `${question[locale]} ${question.options.find((option) => option.value === answers[question.key])![locale]}`,
  );
}
export function consultingGuideHref(answers: ConsultingAnswers, locale: ConsultingLocale) {
  return `/${locale}/contact?${new URLSearchParams({ intent: 'quote', consulting: 'guide', ...answers })}`;
}
export function consultingBrief(answers: ConsultingAnswers, locale: ConsultingLocale) {
  const ar = locale === 'ar',
    copy = consultingResults[recommendConsulting(answers)][locale];
  return [
    ar ? 'ملخص احتياج تمهيدي — TEVONIQ' : 'Initial needs brief — TEVONIQ',
    ...consultingAnswerLines(answers, locale),
    '',
    copy.title,
    copy.reason,
    '',
    ar ? 'خطوة البداية المقترحة:' : 'Suggested first step:',
    ...copy.steps.map((step, i) => `${i + 1}. ${step}`),
    '',
    copy.defer,
    '',
    ar
      ? 'هذا اقتراح أولي من الاختيارات، ويحتاج مراجعة الأدوات والبيانات قبل اعتماد نطاق أو تكلفة.'
      : 'This is an initial suggestion from your choices. Tools and data need review before scope or cost is agreed.',
  ].join('\n');
}
export function consultingLeadMessage(
  query: Record<string, string | string[] | undefined>,
  locale: ConsultingLocale,
): string | undefined {
  if (query.consulting === 'guide') {
    const answers = parseConsultingAnswers(query);
    return answers ? consultingBrief(answers, locale) : undefined;
  }
  if (query.consulting === 'comparison') {
    const alternative = consultingAlternatives.find((item) => item.id === query.route);
    if (!alternative) return;
    return locale === 'ar'
      ? `أرغب في مقارنة الخيارات لاحتياجي، وبحث خيار: ${alternative.arTitle}.\nطريقة عملي ومتطلباتي: `
      : `I would like to compare options and discuss: ${alternative.enTitle}.\nMy workflow and requirements: `;
  }
  if (query.consulting === 'example') {
    const example = consultingExamples.find((item) => item.id === query.example);
    if (!example) return;
    return locale === 'ar'
      ? `أرغب في مناقشة احتياج يشبه المثال التوضيحي: ${example.arTitle}.\nتفاصيل نشاطي: `
      : `I would like to discuss a need similar to the illustrative example: ${example.enTitle}.\nMy business details: `;
  }
  if (query.consulting === 'scope')
    return locale === 'ar'
      ? 'أرغب في مناقشة احتياجي التقني وتحديد نطاق وخطوات أولى واضحة.\nالنشاط وطريقة العمل والمشكلة: '
      : 'I would like to clarify a technology need and agree on a focused first scope.\nBusiness, workflow and problem: ';
  return undefined;
}
