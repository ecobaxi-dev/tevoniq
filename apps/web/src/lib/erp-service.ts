import { erpCopy, erpModules, type ErpLocale } from '../content/erp-service.ts';
export function erpBrief(moduleId: string, locale: ErpLocale): string | undefined {
  const selectedModule = erpModules.find((item) => item.id === moduleId);
  if (!selectedModule) return undefined;
  const c = selectedModule[locale];
  return [
    locale === 'ar'
      ? 'TEVONIQ — ملخص وحدة أولية للنقاش'
      : 'TEVONIQ — Initial module discussion brief',
    c.title,
    c.body,
    ...c.fields.map((field) => `• ${field}`),
    c.output,
    c.boundary,
    locale === 'ar'
      ? 'نحدد النطاق والتكلفة والربط بعد مراجعة طريقة العمل. هذا ملخص توضيحي وليس عرض تنفيذ.'
      : 'Scope, cost and integration are defined after reviewing the workflow. This illustrative brief is not an implementation offer.',
  ].join('\n\n');
}
export function erpLeadMessage(
  query: Record<string, string | string[] | undefined>,
  locale: ErpLocale,
): string | undefined {
  if (query.erp === 'scope')
    return locale === 'ar'
      ? 'أرغب في مناقشة نظام لإدارة أعمالي.\nالبرامج الحالية والخطوات التي أريد تنظيمها: '
      : 'I would like to discuss a business management system.\nMy current tools and the steps I want to organise: ';
  if (query.erp === 'module' && typeof query.module === 'string') {
    const selectedModule = erpModules.find((item) => item.id === query.module);
    return selectedModule
      ? locale === 'ar'
        ? `أرغب في مناقشة وحدة لإدارة الأعمال: ${selectedModule.ar.title}.\nالبرامج الحالية وطريقة العمل والمتطلبات: `
        : `I would like to discuss a business management module: ${selectedModule.en.title}.\nCurrent tools, workflow and requirements: `
      : undefined;
  }
  if (query.erp === 'option' && (query.option === 'ready' || query.option === 'custom')) {
    const title = erpCopy[locale].options[query.option].title;
    return locale === 'ar'
      ? `أرغب في مراجعة خيار: ${title}.\nتفاصيل نشاطي واحتياجاتي: `
      : `I would like to review: ${title}.\nMy business and requirements: `;
  }
  return undefined;
}
