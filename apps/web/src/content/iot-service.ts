export type IotLocale = 'ar' | 'en';
export const iotCopy = {
  ar: {
    serviceTitle: 'الأنظمة المدمجة وإنترنت الأشياء',
    seoDescription:
      'نساعد المنشآت الصغيرة والمتوسطة على تقييم ربط أجهزة متوافقة وقراءات مستشعرات بلوحات متابعة وتنبيهات محددة، بدءًا من نموذج محدود واختبار واضح.',
    title: 'من قراءة جهاز إلى متابعة أوضح',
    intro:
      'نساعدك على فهم ما يحدث في موقعك من خلال بيانات الأجهزة والمستشعرات. نراجع التوافق والاتصال، ثم نبدأ بقراءة محددة ولوحة متابعة يمكن تجربتها قبل التوسع.',
    services: [
      {
        title: 'تقييم الاحتياج والتوافق',
        body: 'نحدد ما تريد قياسه وما القرار الذي تدعمه القراءة، ونراجع الأجهزة والواجهات والاتصال المتاح.',
        items: [
          'مصدر القراءة وتنسيقها ووحدتها',
          'الاتصال والطاقة وحقوق الوصول',
          'نطاق أولي ومعيار قبول',
        ],
        output: 'خريطة احتياج واعتماديات واضحة',
      },
      {
        title: 'نموذج إثبات فكرة محدود',
        body: 'نختبر مسارًا صغيرًا بجهاز متوافق أو بيانات تجريبية قبل اعتماد شراء مكونات أو توسيع النطاق.',
        items: [
          'قراءة واحدة ومسار بيانات واضح',
          'تجربة النجاح والفشل والانقطاع',
          'مراجعة النتيجة مقابل الهدف',
        ],
        output: 'نموذج قابل للمراجعة وقرار متابعة',
      },
      {
        title: 'ربط مستشعرات وأجهزة جاهزة',
        body: 'نراجع طريقة القراءة عبر الواجهات التي يدعمها الجهاز، ونحدد إعدادات الاتصال ومطابقة الحقول.',
        items: [
          'تعريف الجهاز ومصدر القراءة',
          'تحقق من القيمة والوحدة والوقت',
          'تسجيل حالات فشل الاتصال',
        ],
        output: 'ربط محدود موثق وفق التوافق',
      },
      {
        title: 'واجهات ولوحات متابعة',
        body: 'نرتب القراءات والحالات في واجهة مناسبة للمستخدم، مع تمييز البيانات الحديثة والمتقادمة.',
        items: ['آخر قراءة ومصدرها ووقتها', 'سجل مختصر وحالة الاتصال', 'صلاحيات عرض بحسب الحاجة'],
        output: 'واجهة يمكن تتبع بياناتها إلى المصدر',
      },
      {
        title: 'قواعد تنبيه وربط إجراءات',
        body: 'نحدد شروط التنبيه والمراجعة، ويمكن دراسة ربط النتيجة بسجل طلب أو قناة معتمدة.',
        items: [
          'حدود وقواعد متفق عليها',
          'منع التكرار ومراجعة الاستثناءات',
          'موافقات وقنوات إرسال محددة',
        ],
        output: 'قواعد قابلة للاختبار ومسؤولية متابعة',
      },
      {
        title: 'اختبار وتسليم ومتابعة',
        body: 'نختبر البيانات والانقطاع والاستعادة، ونوضح الإعدادات ومسؤوليات التشغيل والصيانة.',
        items: [
          'اختبارات ببيانات وعينات مناسبة',
          'توثيق الإعدادات وطريقة الاستخدام',
          'اتفاق متابعة وتغييرات ضمن نطاق',
        ],
        output: 'قائمة فحص ودليل تشغيل واضح',
      },
    ],
    layers: [
      ['الجهاز والمستشعر', 'نراجع القيمة والوحدة والدقة المطلوبة ومصدر الوقت وطريقة توفير الطاقة.'],
      [
        'الاتصال والبوابة',
        'نحدد طريقة الوصول المتاحة وتوافقها مع الشبكة، وخطة التعامل مع الانقطاع.',
      ],
      ['التحقق والسجل', 'نفحص القيم ووقت القراءة ونميز التكرار والبيانات القديمة قبل عرضها.'],
      ['المتابعة والإجراء', 'نعرض الحالة للمستخدم ونحدد قواعد المراجعة والتنبيه والتكامل المسموح.'],
    ],
    examples: [
      {
        id: 'temperature',
        title: 'متابعة بيئة غرفة معدات',
        body: 'قراءة درجة حرارة توضيحية تساعد على فهم الانتقال من المستشعر إلى الحالة المعروضة.',
        scope: 'جهاز واحد، قراءة محددة، وواجهة متابعة.',
        checks: 'تجربة قراءة صحيحة وأخرى متقادمة وحالة انقطاع.',
        boundary: 'القيم والحدود للتوضيح؛ المعايرة ومواصفات المكان تحدد قبل الاستخدام الفعلي.',
      },
      {
        id: 'moisture',
        title: 'قراءة رطوبة تربة نسبية',
        body: 'عرض مؤشر مستشعر تجريبي وتمييز انخفاضه عن حد يحدده المستخدم.',
        scope: 'مصدر قراءة ومؤشر نسبي وسجل حالات.',
        checks: 'التحقق من نطاق القيمة وتغيّر الحد وأثر تقادم القراءة.',
        boundary: 'لا تتصل المحاكاة بمضخة أو نظام ري، ولا تحدد احتياج محصول فعلي.',
      },
      {
        id: 'tank',
        title: 'عرض مستوى خزان',
        body: 'تمثيل مستوى نسبي تجريبي مع حالة واضحة عند انخفاضه عن حد المراجعة.',
        scope: 'قراءة مستوى وعمرها وحد تنبيه.',
        checks: 'اختبار قيمة خارج النطاق وانقطاع المصدر وقراءة حديثة.',
        boundary: 'المحاكاة لا ترسل أوامر تشغيل؛ متطلبات التركيب والتحكم تحدد بصورة مستقلة.',
      },
    ],
    phases: [
      [
        'نفهم ما تريد قياسه',
        'نحدد الاستخدام والمستخدم والأجهزة ومصدر القراءة.',
        'ملخص احتياج وقيود',
      ],
      ['نختبر الفكرة', 'نجرب قراءة ومسارًا محدودًا للتحقق من التوافق.', 'نتيجة تجربة وقرار بداية'],
      ['نصمم مسار البيانات', 'نرتب الحقول والوقت والصلاحيات وطريقة العرض.', 'تصميم وخطة اختبار'],
      [
        'نبني ونراجع',
        'ننفذ النطاق ونجرب الفشل والانقطاع والبيانات الناقصة.',
        'نسخة مجرّبة وسجل ملاحظات',
      ],
      [
        'نربط ونشغّل نطاقًا محدودًا',
        'نتحقق من الإعدادات والقراءات في البيئة المتفق عليها قبل الاعتماد.',
        'قائمة فحص واعتماد تشغيل',
      ],
      [
        'نسلّم ونحدد المتابعة',
        'نوثق الاستخدام والمسؤوليات والصيانة والخطوة التالية.',
        'دليل واتفاق متابعة',
      ],
    ],
    faq: [
      {
        question: 'هل أحتاج إلى شراء أجهزة جديدة؟',
        answer:
          'نراجع الأجهزة المتاحة وواجهاتها وجودة القراءة أولًا. قد تكفي مكونات قائمة أو تجربة ببيانات محاكاة، ولا نحدد الشراء قبل وضوح التوافق والنطاق.',
      },
      {
        question: 'هل يمكن ربط أي مستشعر أو بروتوكول؟',
        answer:
          'يعتمد ذلك على مواصفات الجهاز وواجهاته وصلاحيات الوصول والشبكة والطاقة. يمكن مراجعة خيارات مثل HTTP أو MQTT عندما تكون متاحة، دون افتراض توافق أي جهاز تلقائيًا.',
      },
      {
        question: 'هل المحاكي متصل بأجهزة حقيقية؟',
        answer:
          'لا. القيم والحدود وسجل القراءات توضيحية وتعمل داخل الصفحة. لا تُرسل رسائل أو أوامر إلى أجهزة. التطبيق الفعلي يحتاج إعدادًا واختبارًا واعتمادًا منفصلًا.',
      },
      {
        question: 'هل تشمل الخدمة تصنيع أجهزة أو تركيبها ميدانيًا؟',
        answer:
          'نحدد ذلك قبل الاتفاق، ونوضح مسؤولية توفير المكونات والتركيب والكهرباء والمعايرة والصيانة. البداية المقترحة تركز على قراءة وربط برمجي محدود باستخدام أجهزة متوافقة، ولا تعني تصنيعًا أو اعتمادًا صناعيًا شاملًا.',
      },
      {
        question: 'كيف نحدد التكلفة والمرحلة الأولى؟',
        answer:
          'نراجع عدد الأجهزة ونوع القراءة ودوريتها والاتصال والواجهات والبيانات والتنبيهات. نفصل تنفيذ البرنامج عن المكونات والاتصال والاستضافة والمتابعة ونحدد المخرجات قبل التنفيذ.',
      },
    ],
  },
  en: {
    serviceTitle: 'Embedded Systems and IoT',
    seoDescription:
      'Assess compatible devices and sensor readings for a focused dashboard and notification flow. A practical starting point for small and medium businesses with a limited prototype and clear tests.',
    title: 'Turn device readings into clearer follow-up',
    intro:
      'We help make device and sensor data understandable for your business. Review compatibility and connectivity, then start with a defined reading and a dashboard you can try before expanding.',
    services: [
      {
        title: 'Assess needs and compatibility',
        body: 'Define what to measure and which decision the reading supports, then review devices, interfaces and connectivity.',
        items: [
          'Reading source, format and unit',
          'Connectivity, power and access rights',
          'Initial scope and acceptance criteria',
        ],
        output: 'A clear needs and dependency map',
      },
      {
        title: 'Build a limited proof of concept',
        body: 'Test a small flow with a compatible device or simulated data before approving components or expanding the scope.',
        items: [
          'One defined reading and data path',
          'Success, failure and offline trials',
          'Review results against the goal',
        ],
        output: 'A reviewable prototype and next-step decision',
      },
      {
        title: 'Connect ready-made devices',
        body: 'Review the device’s supported interfaces, then define connection settings and field mapping.',
        items: [
          'Device identity and reading source',
          'Validate value, unit and time',
          'Record connection failures',
        ],
        output: 'A documented connection within confirmed compatibility',
      },
      {
        title: 'Build monitoring interfaces',
        body: 'Organise readings and statuses for the user, clearly separating fresh and outdated data.',
        items: [
          'Latest reading, source and time',
          'A short history and connection status',
          'View permissions as needed',
        ],
        output: 'An interface with data traceable to its source',
      },
      {
        title: 'Define alerts and handoffs',
        body: 'Agree review and alert conditions, then assess a handoff to a request register or an authorised channel.',
        items: [
          'Agreed thresholds and rules',
          'Duplicate prevention and exceptions',
          'Defined approvals and sending channels',
        ],
        output: 'Testable rules and follow-up ownership',
      },
      {
        title: 'Test, hand over and review',
        body: 'Test readings, disconnection and recovery, and explain setup, operation and maintenance responsibilities.',
        items: [
          'Tests with suitable data and samples',
          'Setup and usage documentation',
          'Scoped maintenance and change agreement',
        ],
        output: 'A checklist and clear operating guidance',
      },
    ],
    layers: [
      [
        'Device and sensor',
        'Review the value, unit, required precision, time source and power arrangements.',
      ],
      [
        'Connection and gateway',
        'Identify available access, network compatibility and disconnection handling.',
      ],
      [
        'Validation and record',
        'Check values and timestamps and distinguish duplicates and old data before display.',
      ],
      [
        'Monitoring and action',
        'Show the status and define allowed review rules, notifications and integrations.',
      ],
    ],
    examples: [
      {
        id: 'temperature',
        title: 'Equipment-room conditions',
        body: 'An illustrative temperature reading shows the path from a sensor value to a displayed status.',
        scope: 'One device, a defined reading and a monitoring view.',
        checks: 'Try valid, outdated and disconnected readings.',
        boundary:
          'Values and thresholds are illustrative; calibration and site requirements are defined before live use.',
      },
      {
        id: 'moisture',
        title: 'Relative soil-moisture readings',
        body: 'Show a simulated sensor index and distinguish a value below a user-defined threshold.',
        scope: 'A reading source, relative index and status history.',
        checks: 'Validate range, threshold changes and outdated readings.',
        boundary:
          'The simulator does not connect to irrigation equipment or determine a real crop’s needs.',
      },
      {
        id: 'tank',
        title: 'Tank level visibility',
        body: 'Represent an illustrative relative level and show when it falls below a review threshold.',
        scope: 'A level reading, its age and an alert threshold.',
        checks: 'Try an out-of-range value, a disconnected source and a fresh reading.',
        boundary:
          'The simulator sends no control commands; installation and control requirements are scoped separately.',
      },
    ],
    phases: [
      [
        'Define what to measure',
        'Clarify the use case, user, devices and reading source.',
        'A needs and constraints brief',
      ],
      [
        'Try the concept',
        'Test one reading and a limited path to check compatibility.',
        'Trial results and a starting decision',
      ],
      [
        'Design the data path',
        'Map fields, time, permissions and the display.',
        'A design and test plan',
      ],
      [
        'Build and review',
        'Implement the scope and test failures, disconnection and missing data.',
        'A tested version and review notes',
      ],
      [
        'Connect and launch a limited scope',
        'Check setup and readings in the agreed environment before approval.',
        'A launch checklist and approval',
      ],
      [
        'Hand over and define follow-up',
        'Document usage, ownership, maintenance and the next step.',
        'A guide and follow-up agreement',
      ],
    ],
    faq: [
      {
        question: 'Do I need new hardware?',
        answer:
          'Review existing devices, interfaces and reading quality first. Existing components or simulated data may be enough for a trial; purchasing is not defined before compatibility and scope are clear.',
      },
      {
        question: 'Can any sensor or protocol be connected?',
        answer:
          'This depends on device specifications, interfaces, permissions, network and power. Options such as HTTP or MQTT can be reviewed where available; compatibility is never assumed for every device.',
      },
      {
        question: 'Is the simulator connected to real devices?',
        answer:
          'No. Values, thresholds and reading history are illustrative and work inside the page. No messages or device commands are sent. Live operation requires separate setup, tests and approval.',
      },
      {
        question: 'Does this include manufacturing or on-site installation?',
        answer:
          'Agree this before delivery, clarifying ownership of components, installation, electrical work, calibration and maintenance. The proposed starting point is a limited software reading and integration using compatible devices, not comprehensive manufacturing or industrial certification.',
      },
      {
        question: 'How are cost and the first stage defined?',
        answer:
          'Review device count, readings, frequency, connectivity, interfaces, data and alerts. Separate software delivery from hardware, connectivity, hosting and follow-up, with outputs agreed before implementation.',
      },
    ],
  },
};
export const iotScenarios = [
  {
    id: 'temperature',
    min: -20,
    max: 70,
    initial: 24,
    threshold: 30,
    direction: 'above' as const,
    unit: '°C',
    ar: 'درجة حرارة توضيحية',
    en: 'Illustrative temperature',
  },
  {
    id: 'moisture',
    min: 0,
    max: 100,
    initial: 45,
    threshold: 30,
    direction: 'below' as const,
    unit: '%',
    ar: 'مؤشر رطوبة نسبي',
    en: 'Relative moisture index',
  },
  {
    id: 'tank',
    min: 0,
    max: 100,
    initial: 60,
    threshold: 25,
    direction: 'below' as const,
    unit: '%',
    ar: 'مستوى نسبي توضيحي',
    en: 'Illustrative relative level',
  },
];
