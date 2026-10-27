export type ConsultingLocale = 'ar' | 'en';
export type ConsultingAnswers = {
  business: 'retail' | 'services' | 'workshop' | 'other';
  goal: 'presence' | 'requests' | 'repetition' | 'visibility' | 'unsure';
  tools: 'none' | 'files' | 'software-fits' | 'software-gaps' | 'unsure';
  frequency: 'occasional' | 'weekly' | 'daily';
  clarity: 'clear' | 'partly' | 'unclear';
};
export type ConsultingResultKey =
  | 'clarify'
  | 'improve-existing'
  | 'light-step'
  | 'organise-data'
  | 'website'
  | 'work-system'
  | 'automation'
  | 'dashboard';
export type ConsultingResultCopy = {
  title: string;
  reason: string;
  steps: string[];
  defer: string;
};
export type ConsultingAlternativeId = 'existing' | 'ready-made' | 'connect' | 'custom';
export const consultingQuestions = [
  {
    key: 'business',
    ar: 'ما نوع نشاطك؟',
    en: 'What kind of business do you run?',
    options: [
      {
        value: 'retail',
        ar: 'متجر أو تجارة',
        en: 'Retail or trade',
      },
      {
        value: 'services',
        ar: 'خدمات ومواعيد',
        en: 'Services and appointments',
      },
      {
        value: 'workshop',
        ar: 'ورشة أو تصنيع حسب الطلب',
        en: 'Workshop or made-to-order',
      },
      {
        value: 'other',
        ar: 'نشاط آخر',
        en: 'Other business',
      },
    ],
  },
  {
    key: 'goal',
    ar: 'ما الاحتياج الأقرب لك؟',
    en: 'What do you most need to improve?',
    options: [
      {
        value: 'presence',
        ar: 'تعريف العملاء بالنشاط واستقبال الاستفسارات',
        en: 'Business presence and enquiries',
      },
      {
        value: 'requests',
        ar: 'تنظيم الطلبات ومراحل العمل',
        en: 'Requests and workflow tracking',
      },
      {
        value: 'repetition',
        ar: 'تقليل نقل البيانات والعمل المتكرر',
        en: 'Repeated work and data entry',
      },
      {
        value: 'visibility',
        ar: 'فهم الأرقام ومتابعة ما يحدث',
        en: 'Clearer numbers and progress',
      },
      {
        value: 'unsure',
        ar: 'أحتاج إلى توضيح المشكلة أولًا',
        en: 'I need to clarify the problem first',
      },
    ],
  },
  {
    key: 'tools',
    ar: 'ما الذي تستخدمه لهذا الاحتياج اليوم؟',
    en: 'What do you use for this need today?',
    options: [
      {
        value: 'none',
        ar: 'لا توجد أداة محددة',
        en: 'No defined tool',
      },
      {
        value: 'files',
        ar: 'ملفات وجداول ورسائل',
        en: 'Files, spreadsheets and messages',
      },
      {
        value: 'software-fits',
        ar: 'برنامج مناسب لم نستفد من إمكاناته بالكامل',
        en: 'Suitable software with unused features',
      },
      {
        value: 'software-gaps',
        ar: 'برنامج موجود مع نقص أو تشتت بين الأدوات',
        en: 'Existing software with gaps or disconnected tools',
      },
      {
        value: 'unsure',
        ar: 'لست متأكدًا من الإمكانات الحالية',
        en: 'Unsure about current capabilities',
      },
    ],
  },
  {
    key: 'frequency',
    ar: 'كم تتكرر هذه الخطوة أو المتابعة؟',
    en: 'How often does this step or review happen?',
    options: [
      {
        value: 'occasional',
        ar: 'من حين لآخر',
        en: 'Occasionally',
      },
      {
        value: 'weekly',
        ar: 'أسبوعيًا',
        en: 'Weekly',
      },
      {
        value: 'daily',
        ar: 'يوميًا أو عدة مرات في اليوم',
        en: 'Daily or several times a day',
      },
    ],
  },
  {
    key: 'clarity',
    ar: 'ما مدى وضوح المتطلبات لديك؟',
    en: 'How clear are your requirements?',
    options: [
      {
        value: 'clear',
        ar: 'أعرف المستخدمين والخطوات والنتيجة المطلوبة',
        en: 'Users, steps and outcome are clear',
      },
      {
        value: 'partly',
        ar: 'أعرف المشكلة وبعض التفاصيل',
        en: 'The problem and some details are clear',
      },
      {
        value: 'unclear',
        ar: 'أحتاج إلى فهم الاحتياج وتحديد الأولوية',
        en: 'I need to define the need and priority',
      },
    ],
  },
] as const;
export const consultingResults: Record<
  ConsultingResultKey,
  { ar: ConsultingResultCopy; en: ConsultingResultCopy; gallery: string | null }
