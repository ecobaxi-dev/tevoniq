import {
  engineeringCases,
  engineeringServices,
  engineeringStages,
  type EngineeringLocale,
} from '../content/software-engineering.ts';
export function engineeringLeadMessage(
  query: Record<string, string | string[] | undefined>,
  locale: EngineeringLocale,
): string | undefined {
  if (typeof query.id !== 'string') return undefined;
  const source =
    query.engineering === 'case'
      ? engineeringCases
      : query.engineering === 'service'
        ? engineeringServices
        : query.engineering === 'stage'
          ? engineeringStages
          : [];
  const item = source.find((item) => item.id === query.id);
  if (!item) return undefined;
  return locale === 'ar'
    ? `أرغب في مناقشة هندسة منتج برمجي — ${item.ar.title}.\nالبرامج الحالية والخطوات والمتطلبات: `
    : `I would like to discuss software product engineering — ${item.en.title}.\nMy current tools, workflow and requirements: `;
}
