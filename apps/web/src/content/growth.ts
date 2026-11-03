export type GrowthLocale = 'ar' | 'en';
export const growthSectors = [
  {
    slug: 'professional-services',
    accent: 'teal',
    demo: '/work-systems/maintenance',
    design: '/website-designs/business-services',
    ar: {
      title: 'طلبات أوضح. متابعة أسهل. لخدماتك اليومية.',
      name: 'شركات الخدمات والمكاتب المهنية',
      intro:
        'نساعدك على تقديم خدماتك واستقبال الاستفسارات ومتابعة الطلبات والمواعيد في مسار يناسب طريقة عمل منشأتك.',
      problem: 'هل تصل الطلبات من أكثر من مكان؟',
      problems: [
        'رسائل يصعب الرجوع إليها عند متابعة العميل.',
        'مواعيد وملاحظات موزعة بين الملفات والمحادثات.',
        'غياب رؤية واضحة لما ينتظر الرد أو التنفيذ.',
      ],
      outcome: 'نبدأ بمسار واحد يمكن تجربته',
      deliverables: [
        'موقع عربي واضح يعرض خدماتك ومجالات عملك ووسائل التواصل.',
        'نموذج يجمع المعلومات اللازمة لبدء الطلب، دون تعقيد.',
        'لوحة متابعة بحالات محددة، وصلاحيات تناسب المستخدمين.',
        'تسليم موثق وشرح الاستخدام ونطاق دعم نتفق عليه.',
      ],
      connections:
        'يمكن دراسة الربط بالبريد والتقويم والمحاسبة إذا كانت الأدوات تتيح واجهات مناسبة. ربط WhatsApp الآلي يتطلب حسابًا وتجهيزات ورسومًا بحسب المزود؛ لا يدخل تلقائيًا في كل مشروع.',
      boundary:
        'نتفق أولًا على عدد المستخدمين ومسار الطلب والبيانات المطلوبة. الأنظمة المحاسبية الكاملة والربط التنظيمي والتشغيل الميداني تحتاج نطاقًا مستقلًا.',
      example:
        'مثال توضيحي: طلب صيانة يبدأ بنموذج، ثم موعد، ثم متابعة الحالة حتى الإغلاق. يمكن تكييف الفكرة لأنشطة أخرى بعد فهم احتياجها.',
    },
    en: {
      title: 'Clear requests. Easier follow-up. Built around your service.',
      name: 'Service businesses & professional offices',
      intro:
        'We help you present your services, receive enquiries and organise requests and appointments around how your business actually works.',
      problem: 'Do requests arrive in too many places?',
      problems: [
        'Messages that are difficult to find during follow-up.',
        'Appointments and notes spread across files and conversations.',
        'No clear view of what needs a reply or action.',
      ],
      outcome: 'Start with one workflow you can try',
      deliverables: [
        'An Arabic-first website explaining your services and contact options.',
        'An enquiry form that collects the essentials without unnecessary steps.',
        'A request board with agreed stages and appropriate access permissions.',
        'Documented handover, usage guidance and an agreed support scope.',
      ],
      connections:
        'Email, calendar and accounting integrations can be assessed when supported APIs are available. Automated WhatsApp integration needs provider setup and may incur fees; it is not included automatically.',
      boundary:
        'We agree the users, workflow and data requirements first. Full accounting platforms, regulatory integrations and on-site operations require separate scoping.',
      example:
        'Illustrative example: a maintenance request moves from intake to an appointment, status updates and closure. Other workflows can be adapted after discovery.',
    },
  },
  {
    slug: 'small-retail',
    accent: 'orange',
    demo: '/work-systems/inventory',
    design: '/website-designs/retail-store',
    ar: {
      title: 'منتجاتك أقرب لعملائك. وطلباتك تحت المتابعة.',
      name: 'المتاجر والأنشطة التجارية الصغيرة',
      intro:
        'نساعدك على عرض منتجاتك وتنظيم الاستفسارات والطلبات، ثم نضيف البيع أو متابعة المخزون بحسب حاجتك الفعلية.',
      problem: 'هل تضيع التفاصيل بين البيع والمتابعة؟',
      problems: [
        'العميل يسأل مرارًا عن السعر والمواصفات والتوفر.',
        'طلبات تحتاج إعادة كتابة في أكثر من ملف.',
        'صعوبة معرفة الأصناف التي تحتاج إلى إعادة طلب.',
      ],
      outcome: 'كتالوج واضح، ثم تشغيل على مراحل',
      deliverables: [
        'كتالوج متجاوب بصفحات منتجات وصور وتصنيفات واضحة.',
        'مسار للاستفسار أو طلب عرض سعر، أو سلة شراء ضمن النطاق.',
        'لوحة لمتابعة الطلبات أو الأصناف والمخزون حسب الاتفاق.',
        'إعدادات أساسية للبحث والقياس وشرح إدارة المحتوى.',
      ],
      connections:
        'يمكن دراسة بوابات الدفع والشحن وبرامج المخزون وفق بلد النشاط ومزودي الخدمة وواجهاتهم. حسابات التجار والموافقات والرسوم مسؤوليات نتفق عليها قبل التنفيذ.',
      boundary:
        'لا نعتبر نموذج المتجر متجرًا جاهزًا لقبول المدفوعات. تفعيل البيع الحقيقي يحتاج سياسات المتجر والضرائب والشحن والدفع واختبارات التشغيل. الفوترة النظامية تحتاج تحققًا منفصلًا لكل بلد.',
      example:
        'مثال توضيحي: عميل يتصفح منتجًا، يرسل طلبه، ثم يظهر الطلب في لوحة المتابعة. وتُضاف تنبيهات المخزون إذا كانت البيانات موثوقة.',
    },
    en: {
      title: 'Bring products closer to customers. Keep orders in view.',
      name: 'Small retailers & trading businesses',
      intro:
        'We help you showcase products and organise enquiries and orders, then add selling or inventory workflows around your actual needs.',
      problem: 'Are details getting lost between selling and follow-up?',
      problems: [
        'Repeated questions about prices, specifications and availability.',
        'Orders retyped into several files.',
        'Limited visibility of items that need replenishing.',
      ],
      outcome: 'A clear catalogue, then phased operations',
      deliverables: [
        'A responsive catalogue with clear product pages and categories.',
        'An enquiry, quotation or shopping-cart flow within the agreed scope.',
        'An order or inventory workspace shaped around your process.',
        'Search and measurement basics, plus content-management guidance.',
      ],
      connections:
        'Payments, shipping and inventory integrations depend on the operating country, provider support and available APIs. Merchant accounts, approvals and fees are agreed before implementation.',
      boundary:
        'A store demo is not a live payment-enabled business. Real selling needs policies, tax, shipping, payment setup and operational testing. Regulatory invoicing requires country-specific assessment.',
      example:
        'Illustrative example: a customer browses a product and submits an order that enters a tracking board. Stock alerts can be added when the underlying data is reliable.',
    },
  },
] as const;
export const growthGuides = [
  {
    slug: 'business-website-cost',
    related: '/business/professional-services',
    ar: {
      title: 'كم يتكلف موقع منشأة صغيرة؟ وما الذي يغيّر السعر؟',
      intro:
        'لا يوجد سعر مفيد قبل تحديد ما يجب أن يفعله الموقع. هذا دليل لتجهيز نطاق واضح ومقارنة عروض التطوير على أساس المخرجات.',
      summary: 'حدّد الهدف والمحتوى ومسار الطلب والربط المطلوب قبل مقارنة الأسعار.',
      sections: [
        [
          'ابدأ بهدف الموقع',
          'هل تريد تعريف العملاء بخدماتك، استقبال طلبات، حجز مواعيد أم بيع منتجات؟ موقع تعريفي بنموذج تواصل يختلف في التنفيذ والتشغيل عن متجر بمدفوعات وشحن. اكتب المهمة الأساسية في جملة واحدة.',
        ],
        [
          'ما العوامل التي تغيّر التكلفة؟',
          'عدد الصفحات وحده لا يكفي. التصميم المخصص، تجهيز النصوص والصور، اللغات، إدارة المحتوى، عدد أنواع المنتجات، الصلاحيات، نقل البيانات والربط الخارجي كلها تؤثر. حدّد ما ستقدمه أنت وما سيُعدّه المنفذ.',
        ],
        [
          'افصل التطوير عن المصروفات المستمرة',
          'اطلب فصل تكلفة التنفيذ عن النطاق والاستضافة والبريد المدفوع وخدمات الرسائل والدفع والصيانة. راجع ما إذا كانت الرسوم شهرية أو سنوية ولمن تتبع الحسابات. لا تقارن عرضين قبل توحيد هذه البنود.',
        ],
        [
          'مثال لنطاق بداية',
          'خمس صفحات تعريفية، لغة عربية، محتوى يقدمه صاحب النشاط، نموذج استفسار، إعداد ظهور أساسي، وتدريب على الإدارة. لا يشمل هذا المثال الدفع الإلكتروني أو ربط المحاسبة أو كتابة المحتوى إلا باتفاق. هذا مثال نطاق وليس تسعيرة ثابتة.',
        ],
        [
          'كيف تقارن عرضين؟',
          'اطلب قائمة مخرجات ومعايير قبول: عمل النموذج، تجربة الهاتف، ملكية الملفات والحسابات، النسخ الاحتياطي، مدة الدعم وما يحدث عند طلب تغيير. السعر الأقل قد يستبعد أعمالًا أساسية؛ والسعر الأعلى يحتاج مخرجات تبرره.',
        ],
        [
          'جهّز هذه المعلومات قبل طلب السعر',
          'أرسل رابط موقعك الحالي إن وجد، هدفك، جمهورك، قائمة الصفحات، مثالين لتصاميم تعجبك، اللغات، الأدوات التي تريد الربط بها، والموعد المطلوب. نراجع المتطلبات ثم نوضح النطاق والمراحل والتكلفة بعد التقييم.',
        ],
      ],
      action: 'لنحدد نطاق موقعك',
    },
    en: {
      title: 'What does a small-business website cost—and what changes the price?',
      intro:
        'A useful estimate starts with what the website needs to do. Use this guide to prepare a clear scope and compare development proposals by their deliverables.',
      summary: 'Define the goal, content, enquiry flow and integrations before comparing prices.',
      sections: [
        [
          'Start with the website’s purpose',
          'Are you introducing services, collecting requests, booking appointments or selling products? An informational website with a contact form differs from a payment and shipping-enabled store. Write the primary task in one sentence.',
        ],
        [
          'Understand the cost drivers',
          'Page count is only one factor. Custom design, copy and imagery, languages, content management, product types, access permissions, data migration and integrations all affect the work. State what you will provide and what needs to be created.',
        ],
        [
          'Separate the build from recurring costs',
          'Ask for development to be separated from domains, hosting, business email, messaging, payment services and maintenance. Check billing periods and account ownership before comparing proposals.',
        ],
        [
          'An example starting scope',
          'Five informational pages, Arabic content supplied by the business, an enquiry form, search basics and management guidance. Payments, accounting integration and copywriting are excluded unless agreed. This is an illustrative scope, not a fixed-price offer.',
        ],
        [
          'Compare deliverables and acceptance criteria',
          'Check form behaviour, mobile usability, file and account ownership, backups, support and change requests. A lower price may exclude essential work; a higher price should explain the additional deliverables.',
        ],
        [
          'Prepare a useful brief',
          'Share your current site if any, goals, audience, pages, two design references, languages, integration tools and preferred timeline. We review these details before proposing scope, phases and cost.',
        ],
      ],
      action: 'Scope your website with us',
    },
  },
  {
    slug: 'when-to-replace-spreadsheets',
    related: '/business/small-retail',
    ar: {
      title: 'متى تحتاج نظامًا مخصصًا بدل Excel؟',
      intro:
        'قد يكون جدول البيانات هو الحل المناسب الآن. القرار يتغير عندما تصبح المتابعة والصلاحيات وتكرار الإدخال عبئًا واضحًا على العمل.',
      summary: 'ابدأ بقياس مشكلة المتابعة، وقارن تحسين الملف ببرنامج جاهز أو نظام مخصص.',
      sections: [
        [
          'متى يبقى Excel مناسبًا؟',
          'عندما يكون عدد المستخدمين محدودًا، والبيانات بسيطة، والمسؤوليات واضحة، ولا توجد حاجة إلى تحديثات متزامنة أو صلاحيات دقيقة. تحسين القوالب والتحقق من الإدخال قد يكفي دون بناء نظام جديد.',
        ],
        [
          'علامات تستحق المراجعة',
          'نسخ متعددة من الملف، تكرار إدخال الطلب نفسه، تعديل بيانات دون معرفة من غيّرها، وصعوبة تتبع الحالة أو إعطاء كل مستخدم وصولًا مناسبًا. سجّل أمثلة واقعية بدل الاكتفاء بأن العمل متعب.',
        ],
        [
          'قارن ثلاثة مسارات',
          'الأول تحسين الملف الحالي؛ الثاني تهيئة برنامج جاهز؛ الثالث بناء نظام مخصص لمسار لا تغطيه الأدوات المناسبة. قارن الكلفة المستمرة، تصدير البيانات، التكامل، الصلاحيات والاعتماد على المزود. ليس كل احتياج مبررًا للتطوير المخصص.',
        ],
        [
          'مثال لمسار طلبات',
          'سجّل الطلب مرة واحدة، عيّن المسؤول، انقله بين حالات متفق عليها، ثم تابع المتأخر. يمكن تجربة هذا المسار ببيانات توضيحية قبل اتخاذ قرار. لا يعني نجاح النموذج أن نقل جميع البيانات والربط الخارجي أصبح جاهزًا.',
        ],
        [
          'كيف تبدأ دون مخاطرة انتقال كبيرة؟',
          'اختر مسارًا واحدًا، نظّف عينة بيانات، حدّد المستخدمين ومعايير القبول، وجرّب نسخة محدودة. احتفظ بتصدير ونسخة احتياطية وخطة رجوع قبل الانتقال الفعلي.',
        ],
        [
          'ما الذي نحتاجه للتقييم؟',
          'صف المشكلة، عدد المستخدمين، حجم البيانات التقريبي، خطوات الطلب والأدوات المستخدمة. شارك ملفًا منزوع البيانات الشخصية عند الحاجة، ولا ترسل بيانات عملاء حساسة في طلب التواصل الأول.',
        ],
      ],
      action: 'ناقش مسار عملك معنا',
    },
    en: {
      title: 'When do you need a custom system instead of Excel?',
      intro:
        'A spreadsheet may still be the right solution. The decision changes when follow-up, access control and repeated data entry become a clear operational burden.',
      summary:
        'Define the follow-up problem and compare a better spreadsheet with off-the-shelf or custom software.',
      sections: [
        [
          'When spreadsheets still work',
          'A small number of users, simple data and clear ownership may not justify new software. Better templates and validation can solve the problem when concurrent updates and granular access controls are unnecessary.',
        ],
        [
          'Signals worth reviewing',
          'Multiple file versions, the same request retyped repeatedly, unclear change history and difficult status or access management are useful signals. Record actual examples rather than relying on a general sense of frustration.',
        ],
        [
          'Compare three routes',
          'Improve the existing spreadsheet, configure suitable off-the-shelf software, or build a custom workflow where appropriate tools do not fit. Compare recurring costs, data export, integrations, permissions and provider dependence.',
        ],
        [
          'A request-tracking example',
          'Capture a request once, assign an owner, move it through agreed stages and review overdue work. Try the flow with sample data first. A working demo does not mean migration and integrations are production-ready.',
        ],
        [
          'Start with a limited transition',
          'Choose one workflow, clean a data sample, agree users and acceptance criteria, and trial a limited version. Keep exports, backups and a rollback plan before an actual migration.',
        ],
        [
          'Prepare for an assessment',
          'Describe the issue, user count, approximate data volume, workflow and existing tools. Use anonymised files when needed and avoid sending sensitive customer data in an initial enquiry.',
        ],
      ],
      action: 'Discuss your workflow',
    },
  },
] as const;
export const growthFilms = [
  {
    id: 'website',
    path: '/website-designs/business-services',
    ar: {
      title: 'من زيارة الموقع إلى استفسار واضح',
      steps: ['اعرض خدماتك', 'وضّح طريقة العمل', 'استقبل استفسارًا'],
      description: 'عرض توضيحي لمسار موقع خدمات. جرّب التصميم وتعرّف إلى الصفحات الممكنة.',
    },
    en: {
      title: 'From a website visit to a clear enquiry',
      steps: ['Present services', 'Explain the process', 'Receive an enquiry'],
      description: 'An illustrative service-website flow. Explore the design and possible pages.',
    },
  },
  {
    id: 'requests',
    path: '/work-systems/maintenance',
    ar: {
      title: 'طلب واحد. ومسار متابعة واضح.',
      steps: ['طلب جديد', 'تعيين ومتابعة', 'إغلاق موثّق'],
      description: 'عرض توضيحي لفكرة متابعة طلبات الخدمة. البيانات والعلامة داخل النموذج تجريبية.',
    },
    en: {
      title: 'One request. A clear follow-up flow.',
      steps: ['New request', 'Assign and follow up', 'Document closure'],
      description: 'An illustrative service-request workflow using fictional records and branding.',
    },
  },
  {
    id: 'automation',
    path: '/automation-demos/lead-capture',
    ar: {
      title: 'إدخال أقل. وخطوات مترابطة.',
      steps: ['استقبال الاستفسار', 'فحص البيانات', 'تجهيز المتابعة'],
      description:
        'محاكاة لمسار أتمتة، وليست ربطًا حيًا. الربط الحقيقي يُقيّم وفق الأدوات والصلاحيات.',
    },
    en: {
      title: 'Less retyping. Connected steps.',
      steps: ['Receive enquiry', 'Check the data', 'Prepare follow-up'],
      description:
        'A simulated automation flow, not a live integration. Real connections depend on tools and permissions.',
    },
  },
  {
    id: 'dashboard',
    path: '/dashboard-demos/sales',
    ar: {
      title: 'من بيانات متفرقة إلى قراءة أوضح',
      steps: ['اختيار البيانات', 'تصفية العرض', 'مراجعة المؤشرات'],
      description: 'عرض توضيحي للوحة مبيعات ببيانات تجريبية، دون ادعاء نتائج فعلية.',
    },
    en: {
      title: 'From scattered data to a clearer view',
      steps: ['Choose the data', 'Filter the view', 'Review indicators'],
      description:
        'An illustrative sales dashboard using sample data, without claims of actual business results.',
    },
  },
] as const;
export const growthPaths = [
  ...growthSectors.map((item) => `/business/${item.slug}`),
  ...growthGuides.map((item) => `/guides/${item.slug}`),
  '/showroom',
];
