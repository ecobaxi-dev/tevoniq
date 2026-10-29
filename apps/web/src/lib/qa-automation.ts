import { qaCases, qaScope, type QaLocale } from '../content/qa-automation.ts';
export function qaLeadMessage(
  locale: QaLocale,
  query: Record<string, string | string[] | undefined>,
) {
  if (typeof query.qa !== 'string') return undefined;
  const item =
    qaScope.find((item) => item.id === query.qa) ??
    qaCases.find((item) => `case-${item.id}` === query.qa);
  const title =
    item?.[locale].title ??
    (query.qa === 'review'
      ? locale === 'ar'
        ? 'مراجعة نطاق الاختبارات'
        : 'Testing scope review'
      : undefined);
  if (!title) return undefined;
  return locale === 'ar'
    ? `أرغب في مناقشة أتمتة ضمان الجودة: ${title}.\nرابط المشروع والوظائف المهمة وتكرار التحديثات: `
    : `I would like to discuss QA automation: ${title}.\nProject URL, important workflows and update frequency: `;
}
