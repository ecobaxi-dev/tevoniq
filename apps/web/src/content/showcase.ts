export type ShowcaseLocale = 'ar' | 'en';
export const showcaseCopy = {
  ar: {
    industries: 'حلول تبدأ من طبيعة نشاطك',
    industryIntro:
      'اختر قطاعك لتكتشف احتياجات العمل وأمثلة حلول يمكن تكييفها مع حجم منشأتك، دون افتراض أن كل نشاط يحتاج النظام نفسه.',
    projects: 'من الفكرة إلى نموذج واضح',
    projectIntro:
      'مشاريع ونماذج منشورة لفهم المشكلة وطريقة الحل. نوضح طبيعة النموذج وحدوده، ونناقش متطلباتك قبل اقتراح تنفيذ مشابه.',
    partners: 'تقنيات تخدم مشروعك',
    partnerIntro:
      'نختار الأدوات بحسب فائدتها والتوافق والتكلفة. أمثلة التقنية لا تعني شراكة أو اعتمادًا من الشركة المصنّعة.',
    insights: 'معرفة تساعدك على الخطوة التالية',
    insightIntro:
      'مقالات وموارد ودراسات منشورة تساعدك على تحديد المتطلبات ومقارنة الخيارات قبل البدء.',
    allIndustries: 'استكشف القطاعات',
    allProjects: 'استكشف المشاريع والنماذج',
    allPartners: 'استكشف منظومة التقنية',
    allInsights: 'تصفح المقالات والموارد',
    view: 'استكشف التفاصيل',
    demo: 'نموذج توضيحي',
    published: 'مشروع منشور',
    blog: 'مقال',
    resource: 'مورد عملي',
    case: 'دراسة حالة',
    minutes: 'دقائق قراءة',
    empty: 'لا توجد عناصر منشورة لعرضها حاليًا.',
    sectorNeed: 'احتياجات نراجعها معك',
    sectorScope: 'بداية عملية للمنشأة',
    sectorDemo: 'جرّب مثالًا مناسبًا',
    sectorNext: 'ابدأ من مهمة واضحة',
    sectorNextBody:
      'نراجع المستخدمين والخطوات والبيانات والبرامج الحالية، ثم نحدد ما يستحق التنفيذ ومعيار قبوله.',
    discuss: 'ناقش احتياج نشاطك',
    verified: 'شراكات منشورة وموثقة',
    tools: 'أمثلة أدوات وتقنيات',
    toolNote:
      'تُراجع ملاءمة الأداة وترخيصها وتكاليفها قبل اعتمادها. لا يوجد وعد بتوافق أو توفر أو علاقة توزيع لمجرد عرض الاسم.',
    demoNote: 'تصور توضيحي للمراجعة، وليس مشروع عميل منفّذًا أو نتائج فعلية.',
    resultNote: 'مؤشرات توضيحية في النموذج، وليست نتائج عميل.',
    projectContext: 'سياق النموذج',
    scope: 'نطاق يناسب حجم العمل',
    related: 'استكشف ما يرتبط بهذا الاحتياج',
  },
  en: {
    industries: 'Start with the way your business works',
    industryIntro:
      'Explore sector needs and solution examples that can fit your business size. The same system is not right for every operation.',
    projects: 'From an idea to a clear example',
    projectIntro:
      'Published projects and concepts explain a problem and an approach. Review each example’s nature and boundaries before discussing a similar implementation.',
    partners: 'Technology serving your project',
    partnerIntro:
      'Tools are chosen for usefulness, compatibility and cost. Technology examples do not imply a vendor partnership or certification.',
    insights: 'Knowledge for your next step',
    insightIntro:
      'Published articles, resources and studies to clarify requirements and compare options before you start.',
    allIndustries: 'Explore industries',
    allProjects: 'Explore projects and concepts',
    allPartners: 'Explore the technology ecosystem',
    allInsights: 'Browse articles and resources',
    view: 'Explore the details',
    demo: 'Illustrative concept',
    published: 'Published project',
    blog: 'Article',
    resource: 'Practical resource',
    case: 'Case study',
    minutes: 'min read',
    empty: 'No published items are available here yet.',
    sectorNeed: 'Needs to review together',
    sectorScope: 'A practical business starting point',
    sectorDemo: 'Try a relevant example',
    sectorNext: 'Start with one clear task',
    sectorNextBody:
      'Review users, steps, records and existing tools, then agree what is worth building and how it will be accepted.',
    discuss: 'Discuss your business needs',
    verified: 'Published, verified partnerships',
    tools: 'Example tools and technologies',
    toolNote:
      'Fit, licensing and costs are reviewed before selection. A name alone implies no guaranteed compatibility, availability or reseller relationship.',
    demoNote:
      'An illustrative concept for review, not a delivered client engagement or measured client results.',
    resultNote: 'Illustrative model indicators, not client results.',
    projectContext: 'Example context',
    scope: 'Scope that fits the operation',
    related: 'Explore related starting points',
  },
};
export const industryProfiles = {
  retail: {
    tone: 'orange',
    icon: 'shop',
    demo: '/website-designs/retail-store',
    ar: {
      needs: ['عرض المنتجات واستقبال الطلبات', 'تنظيم المخزون ومتابعة البيع'],
      scope: 'موقع أو متجر يبدأ بمنتجات واضحة ومسار طلب قابل للمتابعة.',
    },
    en: {
      needs: ['Product discovery and orders', 'Inventory and sales follow-up'],
      scope: 'A website or store with clear products and a traceable order journey.',
    },
  },
  hospitality: {
    tone: 'pink',
    icon: 'hospitality',
    demo: '/pesto',
    ar: {
      needs: ['متابعة الطلبات والحجوزات', 'تنظيم عمل المطعم أو المنشأة'],
      scope: 'تحديد نقطة تشغيل واحدة وربطها بالمستخدمين ومسؤولياتهم.',
    },
    en: {
      needs: ['Orders and booking follow-up', 'Organising venue operations'],
      scope: 'Start with one operating workflow and explicit user responsibilities.',
    },
  },
  manufacturing: {
    tone: 'blue',
    icon: 'factory',
    demo: '/work-systems/workshop-orders',
    ar: {
      needs: ['متابعة أوامر العمل والتسليم', 'توضيح مراحل الطلب والمسؤوليات'],
      scope: 'نموذج أمر عمل بحالات واضحة قبل التوسع إلى نظام أكبر.',
    },
    en: {
      needs: ['Work orders and delivery', 'Clear stages and ownership'],
      scope: 'A work-order model with explicit statuses before expanding the system.',
    },
  },
  'real-estate': {
    tone: 'violet',
    icon: 'building',
    demo: '/website-designs/real-estate',
    ar: {
      needs: ['عرض العقارات وطلب التفاصيل', 'متابعة الاستفسارات والمواعيد'],
      scope: 'واجهة للعروض ومسار متابعة للاستفسار بحسب البرامج المتاحة.',
    },
    en: {
      needs: ['Property discovery and enquiries', 'Enquiry and appointment follow-up'],
      scope: 'A property interface and enquiry workflow around available tools.',
    },
  },
  education: {
    tone: 'blue',
    icon: 'education',
    demo: '/work-systems/appointments',
    ar: {
      needs: ['عرض البرامج واستقبال الاستفسارات', 'تنظيم المواعيد والطلبات'],
      scope: 'بوابة معلومات وطلبات محددة مع وضوح الوصول إلى البيانات.',
    },
    en: {
      needs: ['Programme information and enquiries', 'Appointments and requests'],
      scope: 'Focused information and request flows with defined record access.',
    },
  },
  healthcare: {
    tone: 'teal',
    icon: 'care',
    demo: '/work-systems/appointments',
    ar: {
      needs: ['عرض خدمات المنشأة وطرق التواصل', 'تنظيم طلبات المواعيد الإدارية'],
      scope: 'نطاق إداري أولي؛ السجلات الطبية والقرارات السريرية تحتاج تقييمًا مستقلًا.',
    },
    en: {
      needs: ['Service information and contact', 'Administrative appointment requests'],
      scope:
        'An administrative starting scope; clinical records and decisions require separate assessment.',
    },
  },
  logistics: {
    tone: 'teal',
    icon: 'delivery',
    demo: '/work-systems/inventory',
    ar: {
      needs: ['متابعة الطلب والحالة والمسؤول', 'تنظيم السجلات والتسليم'],
      scope: 'سجل طلبات ومتابعة مراحل قبل تأكيد أي ربط بجهة نقل.',
    },
    en: {
      needs: ['Track requests, status and ownership', 'Organise records and handover'],
      scope: 'A traceable request record before confirming a carrier integration.',
    },
  },
  smes: {
    tone: 'orange',
    icon: 'shop',
    demo: '/work-systems',
    ar: {
      needs: ['بدء حضور رقمي واضح', 'تنظيم العمل المتكرر على مراحل'],
      scope: 'نختار البداية الأنسب: موقع، نظام عمل، ربط أو لوحة معلومات.',
    },
    en: {
      needs: ['A clear digital presence', 'Organise repeated work in stages'],
      scope: 'Choose a website, work system, integration or dashboard as a focused start.',
    },
  },
};
export function industryProfile(slug: string) {
  return (
    industryProfiles[slug as keyof typeof industryProfiles] ?? {
      tone: 'violet',
      icon: 'building',
      demo: '/work-systems',
      ar: {
        needs: ['توضيح رحلة المستفيد والطلبات', 'ربط الخطوات بالمستخدمين والبيانات'],
        scope: 'نراجع احتياجًا محددًا ومتطلبات النطاق قبل اقتراح الحل.',
      },
      en: {
        needs: ['Clarify user and request journeys', 'Connect steps, people and records'],
        scope: 'Review a focused need and scope requirements before proposing a solution.',
      },
    }
  );
}
export const technologyOptions = [
  {
    id: 'interfaces',
    mark: 'UI',
    name: 'React · Next.js',
    ar: ['مواقع وواجهات واضحة', 'لبناء تجربة استخدام قابلة للتطوير وفق احتياج المشروع.'],
    en: [
      'Websites and clear interfaces',
      'For web experiences shaped around project requirements.',
    ],
  },
  {
    id: 'systems',
    mark: 'API',
    name: 'Node.js · NestJS',
    ar: ['منطق الأعمال والربط', 'لتنظيم وظائف النظام وواجهاته وصلاحياته بحسب النطاق.'],
    en: [
      'Business logic and connections',
      'For scoped system behaviour, interfaces and permissions.',
    ],
  },
  {
    id: 'records',
    mark: 'DB',
    name: 'PostgreSQL',
    ar: ['بيانات منظمة', 'لتنظيم سجلات العمل وعلاقاتها وخطة الوصول والنسخ.'],
    en: [
      'Structured business records',
      'For records, relationships and an agreed access and backup plan.',
    ],
  },
  {
    id: 'quality',
    mark: 'QA',
    name: 'Playwright',
    ar: ['تحقق قابل للإعادة', 'لفحص المسارات المتفق عليها بعد تغيير الموقع أو النظام.'],
    en: [
      'Repeatable verification',
      'For checking agreed journeys after website or system changes.',
    ],
  },
  {
    id: 'networks',
    mark: 'NET',
    name: 'Cisco · UniFi',
    ar: ['اتصال وأجهزة عمل', 'أمثلة تجهيزات نقيّم طرازاتها وملاءمتها قبل الاختيار.'],
    en: [
      'Connectivity and work devices',
      'Example equipment families assessed before model selection.',
    ],
  },
  {
    id: 'visibility',
    mark: 'OPS',
    name: 'Zabbix',
    ar: ['رؤية أوضح للتشغيل', 'لمتابعة عناصر محددة والتنبيه عنها حسب صلاحيات واتفاق متابعة.'],
    en: [
      'Operational visibility',
      'For scoped monitoring and alerts with agreed access and response ownership.',
    ],
  },
];
export function isIllustrativeProject(slug: string) {
  return slug.startsWith('demo-');
}
export function isPlaceholderPartner(title: string) {
  return /^(?:شريك\s+(?:توضيحي|تجريبي)|illustrative\s+partner|demo\s+partner|sample\s+partner|örnek\s+(?:iş\s+)?orta[kğ])/iu.test(
    title.trim(),
  );
}
export const projectExamples: Record<string, string> = {
  'demo-connected-retail': '/website-designs/retail-store',
  'demo-hospitality-workspace': '/pesto',
  'demo-enterprise-knowledge-search': '/services/ai-machine-learning',
  'demo-secure-learning': '/services/cybersecurity',
};