> = {
  clarify: {
    ar: {
      title: 'لنوضح الاحتياج قبل اختيار الحل',
      reason:
        'المشكلة أو إمكانات الأدوات الحالية تحتاج مراجعة، لذلك نبدأ بفهم طريقة العمل وتحديد النتيجة المطلوبة.',
      steps: [
        'وصف الخطوة التي تريد تحسينها',
        'حصر الأدوات والبيانات والمستخدمين',
        'اختيار أولوية واحدة ومعيار للتحقق منها',
      ],
      defer: 'نؤجل اختيار برنامج أو بناء نظام حتى تتضح المتطلبات.',
    },
    en: {
      title: 'Clarify the need before choosing a solution',
      reason:
        'The problem or current tool capabilities need review. Start by mapping the work and the intended outcome.',
      steps: [
        'Describe the step to improve',
        'List tools, data and users',
        'Choose one priority and a way to verify it',
      ],
      defer: 'Defer software selection or custom development until requirements are clearer.',
    },
    gallery: null,
  },
  'improve-existing': {
    ar: {
      title: 'راجع إمكانات الأداة الحالية أولًا',
      reason:
        'ذكرت وجود برنامج مناسب مع إمكانات غير مستخدمة؛ قد تكفي تهيئته وتنظيم استخدامه لخطوة أولى مفيدة.',
      steps: [
        'مراجعة الإعدادات والحقول والتقارير المتاحة',
        'تحديد تعديل محدود قابل للتجربة',
        'اختبار النتيجة مع المستخدمين',
      ],
      defer: 'نؤجل بناء أداة بديلة حتى نتحقق مما يتيحه البرنامج الحالي.',
    },
    en: {
      title: 'Review your current tool first',
      reason:
        'You have suitable software with unused features. Configuration and clearer usage may be enough for a useful first step.',
      steps: [
        'Review available settings, fields and reports',
        'Choose a limited change to try',
        'Check the outcome with the users',
      ],
      defer: 'Defer replacing the tool until its current capabilities have been reviewed.',
    },
    gallery: null,
  },
  'light-step': {
    ar: {
      title: 'ابدأ بخطوة بسيطة قبل الأتمتة',
      reason:
        'الخطوة تتكرر من حين لآخر؛ يستحق الأمر تجربة نموذج موحد أو إجراء أوضح قبل إعداد ربط يحتاج تشغيلًا ومتابعة.',
      steps: [
        'توحيد المدخلات في نموذج بسيط',
        'توضيح المسؤول والخطوة التالية',
        'مراجعة التكرار والجهد بعد التجربة',
      ],
      defer: 'نؤجل الربط الآلي حتى تظهر حاجة متكررة واضحة.',
    },
    en: {
      title: 'Try a simpler step before automation',
      reason:
        'This happens occasionally. A consistent template or clearer procedure is worth trying before an integration that needs operation and maintenance.',
      steps: [
        'Standardise inputs in a simple template',
        'Define responsibility and the next step',
        'Review repetition and effort after trying it',
      ],
      defer: 'Defer automation until there is a clear repeated need.',
    },
    gallery: '/automation-demos',
  },
  'organise-data': {
    ar: {
      title: 'نظّم البيانات قبل الربط أو اللوحة',
      reason:
        'لا يوجد مصدر واضح أو تعتمد الخطوة على ملفات ورسائل؛ نبدأ بتحديد الحقول والمصدر قبل تجهيز نقل أو حسابات تعتمد عليها.',
      steps: [
        'تعريف السجل والحقول الأساسية',
        'اختيار مصدر واحد قابل للمراجعة',
        'تجربة إدخال بيانات محدودة والتحقق منها',
      ],
      defer: 'نؤجل الربط والتقارير المتقدمة حتى تصبح البيانات قابلة للاعتماد.',
    },
    en: {
      title: 'Organise the data before connecting or reporting',
      reason:
        'There is no clear source, or the step relies on separate files and messages. Define the fields and source before moving or calculating from the data.',
      steps: [
        'Define the record and essential fields',
        'Choose one reviewable source',
        'Try and validate a limited set of entries',
      ],
      defer: 'Defer integration and advanced reporting until the data is dependable.',
    },
    gallery: '/work-systems',
  },
  website: {
    ar: {
      title: 'ابدأ بموقع يوضح نشاطك ومسار الاستفسار',
      reason:
        'احتياجك الأساسي هو التعريف بالنشاط واستقبال الاستفسارات؛ نحدد المحتوى والصفحات وما يجب أن يرسله الزائر.',
      steps: [
        'تحديد جمهور الموقع والخدمات الأساسية',
        'تجهيز صفحات ونموذج استفسار محدد',
        'اختبار تجربة الجوال ووصول الطلب',
      ],
      defer: 'نؤجل المتجر والربط المعقد حتى تثبت الحاجة إليهما.',
    },
    en: {
      title: 'Start with a clear business website and enquiry journey',
      reason:
        'Your main need is business presence and enquiries. Define the content, pages and what the visitor should submit.',
      steps: [
        'Identify the audience and core services',
        'Prepare focused pages and an enquiry form',
        'Test mobile use and enquiry receipt',
      ],
      defer: 'Defer a store and complex integrations until they are needed.',
    },
    gallery: '/website-designs',
  },
  'work-system': {
    ar: {
      title: 'قارن أداة جاهزة بنظام متابعة محدود',
      reason:
        'تحتاج إلى تنظيم الطلبات ومراحل العمل. نحدد السجلات والحالات، ثم نراجع ما يغطيه حل جاهز وما يحتاج تخصيصًا.',
      steps: [
        'رسم مسار طلب واحد من الاستلام للإغلاق',
        'تحديد الحقول والأدوار الأساسية',
        'مقارنة الخيارات وتجربة نطاق صغير',
      ],
      defer: 'نؤجل المزايا الإضافية حتى يُختبر المسار الأساسي.',
    },
    en: {
      title: 'Compare a ready-made tool with a focused tracker',
      reason:
        'You need request and workflow organisation. Define records and stages, then compare ready-made coverage with custom needs.',
      steps: [
        'Map one request from receipt to closure',
        'Define essential fields and roles',
        'Compare options and test a small scope',
      ],
      defer: 'Defer extra features until the core workflow has been tried.',
    },
    gallery: '/work-systems',
  },
  automation: {
    ar: {
      title: 'راجع ربط خطوة متكررة بين أدواتك',
      reason:
        'هناك خطوة متكررة وأدوات قائمة؛ نراجع واجهاتها وشروط التشغيل قبل اختيار ربط محدود يمكن اختباره.',
      steps: [
        'تحديد الحدث والبيانات المنقولة',
        'التحقق من واجهات البرامج والصلاحيات',
        'تجربة الربط والموافقة والأخطاء',
      ],
      defer: 'نؤجل توسيع الأتمتة حتى يثبت المسار الأول ويُراجع تشغيله.',
    },
    en: {
      title: 'Review one repeated step between your tools',
      reason:
        'You have a repeated step and existing tools. Review supported interfaces and operating rules before choosing a limited integration.',
      steps: [
        'Define the trigger and mapped data',
        'Check software APIs and permissions',
        'Test the flow, approvals and failures',
      ],
      defer:
        'Defer expanding automation until the first flow is verified and its operation reviewed.',
    },
    gallery: '/automation-demos',
  },
  dashboard: {
    ar: {
      title: 'ابدأ بلوحة تجيب عن سؤال محدد',
      reason:
        'تحتاج إلى متابعة الأرقام ويوجد مصدر مبدئي للبيانات؛ نحدد المؤشر وطريقة حسابه ثم نراجعه مقابل السجلات.',
      steps: [
        'اختيار سؤال ومؤشر واضح',
        'مراجعة المصدر والحقول وتعريف الحالات',
        'بناء لوحة صغيرة والتحقق من الحسابات',
      ],
      defer: 'نؤجل إضافة مؤشرات أخرى حتى يُعتمد تعريف المؤشر الأول ومصدره.',
    },
    en: {
      title: 'Start with a dashboard answering one clear question',
      reason:
        'You need clearer numbers and have an initial data source. Define the measure and calculation, then verify it against records.',
      steps: [
        'Choose a clear question and measure',
        'Review the source, fields and statuses',
        'Build a small dashboard and verify its calculations',
      ],
      defer: 'Defer additional metrics until the first definition and source are agreed.',
    },
    gallery: '/dashboard-demos',
  },
};
export const consultingAlternatives = [
  {
    id: 'existing',
    arTitle: 'تحسين الموجود',
    enTitle: 'Improve existing tools',
    priority: 'quick',
    ar: {
      fit: 'لديك برنامج قريب من احتياجك أو مزايا لم تُستخدم بعد.',
      review: 'نراجع الإعدادات والحقول والتقارير وما يسمح البرنامج بتعديله.',
      outputs: ['قائمة إمكانات متاحة ومحدودة', 'تهيئة أو إجراء أوضح ضمن الإمكانات المدعومة'],
      dependency: 'قد تكون القيود في البرنامج نفسه؛ نتحقق منها قبل الوعد بأي تعديل.',
    },
    en: {
      fit: 'Your software is close to the need or has unused capabilities.',
      review: 'Review settings, fields, reports and supported changes.',
      outputs: [
        'Available capabilities and limitations',
        'Configuration or a clearer procedure within supported features',
      ],
      dependency:
        'The limitation may be in the product itself; review it before promising a change.',
    },
  },
  {
    id: 'ready-made',
    arTitle: 'اختيار حل جاهز',
    enTitle: 'Choose a ready-made tool',
    priority: 'options',
    ar: {
      fit: 'الاحتياج شائع ومساره قابل للمواءمة مع برنامج متاح.',
      review: 'نقارن الملاءمة والتصدير والصلاحيات والتكلفة المستمرة قبل الاختيار.',
      outputs: ['قائمة متطلبات ومقارنة مبررة', 'نطاق إعداد وتجربة قبل الاعتماد'],
      dependency: 'الاشتراك وحده لا يثبت الملاءمة؛ نراجع القيود وإمكانية نقل البيانات.',
    },
    en: {
      fit: 'The need is common and the workflow can fit an available product.',
      review: 'Compare fit, export, access and ongoing cost before choosing.',
      outputs: [
        'Requirements and a reasoned comparison',
        'A setup and trial scope before adoption',
      ],
      dependency: 'A subscription does not establish fit; review limitations and data portability.',
    },
  },
  {
    id: 'connect',
    arTitle: 'ربط الأدوات الحالية',
    enTitle: 'Connect existing tools',
    priority: 'repetition',
    ar: {
      fit: 'الأدوات مفيدة لكن نقل البيانات أو المتابعة بينها متكرر.',
      review: 'نحدد الحقول والحدث وشروط الموافقة وإعادة المحاولة ونراجع واجهات الربط.',
      outputs: ['خريطة انتقال البيانات', 'مسار محدود مع فحص الأخطاء ومنع التكرار'],
      dependency: 'التنفيذ يعتمد على واجهات مدعومة وصلاحيات وتكاليف تشغيل متفق عليها.',
    },
    en: {
      fit: 'Useful tools are disconnected and data transfer or follow-up repeats.',
      review: 'Define fields, triggers, approvals and retries, and review supported interfaces.',
      outputs: ['A data flow map', 'A limited flow with failure and duplicate handling'],
      dependency:
        'Implementation depends on supported APIs, permissions and agreed operating costs.',
    },
  },
  {
    id: 'custom',
    arTitle: 'بناء نطاق مخصص',
    enTitle: 'Build a focused custom solution',
    priority: 'specific',
    ar: {
      fit: 'هناك مسار خاص لم تغطه الخيارات الحالية بعد مراجعتها.',
      review: 'نحدد نسخة أولى صغيرة والحقول والأدوار ومعايير التسليم والصيانة.',
      outputs: ['نطاق واضح ومراحل قابلة للاختبار', 'نموذج أولي ثم تنفيذ ومراجعة'],
      dependency: 'نحدد مسؤولية التشغيل والتحديث وملكية المخرجات ضمن الاتفاق.',
    },
    en: {
      fit: 'A specific workflow remains uncovered after existing options are reviewed.',
      review: 'Define a small first version, fields, access, acceptance and maintenance.',
      outputs: [
        'Clear scope and testable stages',
        'A prototype followed by implementation and review',
      ],
      dependency: 'Operation, updates and ownership are defined in the agreement.',
    },
  },
] as const;
export const consultingExamples = [
  {
    id: 'retail',
    arTitle: 'متجر تتوزع استفساراته بين الرسائل',
    enTitle: 'A store with scattered enquiries',
    result: 'website',
    ar: {
      problem: 'معلومات المنتجات متفرقة والاستفسار يصل دون تفاصيل كافية.',
      direction: 'موقع بصفحات واضحة ونموذج يجمع احتياج العميل، مع مراجعة قناة المتابعة الحالية.',
      scope: 'الصفحات الأساسية، حقول الاستفسار، ومسار استلامه ومراجعته.',
      defer: 'دفع إلكتروني وتزامن مخزون قبل التحقق من الحاجة والربط.',
    },
    en: {
      problem: 'Product information is scattered and enquiries lack detail.',
      direction:
        'A focused website and enquiry form, with a review of the current follow-up channel.',
      scope: 'Core pages, enquiry fields, and a receipt and review flow.',
      defer: 'Online payment and stock synchronisation before checking need and integration.',
    },
  },
  {
    id: 'workshop',
    arTitle: 'ورشة تتابع المواصفات في محادثات متعددة',
    enTitle: 'A workshop tracking specifications across chats',
    result: 'work-system',
    ar: {
      problem: 'المقاسات والتعديلات وموعد التسليم موزعة بين ملفات ومحادثات.',
      direction: 'سجل أوامر بسيط أو تهيئة أداة مناسبة بعد مقارنة الخيارات.',
      scope: 'رقم أمر، مواصفات، حالات متفق عليها، موعد وملاحظات.',
      defer: 'إدارة شاملة للمصنع أو مشتريات ومحاسبة ضمن النسخة الأولى.',
    },
    en: {
      problem: 'Dimensions, changes and delivery dates are split across files and chats.',
      direction: 'A simple job register or suitable tool configuration after comparing options.',
      scope: 'Job ID, specification, agreed stages, due date and notes.',
      defer: 'Full factory, purchasing or accounting management in the first version.',
    },
  },
  {
    id: 'services',
    arTitle: 'مكتب خدمات يعيد نقل الطلبات يدويًا',
    enTitle: 'A service office re-entering requests',
    result: 'automation',
    ar: {
      problem: 'تُنقل بيانات الطلب من نموذج إلى سجل وتُكتب رسالة متابعة كل مرة.',
      direction: 'مراجعة بنية السجل وواجهة البرنامج، ثم ربط خطوة واحدة بمراجعة وموافقة.',
      scope: 'حقول محددة، منع تكرار الحدث، وسجل نتيجة وإعادة محاولة.',
      defer: 'تشغيل رسائل أو إجراءات خارجية قبل اعتماد الحسابات والصلاحيات.',
    },
    en: {
      problem: 'Request details are copied from a form to a register and a follow-up is rewritten.',
      direction:
        'Review record structure and the software interface, then connect one reviewed step.',
      scope: 'Defined fields, duplicate protection, outcome history and retry.',
      defer: 'External messages or actions before accounts and permissions are approved.',
    },
  },
] as const;
export const consultingCopy = {
  ar: {
    serviceTitle: 'الاستشارات التقنية',
    title: 'اختر الخطوة التقنية المناسبة لأعمالك',
    intro:
      'نساعدك على فهم احتياجك، ومقارنة الخيارات، وتحديد ما يستحق التنفيذ أولًا، بخطة واضحة تناسب حجم منشأتك وطريقة عملها.',
    seoDescription:
      'استشارات تقنية للمنشآت الصغيرة والمتوسطة: فهم الاحتياج ومقارنة الخيارات وتحديد نطاق وخطوات عملية، مع أدوات تفاعلية ونماذج توضيحية.',
  },
  en: {
    serviceTitle: 'Technology Consulting',
    title: 'Choose the right next step for your business',
    intro:
      'We help you understand the need, compare options and decide what is worth doing first, with a clear plan suited to your business and workflow.',
    seoDescription:
      'Technology consulting for small and medium businesses: clarify needs, compare options and scope practical next steps, with interactive guides and illustrative examples.',
  },
};
export const consultingFaq = {
  ar: [
    {
      question: 'هل نحتاج إلى بناء نظام مخصص دائمًا؟',
      answer:
        'قد تكفي تهيئة أداة موجودة أو اختيار حل جاهز أو تنظيم إجراء بسيط. نراجع هذه الخيارات قبل تحديد ما يحتاج إلى بناء.',
    },
    {
      question: 'ما المعلومات المفيدة لبدء الاستشارة؟',
      answer:
        'وصف مختصر لطريقة العمل، والخطوة التي تريد تحسينها، وأسماء البرامج أو الملفات المستخدمة، ومن يستخدمها، وأي قيود مهمة.',
    },
    {
      question: 'هل نتيجة أداة «من أين أبدأ؟» قرار نهائي؟',
      answer:
        'هي اقتراح تمهيدي من اختياراتك بقواعد واضحة. نراجع الأدوات والبيانات والتفاصيل معك قبل اعتماد خيار أو نطاق أو تكلفة.',
    },
    {
      question: 'هل تشمل الاستشارة التنفيذ؟',
      answer:
        'نحدد مخرجات الاستشارة ونطاقها أولًا. إذا احتجت إلى تنفيذ، نتفق على نطاقه ومراحله ومعايير تسليمه بشكل واضح.',
    },
    {
      question: 'هل يمكن البدء بتحسين برنامج موجود؟',
      answer:
        'نراجع الإمكانات المتاحة وما يسمح به البرنامج من تهيئة أو ربط. يتوقف التعديل على المعلومات والصلاحيات والواجهات المدعومة.',
    },
    {
      question: 'كيف نحدد التكلفة والجدول؟',
      answer:
        'بعد فهم المتطلبات ومصدر البيانات والربط المطلوب والأولويات، نحدد نطاقًا قابلًا للمراجعة ونناقش تكلفة التنفيذ والتشغيل والصيانة ومراحله.',
    },
  ],
  en: [
    {
      question: 'Do we always need a custom system?',
      answer:
        'Existing configuration, a ready-made tool or a clearer procedure may be enough. We review these options before deciding what needs building.',
    },
    {
      question: 'What information helps us start?',
      answer:
        'A short description of the workflow, the step to improve, current software or files, users and important constraints.',
    },
    {
      question: 'Is the guide’s result a final decision?',
      answer:
        'It is an initial rule-based suggestion from your choices. Tools, data and details need review before an option, scope or cost is agreed.',
    },
    {
      question: 'Does consulting include implementation?',
      answer:
        'We define consulting outputs and scope first. If implementation is needed, its scope, stages and acceptance criteria are agreed clearly.',
    },
    {
      question: 'Can we start by improving existing software?',
      answer:
        'We review available configuration and integration capabilities. Changes depend on the information, permissions and supported interfaces.',
    },
    {
      question: 'How are cost and timing agreed?',
      answer:
        'After reviewing requirements, data sources, integration needs and priorities, we define a reviewable scope and discuss implementation, operation, maintenance and stages.',
    },
  ],
};
