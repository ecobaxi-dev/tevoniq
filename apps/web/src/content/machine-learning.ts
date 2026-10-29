export type MlLocale = 'ar' | 'en';
export const mlCopy = {
  ar: {
    serviceTitle: 'الذكاء الاصطناعي وتعلّم الآلة',
    seoDescription:
      'تطبيقات ذكاء اصطناعي للمنشآت الصغيرة والمتوسطة: مساعد معرفة، فرز طلبات وتقدير احتياج عند توفر البيانات، مع تجربة محددة ومعايير تقييم ومراجعة بشرية.',
    title: 'ذكاء يخدم أعمالك',
    subtitle: 'مهمة محددة. تجربة صغيرة. نتيجة قابلة للقياس.',
    intro:
      'نساعدك على اختيار استخدام مفيد للذكاء الاصطناعي، وتجربته على بيانات مصرح بها، ثم ربطه بطريقة عملك عندما تثبت فائدته. قد يكون الحل نموذجًا جاهزًا أو قواعد بسيطة؛ نراجع الحاجة قبل اقتراح تدريب نموذج جديد.',
    faq: [
      {
        question: 'من أين نبدأ إذا لم تكن لدينا خبرة بالذكاء الاصطناعي؟',
        answer:
          'نختار مهمة متكررة يمكن وصفها وتقييمها، ونراجع البيانات المتاحة ومن سيستخدم المخرج. نبدأ بتجربة صغيرة لها معيار قبول واضح بدل محاولة تغيير العمل كله دفعة واحدة.',
      },
      {
        question: 'هل نحتاج تدريب نموذج من الصفر؟',
        answer:
          'غالبًا لا يكون ذلك نقطة البداية المناسبة لمنشأة صغيرة. نقيّم نموذجًا جاهزًا أو ربط المعرفة أو حتى قواعد عادية أولًا. لا نقترح نموذجًا مخصصًا إلا إذا بررت البيانات والنتائج والتكلفة ذلك.',
      },
      {
        question: 'هل يمكن العمل بالعربية؟',
        answer:
          'نختبر العربية والمصطلحات المستخدمة فعليًا في نشاطك على أمثلة مراجعة. فهم اللهجات والأسماء والوثائق المصورة يختلف بين الأدوات؛ لا نفترض جودة اللغة دون تقييم على الحالات المطلوبة.',
      },
      {
        question: 'ما البيانات التي تحتاجونها؟',
        answer:
          'بحسب المهمة: وثائق معتمدة لمساعد المعرفة، وطلبات مصنفة لفرز الرسائل، وسجلات زمنية متسقة لتقدير الاحتياج. نراجع الإذن والجودة أولًا ونستخدم عينات منزوعة الهوية عندما يكون ذلك مناسبًا.',
      },
      {
        question: 'هل يرسل النظام ردودًا أو ينفذ قرارات تلقائيًا؟',
        answer:
          'نحدد الصلاحيات صراحة. تكون البداية عادة مسودة أو اقتراحًا يراجعه شخص مسؤول. الإرسال أو تعديل السجلات أو تنفيذ قرار يحتاج نطاقًا منفصلًا وإذنًا وسجل متابعة وآلية إيقاف.',
      },
      {
        question: 'كيف تُحسب التكلفة والمتابعة؟',
        answer:
          'نفصل تكلفة التطوير عن استخدام النموذج والاستضافة وخدمات الأطراف الأخرى. نحدد حدود الاستخدام وطريقة التقييم ومسؤولية تحديث المعرفة أو الاختبارات، ثم نتفق على المتابعة. لا نضمن دقة أو وفرًا أو دعمًا دائمًا دون نطاق محدد.',
      },
    ],
  },
  en: {
    serviceTitle: 'AI & Machine Learning',
    seoDescription:
      'Focused AI for small and medium businesses: knowledge assistants, request triage and demand estimates where data supports them, with measurable pilots and human review.',
    title: 'AI that works for your business',
    subtitle: 'One useful task. A small pilot. Measurable evidence.',
    intro:
      'We help select a practical AI use case, test it on authorised data and connect it to your workflow when it proves useful. An existing model or simple rules may be enough; we assess the need before proposing custom model training.',
    faq: [
      {
        question: 'Where do we start without AI experience?',
        answer:
          'Choose a repeated task that can be described and evaluated. Review available data and who will use the output, then start with a focused pilot and clear acceptance criteria.',
      },
      {
        question: 'Do we need to train a model from scratch?',
        answer:
          'That is usually not the right starting point for a small business. We assess existing models, knowledge retrieval or ordinary rules first. Custom training needs sufficient data, evidence and a justified cost.',
      },
      {
        question: 'Can it work in Arabic?',
        answer:
          'We evaluate Arabic and business terminology on reviewed examples. Dialects, names and scanned documents vary by tool, so language quality is tested against the actual required cases.',
      },
      {
        question: 'What data do you need?',
        answer:
          'It depends on the task: approved documents for a knowledge assistant, labelled requests for triage, or consistent dated records for demand estimates. Permission and quality come first, with de-identified samples where appropriate.',
      },
      {
        question: 'Will it send replies or make decisions automatically?',
        answer:
          'Permissions are explicit. The initial output is usually a draft or suggestion reviewed by an accountable person. Sending messages or changing records requires a separate scope, permission, logging and a stop mechanism.',
      },
      {
        question: 'How are costs and maintenance handled?',
        answer:
          'Development is separate from model usage, hosting and third-party fees. We agree usage limits, evaluation, knowledge updates and testing ownership. Accuracy, savings and ongoing support are not assumed or guaranteed.',
      },
    ],
  },
};
export const mlBenefits = [
  {
    ar: [
      'وصول أسهل للمعلومة',
      'مساعدة الموظف في الوصول إلى إجابة من وثائق محددة، مع إظهار المرجع وإمكانية عدم الإجابة.',
    ],
    en: [
      'Find information more easily',
      'Help staff find answers in selected documents, with a source and an option to abstain.',
    ],
  },
  {
    ar: [
      'متابعة أقل تشتتًا',
      'اقتراح تصنيف للطلبات ومسودة متابعة، مع إبقاء المراجعة والإرسال بيد المسؤول.',
    ],
    en: [
      'More focused follow-up',
      'Suggest request categories and draft follow-ups while keeping review and sending under human control.',
    ],
  },
  {
    ar: [
      'تقدير يستند إلى بياناتك',
      'عندما تتوفر سجلات مناسبة، نقارن التقدير بخط أساس بسيط قبل الاعتماد عليه في التخطيط.',
    ],
    en: [
      'Estimates grounded in your records',
      'Where records support it, compare an estimate with a simple baseline before using it for planning.',
    ],
  },
];
export const mlCapabilities = [
  {
    id: 'use-case',
    ar: {
      title: 'اختيار الاستخدام المناسب',
      text: 'نراجع المهمة وتكرارها وبدائلها، ونحدد متى تكون الأتمتة العادية أو الحل الجاهز أنسب.',
      output: 'نطاق تجربة ومعيار قبول ومراجعة جدوى أولية.',
    },
    en: {
      title: 'Choose the right use case',
      text: 'Review the task, frequency and alternatives, including ordinary automation or existing software.',
      output: 'Pilot scope, acceptance criteria and an initial feasibility review.',
    },
  },
  {
    id: 'knowledge',
    ar: {
      title: 'مساعد معرفة من وثائقك',
      text: 'نربط الإجابة بمحتوى معتمد، ونختبر الأسئلة الناقصة أو التي لا توجد لها إجابة.',
      output: 'نموذج أولي بإحالات للمحتوى وحدود وصول واضحة.',
    },
    en: {
      title: 'Knowledge assistants',
      text: 'Ground answers in approved material and test ambiguous questions and missing answers.',
      output: 'A prototype with content references and explicit access boundaries.',
    },
  },
  {
    id: 'language',
    ar: {
      title: 'فهم الطلبات والنصوص',
      text: 'تصنيف رسائل أو استخراج حقول محددة أو تلخيص نصوص، مع مراجعة أمثلة عربية من النشاط.',
      output: 'حقول أو فئات متفق عليها ومجموعة أمثلة للتقييم.',
    },
    en: {
      title: 'Understand requests and text',
      text: 'Classify messages, extract agreed fields or summarise text, evaluated on relevant Arabic examples.',
      output: 'Defined fields or categories and a reviewed evaluation sample.',
    },
  },
  {
    id: 'prediction',
    ar: {
      title: 'تقديرات محددة من السجلات',
      text: 'عند كفاية البيانات، نجرب تقدير احتياج ضيق النطاق ونقارنه بطريقة بسيطة على فترة لم تُستخدم في الإعداد.',
      output: 'مقارنة موثقة وحدود للاستخدام، دون ضمان توقع المستقبل.',
    },
    en: {
      title: 'Focused estimates from records',
      text: 'Where data is sufficient, test a narrow estimate against a simple baseline on a held-out time period.',
      output: 'A documented comparison and usage limits, without guaranteed forecasts.',
    },
  },
  {
    id: 'integration',
    ar: {
      title: 'ربط النتيجة بسير العمل',
      text: 'نعرض الاقتراح في الشاشة المناسبة أو ننشئ مسودة، حسب واجهات الربط والصلاحيات المتاحة.',
      output: 'مسار مراجعة واعتماد مع سجل للأحداث المتفق عليها.',
    },
    en: {
      title: 'Connect output to a workflow',
      text: 'Present a suggestion in the right screen or create a draft, subject to available APIs and permissions.',
      output: 'A review and approval path with agreed event records.',
    },
  },
  {
    id: 'evaluation',
    ar: {
      title: 'التقييم والتحسين',
      text: 'نحدد أمثلة صحيحة وحالات صعبة، ونراجع الأخطاء والتكلفة قبل توسيع الاستخدام.',
      output: 'تقرير تقييم وقائمة حدود وخطة تحديث عند الحاجة.',
    },
    en: {
      title: 'Evaluate and improve',
      text: 'Define reviewed examples and difficult cases, then examine errors and cost before expanding usage.',
      output: 'An evaluation report, known boundaries and an update plan where needed.',
    },
  },
];
export const mlStages = [
  {
    id: 'discover',
    ar: {
      title: 'نفهم المهمة والبيانات',
      text: 'نحدد من سيستخدم المخرج وما القرار الذي يساعده، ونراجع إمكان الوصول وإذن الاستخدام وجودة عينة البيانات.',
      actions: [
        'اختيار مهمة واحدة يمكن تقييمها.',
        'فحص عينة مصرح بها والبدائل المتاحة.',
        'تحديد ما لا يجوز للنظام فعله.',
      ],
      output: 'ملخص حاجة ونطاق أولي ومعايير تقييم ومخاطر معروفة.',
    },
    en: {
      title: 'Understand the task and data',
      text: 'Identify the user, the decision being supported and whether authorised data is accessible and suitable.',
      actions: [
        'Choose one evaluable task.',
        'Review an authorised sample and alternatives.',
        'Define actions the system must not take.',
      ],
      output: 'A brief, initial scope, evaluation criteria and known risks.',
    },
  },
  {
    id: 'prototype',
    ar: {
      title: 'نختبر نموذجًا أوليًا',
      text: 'نختار أبسط نهج مناسب، ونجهز أمثلة للتقييم قبل تجربة النموذج أو ربط المعرفة.',
      actions: [
        'مقارنة نهج جاهز أو قواعد بسيطة.',
        'اختبار العربية والحالات غير الواضحة.',
        'تسجيل الأخطاء والاستخدام والتكلفة التقريبية.',
      ],
      output: 'تجربة صغيرة وتقرير يوضح الاستمرار أو التعديل أو التوقف.',
    },
    en: {
      title: 'Test a small prototype',
      text: 'Choose the simplest suitable approach and prepare evaluation examples before testing a model or retrieval flow.',
      actions: [
        'Compare an existing model or simple rules.',
        'Test Arabic and ambiguous cases.',
        'Record errors, usage and indicative costs.',
      ],
      output: 'A small pilot and evidence to continue, revise or stop.',
    },
  },
  {
    id: 'connect',
    ar: {
      title: 'نربط بعد اعتماد النتيجة',
      text: 'نضيف المخرج إلى مسار العمل ضمن صلاحيات وحدود استخدام، مع إبقاء الاعتماد البشري حيث يلزم.',
      actions: [
        'ربط الشاشة أو واجهة البرنامج المتاحة.',
        'فصل إعدادات الوصول وبيانات التجربة.',
        'تجربة الإيقاف ومعالجة التعثر والتراجع.',
      ],
      output: 'تكامل محدود النطاق وتعليمات تشغيل ومراجعة.',
    },
    en: {
      title: 'Integrate after acceptance',
      text: 'Connect accepted output to the workflow with permissions, usage limits and human approval where needed.',
      actions: [
        'Connect the available screen or API.',
        'Separate access settings and sample records.',
        'Test stopping, failure handling and rollback.',
      ],
      output: 'A focused integration with run and review instructions.',
    },
  },
  {
    id: 'improve',
    ar: {
      title: 'نراجع قبل أن نتوسع',
      text: 'نقيس على أمثلة جديدة ونراقب صلاحية المعرفة وحدود التكلفة، ثم نتفق على ما يستحق التحسين.',
      actions: [
        'مراجعة الأخطاء والتصحيحات البشرية.',
        'تحديث الاختبارات عند تغير المحتوى.',
        'تحديد مسؤولية التشغيل والمتابعة.',
      ],
      output: 'قائمة تحسينات ومؤشرات متابعة ونطاق صيانة متفق عليه.',
    },
    en: {
      title: 'Review before expanding',
      text: 'Evaluate fresh examples, knowledge freshness and cost limits, then agree improvements worth making.',
      actions: [
        'Review errors and human corrections.',
        'Update checks when content changes.',
        'Agree operational and maintenance ownership.',
      ],
      output: 'Prioritised improvements, monitoring criteria and agreed maintenance scope.',
    },
  },
];
export const mlCases = [
  {
    id: 'knowledge',
    demo: '/work-systems/maintenance',
    ar: {
      title: 'إجابة من دليل العمل، مع مرجعها',
      sector: 'منشأة خدمات افتراضية',
      challenge: 'يتكرر سؤال الموظفين عن إجراءات استقبال طلبات الصيانة وشروط تصعيدها.',
      approach:
        'مساعد يبحث في دليل معتمد ويقترح إجابة مع موضعها، أو يطلب توضيحًا عندما لا تكفي المعلومات.',
      data: 'دليل حديث ومصرح باستخدامه، وأسئلة عربية يراجعها مسؤول النشاط.',
      measure:
        'صحة الإجابة ومرجعها والامتناع عن الإجابة خارج الدليل على أسئلة لم تُستخدم في الإعداد.',
      limit:
        'البداية للاستخدام الداخلي؛ لا تعديل للطلبات أو التزامات للعملاء. النموذج المرتبط يعرض سير الصيانة ولا يشغّل مساعد معرفة.',
    },
    en: {
      title: 'An answer with its source',
      sector: 'Fictional service business',
      challenge: 'Staff repeatedly ask about maintenance intake procedures and escalation rules.',
      approach:
        'Search an approved guide and draft a referenced answer, or ask for clarification when evidence is insufficient.',
      data: 'A current authorised guide and Arabic questions reviewed by the business owner.',
      measure:
        'Answer correctness, source support and abstention outside the guide on unseen evaluation questions.',
      limit:
        'Internal use first, with no record changes or customer commitments. The linked demo illustrates maintenance workflow, not a knowledge assistant.',
    },
  },
  {
    id: 'triage',
    demo: '/automation-demos/lead-capture',
    ar: {
      title: 'كل طلب يصل إلى المسار المناسب',
      sector: 'مكتب أعمال افتراضي',
      challenge: 'تصل رسائل استفسار ودعم وعروض أسعار في قناة واحدة، ويحتاج كل منها متابعة مختلفة.',
      approach: 'اقتراح فئة للطلب وسبب مختصر، مع وضع الرسائل غير الواضحة في قائمة مراجعة بشرية.',
      data: 'عينة طلبات منزوعة الهوية وفئات متفق عليها وأمثلة للرسائل المختلطة.',
      measure:
        'مطابقة الفئة لمراجعة بشرية، وتتبع الحالات المحوّلة للمراجعة، دون اعتبار كل اقتراح صحيحًا.',
      limit:
        'لا إرسال تلقائي أو وعود للعملاء. النموذج المرتبط يوضح استقبال الاستفسار بقواعد ثابتة وليس تصنيفًا بنموذج ذكاء اصطناعي.',
    },
    en: {
      title: 'Route each request to the right queue',
      sector: 'Fictional business office',
      challenge:
        'Enquiries, support and quotation requests arrive in one channel and need different follow-up.',
      approach:
        'Suggest a category and a short reason, routing ambiguous messages to a human review queue.',
      data: 'De-identified requests, agreed categories and examples of mixed-intent messages.',
      measure:
        'Compare categories with human labels and track review referrals rather than assuming suggestions are correct.',
      limit:
        'No automatic sending or customer commitments. The linked demo uses fixed enquiry-capture rules, not AI classification.',
    },
  },
  {
    id: 'demand',
    demo: '/work-systems/inventory',
    ar: {
      title: 'تقدير احتياج قبل قرار الشراء',
      sector: 'متجر متخصص افتراضي',
      challenge: 'يصعب التخطيط لكمية صنف متكرر عندما تتغير الطلبات أو تنقطع فترات من السجل.',
      approach: 'نراجع السجل أولًا، ثم نقارن تقديرًا محدودًا بمتوسط بسيط مع اختبار زمني منفصل.',
      data: 'طلبات مؤرخة ومتسقة، مع توضيح المرتجعات ونفاد المخزون والعروض المؤثرة.',
      measure: 'مقارنة خطأ التقدير بخط الأساس على فترة مستقلة وتوضيح أثر البيانات الناقصة.',
      limit:
        'توصية للمراجعة لا أمر شراء آلي. لا نعد بدقة محددة. نموذج المخزون المرتبط يعرض السجلات ولا يقدم توقعًا فعليًا.',
    },
    en: {
      title: 'Estimate demand before a purchase decision',
      sector: 'Fictional specialist shop',
      challenge: 'Planning replenishment is difficult when orders change or the history has gaps.',
      approach:
        'Review the history first, then compare a focused estimate with a simple average using a separate time-based test.',
      data: 'Consistent dated orders, with returns, stockouts and relevant promotions identified.',
      measure:
        'Compare error with the baseline on a held-out period and document the impact of missing records.',
      limit:
        'A reviewed suggestion, not an automatic purchase order or accuracy promise. The linked inventory demo shows records, not a live forecast.',
    },
  },
];
