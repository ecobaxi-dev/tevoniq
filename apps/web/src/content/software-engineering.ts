export type EngineeringLocale = 'ar' | 'en';
export const engineeringCopy = {
  ar: {
    serviceTitle: 'هندسة المنتجات البرمجية',
    seoDescription:
      'نحوّل احتياج منشأتك إلى برنامج قابل للاستخدام، من تحديد النطاق وتصميم التجربة إلى البناء والاختبار والتسليم، مع نماذج ودراسات سيناريوهات توضيحية.',
    title: 'برمجيات تُبنى حول طريقة عملك',
    intro:
      'نساعد المنشآت الصغيرة والمتوسطة على تحويل فكرة أو إجراء متعثر إلى موقع أو نظام أو ربط عملي. نحدد البداية، ونراجع التصميم معك، ثم نبني ونختبر على مراحل واضحة.',
    subtitle: 'من احتياج مفهوم إلى برنامج يمكن مراجعته وتطويره',
    pillars: [
      ['نطاق واضح', 'وظائف ومستخدمون وحدود متفق عليها.'],
      ['تجربة قابلة للمراجعة', 'شاشات وخطوات يمكن تجربتها قبل التوسع.'],
      ['اختبار قبل الإطلاق', 'حالات نجاح وفشل ومعايير قبول محددة.'],
      ['تسليم منظم', 'طريقة استخدام وتشغيل واتفاق متابعة.'],
    ],
    quality: [
      [
        'متطلبات يمكن اختبارها',
        [
          'نحدد ما يفعله المستخدم والنتيجة المنتظرة.',
          'نوضح الصلاحيات والبيانات والاستثناءات.',
          'نربط اعتماد كل مرحلة بمعايير قبول.',
        ],
      ],
      [
        'مراجعة واختبارات مناسبة',
        [
          'نراجع التغييرات البرمجية والاعتماديات.',
          'نختبر المسارات الأساسية وحالات الفشل.',
          'نراجع العرض العربي والجوال وسهولة الاستخدام.',
        ],
      ],
      [
        'تشغيل وتسليم واضحان',
        [
          'نوثق الإعدادات ومسؤوليات التشغيل.',
          'نتفق على النسخ الاحتياطي والاستعادة بحسب النطاق.',
          'نحدد ما يدخل الصيانة وكيف تعتمد التعديلات.',
        ],
      ],
    ] as [string, string[]][],
    faq: [
      {
        question: 'هل نحتاج إلى تطوير برنامج من الصفر؟',
        answer:
          'ليس دائمًا. نراجع الأدوات الحالية والحلول الجاهزة والربط أولًا. نختار التطوير عندما توجد حاجة محددة تبرره، ونبدأ بنطاق يمكن تنفيذه واختباره.',
      },
      {
        question: 'كيف نحدد المرحلة الأولى؟',
        answer:
          'نختار إجراءً أو رحلة مستخدم ذات أولوية، ونحدد الشاشات والسجلات والأدوار وما يؤجل. نطاق المشروع الكبير يحتاج تخطيطًا وقدرات تنفيذ تتناسب معه؛ لا نضم كل الوظائف تلقائيًا إلى البداية.',
      },
      {
        question: 'كيف تستخدمون الذكاء الاصطناعي في التطوير؟',
        answer:
          'نستخدمه للمساعدة في التحليل واقتراح الشيفرة والاختبارات والتوثيق عندما يفيد. تبقى مراجعة المخرجات والاختبار واعتماد القرارات جزءًا من العمل، مع تحديد البيانات التي يجوز إدخالها إلى الأدوات.',
      },
      {
        question: 'هل النماذج ودراسات الحالات مشاريع عملاء؟',
        answer:
          'السيناريوهات المعروضة هنا توضيحية ببيانات افتراضية ومقترحات نطاق. يمكنك تجربة نماذجنا المرتبطة بها؛ وهي لا تمثل نتائج عملاء أو أنظمة متصلة بإنتاج فعلي.',
      },
      {
        question: 'ما الذي يشمله التسليم والصيانة؟',
        answer:
          'نحدد في الاتفاق الشيفرة والوثائق وحقوق الاستخدام والاستضافة والحسابات ومسؤوليات التشغيل، ونفصل الإصلاحات والصيانة عن إضافة وظائف جديدة وتكاليف الخدمات الخارجية.',
      },
    ],
  },
  en: {
    serviceTitle: 'Software Product Engineering',
    seoDescription:
      'Turn a business need into usable software through scoped requirements, experience design, implementation, testing and handover, with demos and illustrative scenario studies.',
    title: 'Software built around how you work',
    intro:
      'We help small and medium businesses turn an idea or a difficult workflow into a practical website, system or integration. Define a starting scope, review the design together, then build and test in clear stages.',
    subtitle: 'From a clear need to software you can review and improve',
    pillars: [
      ['Clear scope', 'Agreed features, users and boundaries.'],
      ['Reviewable experience', 'Try screens and steps before expanding.'],
      ['Testing before launch', 'Defined success, failure and acceptance checks.'],
      ['Organised handover', 'Usage, operation and a follow-up agreement.'],
    ],
    quality: [
      [
        'Testable requirements',
        [
          'Define user actions and expected outcomes.',
          'Clarify permissions, data and exceptions.',
          'Tie stage approval to acceptance criteria.',
        ],
      ],
      [
        'Appropriate review and tests',
        [
          'Review code changes and dependencies.',
          'Test core flows and failure cases.',
          'Review Arabic, mobile layouts and usability.',
        ],
      ],
      [
        'Clear operation and handover',
        [
          'Document setup and operational responsibilities.',
          'Agree backup and restore arrangements within scope.',
          'Define maintenance coverage and change approvals.',
        ],
      ],
    ] as [string, string[]][],
    faq: [
      {
        question: 'Do we need software built from scratch?',
        answer:
          'Not always. Review existing tools, ready-made software and integration first. Choose development when a defined need justifies it, starting with a scope that can be delivered and tested.',
      },
      {
        question: 'How is the first version defined?',
        answer:
          'Choose a priority workflow or user journey, then define screens, records, roles and deferrals. Larger requirements need appropriate planning and delivery capacity; the first version does not automatically include every feature.',
      },
      {
        question: 'How do you use AI during development?',
        answer:
          'AI can assist analysis, code suggestions, tests and documentation where useful. Output review, testing and decision approval remain part of the work, with an agreement on which data may be used in these tools.',
      },
      {
        question: 'Are these demos and case studies client projects?',
        answer:
          'The scenarios here use fictional data and proposed scopes. You can try our related demos; they do not represent client results or live production integrations.',
      },
      {
        question: 'What is included in handover and maintenance?',
        answer:
          'Agree code, documentation, usage rights, hosting, accounts and operating responsibilities in writing. Separate fixes and maintenance from new features and external service costs.',
      },
    ],
  },
};
export const engineeringServices = [
  {
    id: 'discovery',
    href: 'services/it-consulting',
    ar: {
      title: 'تحليل الاحتياج والنطاق',
      body: 'نحوّل الفكرة إلى مشكلة محددة ومستخدمين ورحلة عمل يمكن مناقشتها قبل اختيار التقنية.',
      items: [
        'خريطة الخطوات والبيانات الحالية',
        'أولوية المرحلة الأولى وما يؤجل',
        'معايير قبول واعتماديات',
      ],
      output: 'ملخص احتياج ونطاق أولي',
    },
    en: {
      title: 'Discovery and scope',
      body: 'Turn an idea into a defined problem, users and workflow before choosing technology.',
      items: [
        'Current steps and data map',
        'First-stage priorities and deferrals',
        'Acceptance criteria and dependencies',
      ],
      output: 'A needs brief and initial scope',
    },
  },
  {
    id: 'experience',
    href: 'website-designs',
    ar: {
      title: 'تصميم التجربة والواجهات',
      body: 'نرتب المعلومات والشاشات لتكون الخطوة التالية واضحة، مع مراعاة العربية والجوال.',
      items: [
        'رحلة المستخدم والشاشات الأساسية',
        'نموذج واجهات قابل للمراجعة',
        'حالات الإدخال والخطأ والمراجعة',
      ],
      output: 'تصور واجهات وخطوات معتمدة',
    },
    en: {
      title: 'Experience and interface design',
      body: 'Organise information and screens so the next step is clear, considering Arabic and mobile use.',
      items: [
        'User journey and core screens',
        'A reviewable interface prototype',
        'Input, error and review states',
      ],
      output: 'An agreed interface and flow outline',
    },
  },
  {
    id: 'build',
    href: 'work-systems',
    ar: {
      title: 'بناء المواقع وأنظمة العمل',
      body: 'نبني وظائف محددة تخدم نشاطك، من استقبال الاستفسارات إلى متابعة الطلبات والسجلات.',
      items: [
        'شاشات وسجلات ضمن نطاق معلوم',
        'أدوار وصلاحيات بحسب الحاجة',
        'ربط الوظائف بمعايير قبول',
      ],
      output: 'نسخة أولية قابلة للتجربة',
    },
    en: {
      title: 'Build websites and work systems',
      body: 'Build defined features for your business, from enquiry capture to request and record management.',
      items: [
        'Screens and records within a clear scope',
        'Roles and permissions as needed',
        'Features linked to acceptance criteria',
      ],
      output: 'A first version you can try',
    },
  },
  {
    id: 'integration',
    href: 'automation-demos',
    ar: {
      title: 'الربط وأتمتة الخطوات',
      body: 'ننظم انتقال البيانات بين أدواتك عندما تتوفر واجهات وصلاحيات مناسبة.',
      items: [
        'تحديد مصدر الحقول وقواعد التحديث',
        'منع التكرار ومعالجة الفشل',
        'موافقات قبل الإجراءات الحساسة',
      ],
      output: 'مسار ربط موثق وقابل للاختبار',
    },
    en: {
      title: 'Integrate and automate steps',
      body: 'Organise data movement between your tools where suitable interfaces and permissions exist.',
      items: [
        'Field sources and update rules',
        'Duplicate prevention and failure handling',
        'Approvals before sensitive actions',
      ],
      output: 'A documented, testable integration flow',
    },
  },
  {
    id: 'improve',
    href: 'services/business-automation',
    ar: {
      title: 'تحسين برنامج قائم',
      body: 'نراجع جزءًا محددًا من برنامج تملك حق تعديله، ثم نقترح تحسينًا محدودًا بدل استبداله بالكامل دون حاجة.',
      items: [
        'مراجعة الوصول والشيفرة والاعتماديات',
        'تحديد مشكلة أو مسار يحتاج تحسينًا',
        'خطة تغيير واختبار ورجوع',
      ],
      output: 'قائمة تحسينات مرتبة وخطوة مجرّبة',
    },
    en: {
      title: 'Improve existing software',
      body: 'Review a defined part of software you have rights to change and propose a limited improvement before considering replacement.',
      items: [
        'Review access, code and dependencies',
        'Identify a problem or workflow to improve',
        'Plan changes, tests and rollback',
      ],
      output: 'Prioritised improvements and a tested step',
    },
  },
  {
    id: 'quality',
    href: 'dashboard-demos',
    ar: {
      title: 'الاختبار والتسليم والمتابعة',
      body: 'نختبر ما تم الاتفاق عليه ونوضح الاستخدام والتشغيل ومسؤوليات المتابعة.',
      items: [
        'فحص المسارات والصلاحيات والاستثناءات',
        'مراجعة البيانات والعرض على الجوال',
        'دليل استخدام وحدود الصيانة',
      ],
      output: 'قائمة فحص وتسليم قابل للمراجعة',
    },
    en: {
      title: 'Test, hand over and review',
      body: 'Test the agreed features and explain usage, operation and follow-up responsibilities.',
      items: [
        'Check flows, permissions and exceptions',
        'Review data and mobile layouts',
        'Usage guidance and maintenance boundaries',
      ],
      output: 'A reviewable checklist and handover',
    },
  },
];
export const engineeringStages = [
  {
    id: 'define',
    ar: {
      title: 'نحدد',
      body: 'نفهم المستخدم والمشكلة ونختار خطوة أولى مفيدة.',
      output: 'نطاق وشروط قبول',
      gate: 'نعتمد البداية بعد وضوح المتطلبات والاعتماديات.',
    },
    en: {
      title: 'Define',
      body: 'Understand the user and problem, then choose a useful first step.',
      output: 'Scope and acceptance criteria',
      gate: 'Approve the starting scope once requirements and dependencies are clear.',
    },
  },
  {
    id: 'prototype',
    ar: {
      title: 'نجرّب',
      body: 'نعرض نموذجًا للشاشات أو المسار ونراجع طريقة الاستخدام.',
      output: 'نموذج وملاحظات معتمدة',
      gate: 'نقرر البناء بعد مراجعة التجربة والوظائف الأساسية.',
    },
    en: {
      title: 'Prototype',
      body: 'Review a screen or workflow prototype and how it would be used.',
      output: 'A prototype and agreed feedback',
      gate: 'Decide to build after reviewing the experience and core features.',
    },
  },
  {
    id: 'deliver',
    ar: {
      title: 'نبني ونختبر',
      body: 'ننظم التنفيذ في أجزاء ونختبر النجاح والفشل والصلاحيات.',
      output: 'نسخة مجرّبة وقائمة فحص',
      gate: 'لا نعتمد التشغيل قبل مراجعة النتيجة مقابل شروط القبول.',
    },
    en: {
      title: 'Build and test',
      body: 'Deliver in increments and test success, failure and permissions.',
      output: 'A tested version and checklist',
      gate: 'Approve launch after reviewing results against acceptance criteria.',
    },
  },
  {
    id: 'review',
    ar: {
      title: 'نسلّم ونحسّن',
      body: 'نوضح الاستخدام ونراجع ما يحتاج إصلاحًا أو توسعًا ضمن اتفاق.',
      output: 'تسليم وأولوية الخطوة التالية',
      gate: 'نحدد المتابعة والصيانة والتغييرات قبل التوسع.',
    },
    en: {
      title: 'Hand over and improve',
      body: 'Explain usage and review fixes or expansion within an agreement.',
      output: 'Handover and a next-step priority',
      gate: 'Agree monitoring, maintenance and changes before expanding.',
    },
  },
];
export const engineeringCases = [
  {
    id: 'service-requests',
    model: 'work-systems/maintenance',
    theme: 'teal',
    ar: {
      title: 'منشأة صيانة تنظّم طلباتها',
      problem:
        'بلاغات تصل عبر رسائل متعددة، وتحتاج إعادة إدخال ومتابعة يدوية لمعرفة الموعد والحالة.',
      scope: [
        'سجل طلبات وموعد وأولوية',
        'حالات واضحة وملاحظات تحديث',
        'بحث وتصفية وتجربة عرض على الجوال',
      ],
      checks: [
        'يمكن العثور على طلب من سجله',
        'تظهر تغييرات الموعد والحالة في السجل',
        'الحقول المطلوبة تمنع حفظ طلب ناقص',
      ],
      integration:
        'يمكن دراسة ربط نموذج الموقع بسجل الطلبات إذا توفرت واجهة مناسبة وموافقة على استخدام البيانات.',
      defer: 'توزيع الفنيين المتقدم والفوترة والعقود المتكررة تؤجل إلى نطاق مستقل.',
      outcome: 'المخرج المقترح: مسار يمكن تجربته من بلاغ جديد إلى إغلاق الطلب.',
    },
    en: {
      title: 'A maintenance business organises requests',
      problem:
        'Requests arrive in multiple messages, requiring repeated entry and manual checking of dates and status.',
      scope: [
        'A request register with dates and priorities',
        'Clear statuses and update notes',
        'Search, filtering and mobile layouts',
      ],
      checks: [
        'Find a request from its record',
        'Date and status changes appear in the record',
        'Required fields prevent incomplete submissions',
      ],
      integration:
        'Review connecting a website form to the request register if an appropriate interface and data-use approval are available.',
      defer: 'Advanced dispatch, invoicing and recurring contracts are scoped separately.',
      outcome: 'Proposed output: a testable flow from a new ticket through to closure.',
    },
  },
  {
    id: 'trade-stock',
    model: 'work-systems/inventory',
    theme: 'orange',
    ar: {
      title: 'نشاط تجاري يتابع مخزونه',
      problem:
        'أرصدة تتغير بين ملفات متعددة، ويصعب معرفة الحركة التي أدت إلى الرصيد أو قرب نفاد صنف.',
      scope: ['سجل أصناف ووحدة وكمية', 'حركات إضافة وصرف مع التحقق', 'حد تنبيه وتصفية للأصناف'],
      checks: [
        'لا يقبل صرف كمية أكبر من المتاح',
        'يرتبط الرصيد بحركات مسجلة',
        'تظهر الأصناف وفق حد التنبيه المحدد',
      ],
      integration:
        'يمكن دراسة تبادل الطلبات مع متجر قائم وفق واجهاته وقواعد الحجز والتحديث ومنع التكرار.',
      defer:
        'التكاليف المحاسبية وتعدد المستودعات والمزامنة الفعلية لا تدخل تلقائيًا في النموذج الأول.',
      outcome: 'المخرج المقترح: رصيد قابل للتتبع إلى حركة واضحة.',
    },
    en: {
      title: 'A trading business tracks inventory',
      problem:
        'Balances differ across files, making movements hard to trace and low stock difficult to spot.',
      scope: [
        'An item register with units and quantities',
        'Validated receipt and issue movements',
        'Alert thresholds and item filtering',
      ],
      checks: [
        'An issue cannot exceed available stock',
        'Balances trace to recorded movements',
        'Items appear according to their alert thresholds',
      ],
      integration:
        'Review exchanging orders with an existing store against its interfaces, reservation rules, update logic and duplicate prevention.',
      defer:
        'Accounting valuation, multiple warehouses and live synchronisation are not automatically included in the first prototype.',
      outcome: 'Proposed output: a balance traceable to clear stock movements.',
    },
  },
  {
    id: 'enquiry-follow-up',
    model: 'automation-demos/lead-capture',
    theme: 'purple',
    ar: {
      title: 'نشاط خدمات ينظّم متابعة الاستفسارات',
      problem:
        'طلبات من الموقع تحتاج نسخًا إلى سجل، وقد يتكرر تسجيل الاستفسار أو تجهيز رد دون مراجعة اختيار التواصل.',
      scope: ['فحص حقول الاستفسار', 'تجهيز سجل وملخص متابعة', 'قواعد تكرار وموافقة على التواصل'],
      checks: [
        'تُكشف إعادة تشغيل الطلب نفسه',
        'يُراجع تغير بيانات الطلب',
        'لا يُجهز تواصل عند غياب الموافقة',
      ],
      integration:
        'التشغيل الفعلي يحتاج حسابات وقنوات معتمدة وواجهات متاحة واختبارات إرسال منفصلة.',
      defer: 'الحملات الجماعية والإرسال الفعلي ليسا جزءًا من المحاكي؛ تجربة الصفحة لا ترسل رسائل.',
      outcome: 'المخرج المقترح: مسار متابعة موثق يحترم شروط البيانات والتواصل.',
    },
    en: {
      title: 'A service business organises enquiries',
      problem:
        'Website enquiries are copied into a register, risking duplicate records or replies prepared without checking contact preferences.',
      scope: [
        'Validate enquiry fields',
        'Prepare a record and follow-up summary',
        'Duplicate checks and contact consent rules',
      ],
      checks: [
        'Detect replaying the same request',
        'Review changed request data',
        'Do not prepare contact without consent',
      ],
      integration:
        'Live operation needs authorised accounts and channels, available interfaces and separate sending tests.',
      defer:
        'Bulk campaigns and live sending are outside the simulator; the page does not send messages.',
      outcome:
        'Proposed output: a documented follow-up flow respecting data and contact conditions.',
    },
  },
];
