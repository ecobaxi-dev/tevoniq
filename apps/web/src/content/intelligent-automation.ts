export type AutomationServiceLocale = 'ar' | 'en';
export const automationServiceCopy = {
  ar: {
    serviceTitle: 'الأتمتة الذكية وربط الأعمال',
    seoDescription:
      'نربط خطوات العمل المتكررة للمنشآت الصغيرة والمتوسطة، من فهم الاحتياج إلى تجربة محدودة وتشغيل ومراجعة، بنطاق وموافقات واضحة.',
    title: 'أتمتة ذكية تربط خطوات عملك',
    intro:
      'نساعدك على ربط برامجك وتنظيم انتقال الطلبات والبيانات بينها، لتقليل الإدخال المتكرر وتوضيح المتابعة. نبدأ بخطوة محددة، ونختبرها معك قبل التوسع.',
    journey: 'رحلتك نحو الأتمتة مع TEVONIQ',
    stages: [
      {
        id: 'discovery',
        title: 'نفهم طريقة عملك',
        body: 'نرسم مسار الطلب اليوم: من أين يبدأ؟ من يراجعه؟ وأين تتكرر الكتابة أو تتوقف المتابعة؟ نحدد خطوة تستحق التحسين.',
        output: 'خريطة مبسطة للعمل وأولوية أولى',
        tasks: [
          'مراجعة الأدوات والحقول ومصادر البيانات',
          'تحديد المستخدمين ونقاط المراجعة',
          'تقدير تكرار الخطوة وأثر الأخطاء',
        ],
        question: 'ما الخطوة التي تتكرر في عملك يوميًا؟',
      },
      {
        id: 'strategy',
        title: 'نحدد النطاق والخطة',
        body: 'نختار مسارًا أوليًا، ونحدد ما يحدث تلقائيًا وما يحتاج إلى موافقتك. نراجع إمكانات البرامج قبل الاتفاق على الربط.',
        output: 'نطاق أولي ومعايير قبول واعتماديات',
        tasks: [
          'تحديد نقطة البداية والنتيجة المطلوبة',
          'مراجعة واجهات الربط والصلاحيات والتكاليف الخارجية',
          'الاتفاق على الاستثناءات وما يؤجل لمرحلة لاحقة',
        ],
        question: 'ما البرامج التي تريد ربطها وما النتيجة المطلوبة؟',
      },
      {
        id: 'design',
        title: 'نصمم ونبني الربط',
        body: 'نحوّل الخطوات المتفق عليها إلى مسار قابل للتجربة: فحص البيانات، تطبيق القواعد، تجهيز الإجراء وتسجيل النتيجة.',
        output: 'مسار تجريبي يمكن مراجعته',
        tasks: [
          'مطابقة الحقول والتحقق من البيانات',
          'منع التكرار ومعالجة حالات الفشل',
          'إضافة موافقة بشرية عند الحاجة قبل الإرسال أو التعديل',
        ],
        question: 'ما الحقول والقواعد والموافقات المطلوبة؟',
      },
      {
        id: 'deployment',
        title: 'نختبر ثم نشغّل',
        body: 'نختبر الحالات المعتادة والاستثناءات ببيانات مناسبة، ثم نراجع النتيجة معك قبل تشغيل نطاق محدود على الأدوات المعتمدة.',
        output: 'قائمة فحص وتشغيل معتمد وتسليم واضح',
        tasks: [
          'اختبار النجاح والتكرار والبيانات الناقصة',
          'تجربة الفشل وإعادة المحاولة دون تكرار الإجراء',
          'اعتماد الإطلاق وتوثيق الإيقاف والتعامل اليدوي',
        ],
        question: 'من يعتمد التشغيل وما الحالات التي يجب اختبارها؟',
      },
      {
        id: 'optimisation',
        title: 'نراجع ونحسّن',
        body: 'نراجع سجل التشغيل وما بقي من عمل يدوي، ثم نحدد إن كانت الخطوة التالية تحسين المسار أو توسيعه. نتفق على المتابعة والصيانة ضمن نطاق واضح.',
        output: 'مراجعة تشغيل وأولوية التحسين التالية',
        tasks: [
          'متابعة الأخطاء والاستثناءات المسجلة',
          'مقارنة النتيجة بمعايير القبول المتفق عليها',
          'تحديد التعديلات ومسؤوليات وتكلفة المتابعة',
        ],
        question: 'ما الذي تريد متابعته أو تحسينه بعد التشغيل؟',
      },
    ],
    benefits: [
      ['إدخال أقل تكرارًا', 'تنتقل البيانات المعتمدة بين الأدوات بدل نسخها في كل خطوة.'],
      ['متابعة أوضح', 'حالة الطلب ونتيجة الإجراء موثقتان، مع مسار واضح للاستثناءات.'],
      ['قواعد يمكن مراجعتها', 'شروط وموافقات محددة بدل إجراءات يصعب تفسيرها أو تتبعها.'],
      ['بداية قابلة للتوسع', 'نختبر عملية محددة أولًا، ثم نقرر التوسع بناءً على ما يظهر.'],
    ],
    capabilities: [
      [
        'ربط الأدوات والبيانات',
        'نماذج الموقع وسجلات الطلبات والبرامج التي توفر واجهات ربط مناسبة، مع مطابقة الحقول والصلاحيات.',
      ],
      [
        'تنبيهات ومسودات متابعة',
        'تجهيز تذكير أو رد أو تنبيه وفق الحدث والموعد والموافقة، عبر حسابات وقنوات معتمدة.',
      ],
      [
        'مساعدة ذكية عند الحاجة',
        'تلخيص نص أو اقتراح تصنيف قابل للمراجعة، عندما تضيف هذه الخطوة فائدة فعلية. لا تستبدل اعتماد القرارات الحساسة.',
      ],
      [
        'تشغيل قابل للتتبع',
        'فحص البيانات ومنع تكرار الإجراءات وتسجيل النتائج، مع التعامل مع الفشل وخيار متابعة يدوية.',
      ],
    ],
    faq: [
      {
        question: 'هل يمكن ربط أي برنامج؟',
        answer:
          'نراجع أولًا واجهات الربط المتاحة والصلاحيات وحدود الاستخدام وشروط مزوّد البرنامج. قد يحتاج الربط إلى اشتراك أو موافقة، وقد لا يكون متاحًا؛ نوضح ذلك قبل تحديد النطاق.',
      },
      {
        question: 'هل نحتاج إلى تغيير البرامج الحالية؟',
        answer:
          'ليس بالضرورة. نبدأ بمراجعة الأدوات الحالية وما يمكنها تنفيذه، ثم نقترح الربط أو التحسين أو بديلًا مناسبًا بحسب الحاجة.',
      },
      {
        question: 'هل كل أتمتة تحتاج إلى ذكاء اصطناعي؟',
        answer:
          'كثير من الخطوات يكفيها قواعد واضحة. نستخدم المساعدة الذكية في مهام مثل اقتراح تصنيف أو تلخيص نص إذا كانت مفيدة، مع مراجعة المخرجات وتحديد البيانات التي يجوز معالجتها.',
      },
      {
        question: 'هل ترسل النماذج المعروضة رسائل حقيقية؟',
        answer:
          'لا. المحاكيات المعروضة توضيحية وتستخدم بيانات افتراضية. الربط الفعلي يحتاج إعداد الحسابات والصلاحيات والموافقات والاختبار قبل التشغيل.',
      },
      {
        question: 'كيف تُحدد التكلفة والمتابعة؟',
        answer:
          'بعد مراجعة عدد الخطوات والأنظمة والحقول والاستثناءات. نحدد نطاق التنفيذ وتكاليف خدمات الطرف الثالث إن وجدت، ونتفق على المتابعة والصيانة بصورة منفصلة وواضحة.',
      },
    ],
  },
  en: {
    serviceTitle: 'Intelligent Automation and Integration',
    seoDescription:
      'Connect repeated business steps with clear rules and approvals. A scoped journey for small and medium businesses, from discovery to testing, launch and review.',
    title: 'Connect your work with intelligent automation',
    intro:
      'We help connect your tools and organise how requests and data move between them, reducing repeated entry and making follow-up clearer. Start with a defined step and test it before expanding.',
    journey: 'Your automation journey with TEVONIQ',
    stages: [
      {
        id: 'discovery',
        title: 'Understand the workflow',
        body: 'Map how a request works today: where it starts, who reviews it and where entry repeats or follow-up stalls. Identify one worthwhile starting step.',
        output: 'A simple workflow map and first priority',
        tasks: [
          'Review tools, fields and data sources',
          'Identify users and review points',
          'Assess frequency and the impact of errors',
        ],
        question: 'Which step repeats in your everyday work?',
      },
      {
        id: 'strategy',
        title: 'Define the scope and plan',
        body: 'Choose a first flow and define what happens automatically and what needs approval. Review software capabilities before agreeing an integration.',
        output: 'First scope, acceptance criteria and dependencies',
        tasks: [
          'Define the trigger and intended outcome',
          'Review interfaces, permissions and external costs',
          'Agree exceptions and what can wait',
        ],
        question: 'Which tools would you connect, and what outcome do you need?',
      },
      {
        id: 'design',
        title: 'Design and build the flow',
        body: 'Turn agreed steps into a testable flow: validate data, apply rules, prepare the action and record its result.',
        output: 'A working trial flow for review',
        tasks: [
          'Map fields and validate inputs',
          'Prevent duplicates and handle failures',
          'Add human approval before sending or changing data where needed',
        ],
        question: 'Which fields, rules and approvals are needed?',
      },
      {
        id: 'deployment',
        title: 'Test, then launch',
        body: 'Test normal and exception cases with suitable data. Review the results together before a limited launch using approved tools.',
        output: 'A launch checklist, approval and clear handover',
        tasks: [
          'Test success, duplication and missing data',
          'Check failure and retry behaviour without repeating actions',
          'Approve launch and document stopping and manual handling',
        ],
        question: 'Who approves launch and which cases must be tested?',
      },
      {
        id: 'optimisation',
        title: 'Review and improve',
        body: 'Review run history and remaining manual work, then decide whether to refine the flow or expand it. Agree monitoring and maintenance within a clear scope.',
        output: 'A run review and next improvement priority',
        tasks: [
          'Review logged errors and exceptions',
          'Compare results against agreed acceptance criteria',
          'Define changes, responsibilities and ongoing costs',
        ],
        question: 'What would you monitor or improve after launch?',
      },
    ],
    benefits: [
      [
        'Less repeated entry',
        'Move approved data between tools rather than copying it at every step.',
      ],
      [
        'Clearer follow-up',
        'Record request status and action outcomes, with a defined route for exceptions.',
      ],
      [
        'Reviewable rules',
        'Explicit conditions and approvals make actions easier to explain and trace.',
      ],
      [
        'A start you can expand',
        'Test one defined process, then decide whether to expand based on the results.',
      ],
    ],
    capabilities: [
      [
        'Connect tools and data',
        'Website forms, request records and software with suitable interfaces, with field mapping and access controls.',
      ],
      [
        'Prepare follow-up and alerts',
        'Prepare reminders, replies or alerts based on events, dates and approvals using authorised accounts and channels.',
      ],
      [
        'Use AI where it helps',
        'Suggest a classification or summarise text for review when it adds value. Human approval remains part of sensitive decisions.',
      ],
      [
        'Keep actions traceable',
        'Validate data, prevent duplicate actions and record outcomes, with failure handling and a manual fallback.',
      ],
    ],
    faq: [
      {
        question: 'Can any software be connected?',
        answer:
          'We first review available interfaces, permissions, usage limits and provider terms. An integration may need a subscription or approval, or may not be available. We clarify this before scoping.',
      },
      {
        question: 'Do we need to replace our existing tools?',
        answer:
          'Not necessarily. We start by reviewing your current tools and their capabilities, then propose integration, improvement or an appropriate alternative based on the need.',
      },
      {
        question: 'Does every automation need AI?',
        answer:
          'Many steps only need clear rules. AI can help suggest a classification or summarise text when useful, with output review and an agreement on which data may be processed.',
      },
      {
        question: 'Do the demos send real messages?',
        answer:
          'No. The illustrative simulators use fictional data. A live integration requires account setup, permissions, approvals and testing before launch.',
      },
      {
        question: 'How are cost and ongoing support agreed?',
        answer:
          'After reviewing steps, tools, fields and exceptions. We define implementation scope and any third-party service costs, and agree monitoring and maintenance separately.',
      },
    ],
  },
};
