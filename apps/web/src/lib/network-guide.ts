import {
  networkCases,
  networkServices,
  type NetworkLocale,
} from '../content/network-infrastructure.ts';
export const networkProfiles = ['office', 'store', 'branches'] as const;
export const networkSizes = ['small', 'growing', 'larger'] as const;
export const networkPriorities = ['coverage', 'continuity', 'visibility'] as const;
export const networkDelivery = ['remote', 'onsite'] as const;
export type NetworkProfile = (typeof networkProfiles)[number];
export type NetworkGuideInput = {
  profile: NetworkProfile;
  size: (typeof networkSizes)[number];
  priority: (typeof networkPriorities)[number];
  delivery: (typeof networkDelivery)[number];
};
export const networkGuideLabels = {
  ar: {
    office: 'مكتب',
    store: 'متجر',
    branches: 'عدة مواقع',
    small: 'حتى ٢٥ جهازًا تقريبًا',
    growing: 'من ٢٦ إلى ٧٥ جهازًا تقريبًا',
    larger: 'أكثر من ٧٥ جهازًا',
    coverage: 'التغطية وتنظيم الوصول',
    continuity: 'التعثر والاتصال الاحتياطي',
    visibility: 'المراقبة والتنبيهات',
    remote: 'مراجعة وإعداد عن بُعد',
    onsite: 'أحتاج معاينة أو أعمالًا ميدانية',
  },
  en: {
    office: 'Office',
    store: 'Store',
    branches: 'Multiple sites',
    small: 'Up to about 25 devices',
    growing: 'About 26–75 devices',
    larger: 'More than 75 devices',
    coverage: 'Coverage and access organisation',
    continuity: 'Failure and backup connectivity',
    visibility: 'Monitoring and alerts',
    remote: 'Remote review and configuration',
    onsite: 'Survey or field work needed',
  },
};
export function networkGuidePlan(input: NetworkGuideInput) {
  const steps = ['inventory'];
  if (input.profile === 'branches') steps.push('sites');
  if (input.profile === 'store') steps.push('operations');
  if (input.size !== 'small') steps.push('capacity');
  steps.push(input.priority);
  steps.push(input.delivery === 'onsite' ? 'field' : 'remote');
  return steps;
}
export const networkPlanText = {
  ar: {
    inventory: 'جرد الأجهزة والموديلات والخطوط والتراخيص والمخطط المتاح.',
    sites: 'تحديد موارد كل موقع ومتطلبات الربط والعناوين والتراخيص قبل اختيار VPN.',
    operations: 'فصل أجهزة التشغيل والبيع عن شبكة الضيوف والتحقق من متطلبات التطبيقات.',
    capacity: 'مراجعة كثافة الاستخدام والمنافذ والطاقة والإدارة؛ عدد الأجهزة وحده لا يحدد السعة.',
    coverage:
      'مراجعة المساحة والعوائق ونقاط العمل ومناطق الوصول؛ الأعداد النهائية تحتاج دراسة موقع.',
    continuity: 'مراجعة الخط الاحتياطي والطاقة وسلوك التحويل والتعافي واختبار التطبيقات.',
    visibility: 'تحديد ما نرصده وكيف نجمع القياسات ومن يستلم التنبيه ويتابع الاستجابة.',
    field: 'حسم بلد المشروع والمعاينة والتوريد والتمديدات وإمكان التنفيذ قبل أي التزام ميداني.',
    remote: 'تأكيد وصول مصرح وآمن ووجود شخص بالموقع عند الحاجة وخطة تراجع للتغيير.',
  },
  en: {
    inventory: 'Inventory models, internet links, licences and available network plans.',
    sites: 'Define resources per site, addressing and licensing before choosing VPN connectivity.',
    operations:
      'Separate operational and POS devices from guests and check application requirements.',
    capacity:
      'Review density, ports, power and management; device count alone does not determine capacity.',
    coverage:
      'Review floor plans, obstacles, work areas and access zones; final counts need a site assessment.',
    continuity: 'Review backup links, power, failover, recovery and application behaviour.',
    visibility:
      'Define monitored elements, collection methods and who receives and acts on alerts.',
    field:
      'Confirm country, survey, procurement, cabling and delivery arrangements before any field commitment.',
    remote: 'Confirm authorised, safe access, onsite assistance where needed and a rollback plan.',
  },
};
export function networkContactHref(locale: NetworkLocale, input: NetworkGuideInput) {
  return `/${locale}/contact?network=guide&profile=${input.profile}&size=${input.size}&priority=${input.priority}&delivery=${input.delivery}`;
}
export function networkLeadMessage(
  locale: NetworkLocale,
  query: Record<string, string | string[] | undefined>,
) {
  if (typeof query.network !== 'string') return undefined;
  let context: string | undefined;
  if (query.network === 'guide') {
    if (
      !networkProfiles.some((v) => v === query.profile) ||
      !networkSizes.some((v) => v === query.size) ||
      !networkPriorities.some((v) => v === query.priority) ||
      !networkDelivery.some((v) => v === query.delivery)
    )
      return undefined;
    const labels = networkGuideLabels[locale];
    context = [
      labels[query.profile as NetworkGuideInput['profile']],
      labels[query.size as NetworkGuideInput['size']],
      labels[query.priority as NetworkGuideInput['priority']],
      labels[query.delivery as NetworkGuideInput['delivery']],
    ].join(' — ');
  } else
    context =
      networkCases.find((v) => `case-${v.id}` === query.network)?.[locale].title ??
      networkServices.find((v) => `scope-${v.id}` === query.network)?.[locale].title ??
      (query.network === 'review'
        ? locale === 'ar'
          ? 'مراجعة شبكة واحتياجها'
          : 'Network needs review'
        : undefined);
  if (!context) return undefined;
  return locale === 'ar'
    ? `أرغب في مناقشة شبكة لمنشأتي: ${context}.\nالبلد والمدينة ووصف الموقع والأجهزة والمشكلة الحالية: `
    : `I would like to discuss a business network: ${context}.\nCountry, city, premises, devices and current issue: `;
}
export function networkLinkState(primaryUp: boolean, backupAvailable: boolean) {
  return primaryUp ? 'primary' : backupAvailable ? 'backup' : 'offline';
}
export const networkNodes = [
  {
    id: 'internet',
    ar: [
      'اتصال الإنترنت',
      'نراجع المزود والخط والعناوين وإمكان خط احتياطي؛ وجود خطين لا يعني استقلال مسارهما.',
    ],
    en: [
      'Internet link',
      'Review provider, link, addressing and backup options; two links do not necessarily have independent paths.',
    ],
  },
  {
    id: 'gateway',
    ar: [
      'البوابة والجدار الناري',
      'قواعد اتصال وVPN بحسب المتطلبات، مع مراجعة قدرات الجهاز والترخيص وخطة تغيير وتراجع.',
    ],
    en: [
      'Gateway and firewall',
      'Traffic rules and scoped VPN with device capabilities, licensing and change and rollback planning.',
    ],
  },
  {
    id: 'switch',
    ar: [
      'السويتش المُدار',
      'نراجع المنافذ والسرعات والطاقة وفصل الشبكات والتوافق بدل اختيار الجهاز بحسب عدد المنافذ فقط.',
    ],
    en: [
      'Managed switch',
      'Review ports, speed, power, segmentation and compatibility rather than selecting by port count alone.',
    ],
  },
  {
    id: 'wifi',
    ar: [
      'نقاط الوصول',
      'التغطية والكثافة تتأثران بالمكان والعوائق والأجهزة؛ نحدد العدد والمواضع بعد الدراسة.',
    ],
    en: [
      'Access points',
      'Coverage and density depend on premises, obstacles and clients; counts and placement follow assessment.',
    ],
  },
  {
    id: 'staff',
    ar: [
      'أجهزة العمل',
      'وصول بحسب المهام إلى الموارد المطلوبة، مع فصل أجهزة التشغيل عند الحاجة واختبار التطبيقات.',
    ],
    en: [
      'Work devices',
      'Task-based access to required resources, separation where needed and application verification.',
    ],
  },
  {
    id: 'guest',
    ar: [
      'شبكة الضيوف',
      'إنترنت للزوار مع منع الوصول إلى شبكة العمل في هذا المثال. الفصل الفعلي يحتاج إعدادًا وفحصًا على المعدات.',
    ],
    en: [
      'Guest network',
      'Visitor internet with no access to the work network in this example. Real isolation requires configuration and testing.',
    ],
  },
] as const;
