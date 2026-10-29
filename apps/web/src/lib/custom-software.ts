import { customCases, customStarts, type CustomLocale } from '../content/custom-software.ts';
export function customSoftwareLeadMessage(
  locale: CustomLocale,
  query: Record<string, string | string[] | undefined>,
) {
  if (typeof query.custom !== 'string') return undefined;
  const selected = customStarts.find((item) => item.id === query.custom);
  const scenario = customCases.find((item) => `case-${item.id}` === query.custom);
  const title = selected?.[locale].title ?? scenario?.[locale].title;
  if (!title) return undefined;
  return locale === 'ar'
    ? `أرغب في مناقشة حل برمجي مخصص: ${title}.\nنشاطي والمستخدمون والبرامج الحالية والمتطلبات: `
    : `I would like to discuss custom software: ${title}.\nMy business, users, existing tools and requirements: `;
}
