import { mlCapabilities, mlCases, type MlLocale } from '../content/machine-learning.ts';
export const mlGoals = ['knowledge', 'triage', 'demand'] as const;
export const mlDataStates = ['none', 'sample', 'ready'] as const;
export const mlAccessStates = ['approved', 'restricted'] as const;
export type MlGoal = (typeof mlGoals)[number];
export type MlDataState = (typeof mlDataStates)[number];
export type MlAccessState = (typeof mlAccessStates)[number];
export type MlGuideInput = { goal: MlGoal; data: MlDataState; access: MlAccessState };
export const mlGuideLabels = {
  ar: {
    knowledge: 'مساعد معرفة',
    triage: 'فرز الطلبات',
    demand: 'تقدير الاحتياج',
    none: 'لا توجد بيانات منظمة',
    sample: 'عينة أولية تحتاج مراجعة',
    ready: 'بيانات منظمة قابلة للمراجعة',
    approved: 'مصرح باستخدامها في التجربة',
    restricted: 'الإذن أو ضوابط الوصول غير محسومة',
  },
  en: {
    knowledge: 'Knowledge assistant',
    triage: 'Request triage',
    demand: 'Demand estimate',
    none: 'No organised data',
    sample: 'Initial sample to review',
    ready: 'Organised, reviewable records',
    approved: 'Authorised for the pilot',
    restricted: 'Permission or access rules unresolved',
  },
};
export const mlRecommendations = {
  ar: {
    permission: {
      title: 'نحسم الإذن وحدود الوصول أولًا',
      text: 'قبل نقل أي بيانات أو تجربة نموذج، نحدد من يملك المحتوى وما المسموح باستخدامه. يمكن البدء ببيانات مصطنعة لتوضيح الفكرة.',
      output: 'قائمة مصادر مسموحة وعينة آمنة وحدود الوصول.',
    },
    discovery: {
      title: 'نراجع البيانات قبل اختيار النموذج',
      text: 'نبدأ بحصر المصادر وترتيب عينة وتحديد إجابات أو نتائج صحيحة للمقارنة. قد تكفي قواعد بسيطة دون تعلّم آلة.',
      output: 'عينة مراجعة ومعيار تقييم وقرار جدوى أولي.',
    },
    pilot: {
      title: 'نقترح تجربة صغيرة بمراجعة بشرية',
      text: 'نختبر نهجًا جاهزًا على عينة مصرح بها وأسئلة أو طلبات منفصلة للتقييم. لا نربطه بالإرسال أو التعديل التلقائي في البداية.',
      output: 'نموذج أولي وتقرير أخطاء وتقدير استخدام قبل التوسع.',
    },
    baseline: {
      title: 'نقارن التقدير بخط أساس بسيط',
      text: 'نتحقق من كفاية السجل وجودته، ونفصل فترة زمنية للتقييم. إذا لم يتفوق النهج المقترح على طريقة بسيطة فلا نعتبر التعقيد إضافة مفيدة.',
      output: 'مقارنة موثقة وقيود استخدام وقرار استمرار أو توقف.',
    },
  },
  en: {
    permission: {
      title: 'Resolve permission and access first',
      text: 'Before transferring data or testing a model, establish ownership and permitted use. Synthetic examples can illustrate the idea while access is clarified.',
      output: 'Approved sources, a safe sample and access boundaries.',
    },
    discovery: {
      title: 'Review data before choosing a model',
      text: 'Inventory sources, prepare a sample and define correct outputs for comparison. Ordinary rules may be enough without machine learning.',
      output: 'A reviewed sample, evaluation criteria and an initial feasibility decision.',
    },
    pilot: {
      title: 'Start a small, human-reviewed pilot',
      text: 'Test an existing approach on an authorised sample with separate evaluation questions or requests. Start without automatic sending or record changes.',
      output: 'A prototype, error review and usage estimate before expansion.',
    },
    baseline: {
      title: 'Compare against a simple baseline',
      text: 'Check the quality and sufficiency of the history and hold out a later time period. Added complexity is not useful unless it improves on a simple approach.',
      output: 'A documented comparison, usage limits and a continue-or-stop decision.',
    },
  },
};
export function recommendMlStart(input: MlGuideInput) {
  if (input.access === 'restricted') return 'permission' as const;
  if (input.data === 'none' || (input.goal === 'demand' && input.data !== 'ready'))
    return 'discovery' as const;
  return input.goal === 'demand' ? ('baseline' as const) : ('pilot' as const);
}
export function mlGuideContactHref(locale: MlLocale, input: MlGuideInput) {
  return `/${locale}/contact?ml=guide&goal=${input.goal}&data=${input.data}&access=${input.access}`;
}
export function mlLeadMessage(
  locale: MlLocale,
  query: Record<string, string | string[] | undefined>,
) {
  if (typeof query.ml !== 'string') return undefined;
  const labels = mlGuideLabels[locale];
  let context: string | undefined;
  if (query.ml === 'guide') {
    if (
      !mlGoals.some((id) => id === query.goal) ||
      !mlDataStates.some((id) => id === query.data) ||
      !mlAccessStates.some((id) => id === query.access)
    )
      return undefined;
    const input = {
      goal: query.goal as MlGoal,
      data: query.data as MlDataState,
      access: query.access as MlAccessState,
    };
    context = `${labels[input.goal]} — ${labels[input.data]} — ${labels[input.access]}. ${mlRecommendations[locale][recommendMlStart(input)].title}`;
  } else {
    context =
      mlCases.find((item) => `case-${item.id}` === query.ml)?.[locale].title ??
      mlCapabilities.find((item) => `scope-${item.id}` === query.ml)?.[locale].title ??
      (query.ml === 'review'
        ? locale === 'ar'
          ? 'مراجعة فكرة أو حل قائم'
          : 'Review an idea or existing solution'
        : undefined);
  }
  if (!context) return undefined;
  return locale === 'ar'
    ? `أرغب في مناقشة تطبيق ذكاء اصطناعي: ${context}.\nوصف المهمة والبرامج الحالية وحدود الاستخدام: `
    : `I would like to discuss an AI application: ${context}.\nTask, existing tools and usage boundaries: `;
}
