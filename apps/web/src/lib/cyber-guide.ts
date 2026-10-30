import { cyberCases, cyberServices, type CyberLocale } from '../content/cybersecurity.ts';
export const cyberTopics = ['accounts', 'email', 'sharing'] as const;
export const cyberStates = ['unknown', 'needs-work', 'in-place'] as const;
export const cyberPermissions = ['pending', 'approved'] as const;
export type CyberInput = {
  topic: (typeof cyberTopics)[number];
  state: (typeof cyberStates)[number];
  permission: (typeof cyberPermissions)[number];
};
export const cyberLabels = {
  ar: {
    accounts: 'الحسابات والصلاحيات',
    email: 'البريد ومصادر الإرسال',
    sharing: 'الملفات والمشاركة',
    unknown: 'لم نراجع الوضع بعد',
    'needs-work': 'توجد ملاحظات نعرفها',
    'in-place': 'توجد إعدادات نريد التحقق منها',
    pending: 'لم يُحسم إذن الوصول',
    approved: 'يوجد مسؤول مخول لاعتماد النطاق',
  },
  en: {
    accounts: 'Accounts and permissions',
    email: 'Email and sending sources',
    sharing: 'Files and sharing',
    unknown: 'Not reviewed yet',
    'needs-work': 'Known issues to review',
    'in-place': 'Existing settings to verify',
    pending: 'Access permission unresolved',
    approved: 'An authorised owner can agree scope',
  },
};
export function cyberStartingPoint(input: CyberInput) {
  return input.permission === 'pending'
    ? 'permission'
    : input.state === 'unknown'
      ? 'inventory'
      : input.state === 'needs-work'
        ? 'priorities'
        : 'evidence';
}
export const cyberGuidance = {
  ar: {
    permission: [
      'نحسم المسؤول والإذن أولًا',
      'حدد مالك الحسابات أو النطاق وطريقة وصول مصرحًا بها. يمكن مناقشة الاحتياج دون إرسال بيانات حساسة.',
    ],
    inventory: [
      'نبدأ بجرد ومراجعة محددة',
      'نحدد ما يدخل في النطاق ومن يملك الوصول، ثم نراجع إعدادات متاحة قبل الحكم عليها.',
    ],
    priorities: [
      'نحوّل الملاحظات إلى خطة تغيير',
      'نراجع الملاحظات وأثرها ونحدد ما يمكن التحقق منه، ثم نعتمد أولوية وخطة تنفيذ وتراجع.',
    ],
    evidence: [
      'نتحقق من الإعدادات بأدلة',
      'وجود إعداد لا يثبت كفاية الحماية. نتفق على دليل تحقق وحدود المراجعة وما يحتاج متابعة.',
    ],
  },
  en: {
    permission: [
      'Resolve ownership and permission first',
      'Identify account or domain ownership and authorised access. Needs can be discussed without sending sensitive records.',
    ],
    inventory: [
      'Start with a focused inventory',
      'Define scoped resources and access ownership, then review available settings before drawing conclusions.',
    ],
    priorities: [
      'Turn findings into a change plan',
      'Review findings and impact, identify what can be verified and agree priorities, implementation and rollback.',
    ],
    evidence: [
      'Verify settings with evidence',
      'An existing setting is not proof of sufficient protection. Agree verification evidence, boundaries and follow-up.',
    ],
  },
};
export function cyberContactHref(locale: CyberLocale, input: CyberInput) {
  return `/${locale}/contact?cyber=guide&topic=${input.topic}&state=${input.state}&permission=${input.permission}`;
}
export function cyberLeadMessage(
  locale: CyberLocale,
  query: Record<string, string | string[] | undefined>,
) {
  if (typeof query.cyber !== 'string') return undefined;
  let context: string | undefined;
  if (query.cyber === 'guide') {
    if (
      !cyberTopics.some((v) => v === query.topic) ||
      !cyberStates.some((v) => v === query.state) ||
      !cyberPermissions.some((v) => v === query.permission)
    )
      return undefined;
    const input = {
        topic: query.topic as CyberInput['topic'],
        state: query.state as CyberInput['state'],
        permission: query.permission as CyberInput['permission'],
      },
      l = cyberLabels[locale];
    context = [
      l[input.topic],
      l[input.state],
      l[input.permission],
      cyberGuidance[locale][cyberStartingPoint(input)][0],
    ].join(' — ');
  } else
    context =
      cyberServices.find((v) => `scope-${v.id}` === query.cyber)?.[locale].title ??
      cyberCases.find((v) => `case-${v.id}` === query.cyber)?.[locale].title ??
      (query.cyber === 'review'
        ? locale === 'ar'
          ? 'مراجعة احتياج وإعدادات مصرح بها'
          : 'Authorised needs and settings review'
        : undefined);
  if (!context) return undefined;
  return locale === 'ar'
    ? `أرغب في مناقشة حماية بيئة العمل: ${context}.\nوصف عام للمنشأة والأدوات والأولوية، دون كلمات مرور أو بيانات حساسة: `
    : `I would like to discuss work environment security: ${context}.\nGeneral business context, tools and priority, without passwords or sensitive records: `;
}
