export type DirectoryLocale = 'ar' | 'en';
export const directoryCopy = {
  ar: {
    title: 'خدمات رقمية تنظّم أعمالك',
    intro:
      'موقع يعرّف بنشاطك، أو نظام ينظّم طلباتك، أو ربط يختصر الخطوات المتكررة. نساعدك على اختيار بداية مفيدة، بنطاق واضح وتنفيذ على مراحل.',
    eyebrow: 'خدمات TEVONIQ للمنشآت الصغيرة والمتوسطة',
    explore: 'استكشف الخدمات المنشورة',
    talk: 'لنناقش احتياجك',
    modelsTitle: 'ابدأ من احتياجك وجرّب الفكرة',
    modelsIntro:
      'أربعة مسارات بنماذج تفاعلية أصلية وبيانات افتراضية، لتتعرف على ما يمكن تنفيذه قبل مناقشة التفاصيل.',
    catalogTitle: 'اختر الخدمة الأقرب إلى احتياجك',
    catalogIntro:
      'الخدمات المنشورة في هذه اللغة، مرتبة حسب الفئة. البحث يشمل الدليل كاملًا؛ وأعداد الفئات تعرض محتوى الصفحة الحالية.',
    categories: 'فئات هذه الصفحة',
    details: 'تفاصيل الخدمة',
    scope: 'نراجع المتطلبات ونحدد المخرجات قبل التنفيذ.',
    emptySearch: 'لا توجد خدمات منشورة تطابق هذا البحث.',
    clear: 'عرض جميع الخدمات',
    results: 'الخدمات المعروضة',
    fallback: 'خدمات أخرى منشورة',
    backTop: 'العودة إلى فئات الخدمات',
    contactTitle: 'لست متأكدًا من البداية المناسبة؟',
    contactBody:
      'أخبرنا بطريقة العمل والبرامج المستخدمة والمشكلة التي تريد حلّها. نراجع معك الخيار المناسب ونطاق المرحلة الأولى.',
    contactCta: 'ساعدنا على فهم احتياجك',
  },
  en: {
    title: 'Digital services that organise your business',
    intro:
      'A website for your business, a system for your requests, or an integration for repeated steps. We help choose a useful starting point with clear scope and staged delivery.',
    eyebrow: 'TEVONIQ SERVICES FOR SMALL AND MEDIUM BUSINESSES',
    explore: 'Explore published services',
    talk: 'Discuss your needs',
    modelsTitle: 'Start with your need and try the idea',
    modelsIntro:
      'Four paths with original interactive demos and fictional data, so you can explore what could be built before discussing details.',
    catalogTitle: 'Find the service closest to your need',
    catalogIntro:
      'Services published in this language, arranged by category. Search covers the whole directory; category counts describe the current page.',
    categories: 'Categories on this page',
    details: 'Service details',
    scope: 'Review requirements and agree outputs before implementation.',
    emptySearch: 'No published services match this search.',
    clear: 'View all services',
    results: 'Services shown',
    fallback: 'Other published services',
    backTop: 'Back to service categories',
    contactTitle: 'Unsure where to start?',
    contactBody:
      'Tell us about your workflow, existing tools and the problem you want to solve. Together, we review a suitable option and scope the first stage.',
    contactCta: 'Tell us about your needs',
  },
};
export const directoryGroupCopy: Record<string, { ar: string; en: string }> = {
  consulting: {
    ar: 'نراجع الاحتياج والخيارات ونحدد خطة بداية قابلة للتنفيذ.',
    en: 'Review needs and options, then define a practical starting plan.',
  },
  engineering: {
    ar: 'من تصميم التجربة إلى البناء والاختبار والتسليم، ضمن نطاق واضح.',
    en: 'From experience design to development, testing and handover within a clear scope.',
  },
  automation: {
    ar: 'نربط خطوات العمل والسجلات والبرامج لتكون المتابعة أوضح.',
    en: 'Connect business steps, records and tools for clearer follow-up.',
  },
  iot: {
    ar: 'نراجع احتياج الأجهزة والاتصال وطريقة الاستفادة من بياناتها.',
    en: 'Review devices, connectivity and how their data could support your workflow.',
  },
  ai: {
    ar: 'نختار استخدامًا محددًا للمساعدة الذكية، مع مراجعة البيانات والمخرجات.',
    en: 'Choose a focused use for AI assistance, with reviewed inputs and outputs.',
  },
  security: {
    ar: 'نراعي الصلاحيات والتحقق واستمرار العمل بحسب متطلبات النطاق.',
    en: 'Consider access, validation and continuity against the agreed requirements.',
  },
  additional: {
    ar: 'ربط وبرامج واتصال يدعم تشغيل أدواتك الحالية.',
    en: 'Integration, software and connectivity supporting your existing tools.',
  },
};
export const directoryPaths = [
  {
    id: 'website',
    href: 'website-designs',
    image: '/brand/website-designs/preview-ar-business-services.webp',
    enImage: '/brand/website-designs/preview-en-business-services.webp',
    theme: 'orange',
    ar: {
      title: 'مواقع الأعمال',
      body: 'عرّف بنشاطك واستقبل الاستفسارات بتجربة واضحة على الجوال.',
      cta: 'استكشف تصاميم المواقع',
    },
    en: {
      title: 'Business websites',
      body: 'Present your business and receive enquiries with a clear mobile experience.',
      cta: 'Explore website designs',
    },
  },
  {
    id: 'workflow',
    href: 'work-systems',
    image: '/brand/navigation/engineering-v1.webp',
    enImage: '/brand/navigation/engineering-v1.webp',
    theme: 'purple',
    ar: {
      title: 'أنظمة إدارة العمل',
      body: 'اجمع الطلبات والحالات والمواعيد والملاحظات في مسار مفهوم.',
      cta: 'جرّب أنظمة إدارة العمل',
    },
    en: {
      title: 'Work management systems',
      body: 'Bring requests, statuses, dates and notes into an understandable workflow.',
      cta: 'Try work management demos',
    },
  },
  {
    id: 'automation',
    href: 'automation-demos',
    image: '/brand/navigation/automation-v1.webp',
    enImage: '/brand/navigation/automation-v1.webp',
    theme: 'teal',
    ar: {
      title: 'الأتمتة والربط',
      body: 'استكشف كيف تنتقل البيانات بين الأدوات وفق قواعد وموافقات.',
      cta: 'شاهد مسارات الأتمتة',
    },
    en: {
      title: 'Automation and integration',
      body: 'Explore how data moves between tools with defined rules and approvals.',
      cta: 'Explore automation flows',
    },
  },
  {
    id: 'dashboard',
    href: 'dashboard-demos',
    image: '/brand/dashboard-demos/ar-sales.webp',
    enImage: '/brand/dashboard-demos/en-sales.webp',
    theme: 'blue',
    ar: {
      title: 'لوحات المعلومات',
      body: 'تابع مؤشرات مرتبطة بالسجلات، وافهم ما يحتاج إلى متابعة.',
      cta: 'تصفّح لوحات المعلومات',
    },
    en: {
      title: 'Business dashboards',
      body: 'Follow metrics linked to records and understand what needs attention.',
      cta: 'Explore business dashboards',
    },
  },
];
