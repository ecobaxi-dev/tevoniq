export type QaLocale = 'ar' | 'en';
export const qaCopy = {
  ar: {
    serviceTitle: 'أتمتة ضمان الجودة واختبار البرمجيات',
    seoDescription:
      'اختبارات آلية للمواقع وأنظمة الأعمال: المسارات الأساسية، واجهات الربط، العربية والجوال، وتقارير أخطاء قابلة لإعادة الفحص. ابدأ بنطاق محدد وتجربة توضيحية.',
    title: 'اختبر اليوم، وأطلق بثقة',
    subtitle: 'كل تحديث يحتاج دليلًا على أنه يعمل.',
    intro:
      'نساعدك على تحويل الخطوات المتكررة في موقعك أو نظامك إلى اختبارات قابلة للإعادة، لتكتشف ما تغيّر قبل وصوله إلى مستخدميك. نبدأ بالمسارات المهمة لأعمالك، ونوضح ما اختُبر وما بقي خارج النطاق.',
    faq: [
      {
        question: 'هل أحتاج أتمتة الاختبارات في مشروع صغير؟',
        answer:
          'تكون مفيدة عندما تتكرر التحديثات أو توجد خطوات مهمة مثل الطلب والحجز والصلاحيات. إذا كانت التغييرات قليلة، فقد تكفي مراجعة يدوية مركزة. نقيّم الجدوى قبل إنشاء حزمة اختبارات.',
      },
      {
        question: 'هل تضمن الاختبارات خلو البرنامج من الأخطاء؟',
        answer:
          'لا. نتائج الاختبار تخص السيناريوهات والبيئة والنسخة التي جرى فحصها. نحدد التغطية والقيود بوضوح، ونجمع الأتمتة مع مراجعة يدوية للحالات التي تحتاج حكمًا بشريًا.',
      },
      {
        question: 'هل تشمل العربية والجوال؟',
        answer:
          'يمكن أن يشمل النطاق اتجاه العرض من اليمين إلى اليسار، الحقول العربية، وضوح الأزرار، أحجام الشاشات والمتصفحات المتفق عليها. الاختبار على جهاز حقيقي أو متصفح إضافي يُحدد صراحة ضمن خطة الفحص.',
      },
      {
        question: 'هل يمكن اختبار متجر أو نظام من شركة أخرى؟',
        answer:
          'نراجع إمكان الوصول إلى بيئة الاختبار والتوثيق والصلاحيات. نستخدم بيانات تجريبية وحسابات مخصصة، ولا ننفذ دفعًا حقيقيًا أو إرسال رسائل أو تغيير بيانات إنتاج دون اتفاق واضح.',
      },
      {
        question: 'ماذا نستلم في نهاية العمل؟',
        answer:
          'السيناريوهات المتفق عليها وملفات الاختبارات وطريقة تشغيلها، وتقرير بالنتائج والأخطاء وخطوات إعادة إنتاجها وحدود التغطية. يمكن الاتفاق على تشغيلها مع تحديثات المستودع وإعادة فحص الإصلاحات.',
      },
      {
        question: 'هل تستخدمون الذكاء الاصطناعي؟',
        answer:
          'قد نستخدمه لاقتراح حالات اختبار أو تنظيم التوثيق مع مراجعة بشرية. لا نعتمد نجاح اقتراح آلي دليلًا على جودة البرنامج، ولا نرفع بيانات العملاء أو الأسرار إلى أداة خارجية دون اتفاق.',
      },
    ],
  },
  en: {
    serviceTitle: 'QA automation and software testing',
    seoDescription:
      'Focused automated checks for business websites and systems: critical journeys, APIs, Arabic and mobile layouts, and reproducible defect reports. Explore an illustrative testing lab.',
    title: 'Test first. Release confidently.',
    subtitle: 'Every update needs evidence that it works.',
    intro:
      'We help turn repeated checks in your website or business system into tests you can run again. Start with important business journeys, catch changes before users encounter them, and see exactly what was tested and what remains outside scope.',
    faq: [
      {
        question: 'Does a small project need test automation?',
        answer:
          'It can be useful when updates are frequent or critical journeys include orders, bookings or permissions. Infrequent changes may only need a focused manual review. We assess the value before building a test suite.',
      },
      {
        question: 'Do automated tests guarantee error-free software?',
        answer:
          'No. Results apply to the scenarios, environment and software version tested. We document coverage and limitations, and combine automation with manual review where human judgement is needed.',
      },
      {
        question: 'Can the scope cover Arabic and mobile?',
        answer:
          'It can include right-to-left layouts, Arabic fields, readable actions, and agreed screen sizes and browsers. Real-device testing or an additional browser is explicitly specified in the test plan.',
      },
      {
        question: 'Can you test an existing third-party system or store?',
        answer:
          'We review access, documentation and permissions first. Tests use sample data and dedicated accounts. Real payments, messages or production changes require an explicit agreement.',
      },
      {
        question: 'What do we receive?',
        answer:
          'Agreed scenarios, test files and run instructions, plus results, reproducible defect reports and coverage boundaries. Repository checks and verification of fixes can be included in the scope.',
      },
      {
        question: 'Do you use AI?',
        answer:
          'We may use it to suggest test cases or organise documentation, with human review. An AI suggestion is not proof of quality. Customer records and secrets are not shared with an external tool without agreement.',
      },
    ],
  },
};
export const qaBenefits = [
  {
    ar: [
      'تغييرات أوضح',
      'نعيد فحص المسارات المهمة بعد التحديث، لنرى إن كان تغيير جديد قد أثّر في وظيفة قائمة.',
    ],
    en: [
      'See what changed',
      'Recheck important journeys after an update to identify regressions in existing behaviour.',
    ],
  },
  {
    ar: [
      'أخطاء قابلة للتتبع',
      'نربط الملاحظة بخطوات وبيانات ونتيجة متوقعة، لتصبح مناقشة الإصلاح وإعادة فحصه أسهل.',
    ],
    en: [
      'Reproducible issues',
      'Connect each finding to steps, sample data and an expected result for easier investigation.',
    ],
  },
  {
    ar: [
      'قرار إصدار أوضح',
      'نميّز بين العوائق والملاحظات، ونوضح الحالات غير المفحوصة قبل اتخاذ قرار النشر.',
    ],
    en: [
      'A clearer release decision',
      'Separate blockers from observations and show untested areas before a release decision.',
    ],
  },
];
export const qaScope = [
  {
    id: 'journeys',
    ar: {
      title: 'مسارات المستخدم الأساسية',
      text: 'تسجيل الدخول، إرسال الطلب، تعديل البيانات والحجز؛ نختبر المسار الصحيح والحالات غير المقبولة.',
      output: 'سيناريوهات مكتوبة مرتبطة بمعايير قبول واضحة.',
    },
    en: {
      title: 'Critical user journeys',
      text: 'Sign-in, orders, record updates and booking, including valid paths and rejected inputs.',
      output: 'Written scenarios tied to explicit acceptance criteria.',
    },
  },
  {
    id: 'api',
    ar: {
      title: 'واجهات الربط والبيانات',
      text: 'نتحقق من الاستجابات والتحقق من المدخلات ومعالجة الأخطاء، بحسب التوثيق وإمكان الوصول.',
      output: 'اختبارات لعقود البيانات والحالات المتفق عليها.',
    },
    en: {
      title: 'APIs and records',
      text: 'Check responses, input validation and error handling against documentation and available access.',
      output: 'Checks for agreed data contracts and response cases.',
    },
  },
  {
    id: 'regression',
    ar: {
      title: 'اختبارات ما بعد التحديث',
      text: 'نكوّن حزمة صغيرة للمسارات الأكثر أهمية، ثم نعيد تشغيلها على النسخة الجديدة.',
      output: 'تقرير نجاح وفشل مع نسخة البرنامج والبيئة.',
    },
    en: {
      title: 'Regression checks',
      text: 'Build a focused suite around important paths and rerun it against the updated version.',
      output: 'Pass/fail results with software version and environment.',
    },
  },
  {
    id: 'layout',
    ar: {
      title: 'العربية والجوال والمتصفحات',
      text: 'نفحص اتجاه العرض، قص النصوص، تداخل العناصر وسهولة الوصول في الشاشات المتفق عليها.',
      output: 'ملاحظات موثقة بلقطات وشروط إعادة الفحص.',
    },
    en: {
      title: 'Arabic, mobile and browsers',
      text: 'Review text direction, clipping, overlapping elements and accessibility on agreed viewports.',
      output: 'Findings with screenshots and verification conditions.',
    },
  },
  {
    id: 'delivery',
    ar: {
      title: 'تشغيل متكرر من المستودع',
      text: 'عندما تسمح بيئة المشروع، نربط الاختبارات بتحديثات الشيفرة، مع فصل المفاتيح والبيانات التجريبية.',
      output: 'إعداد تشغيل وتعليمات لفهم النتائج ومتابعتها.',
    },
    en: {
      title: 'Repeatable repository checks',
      text: 'Where supported, connect checks to code updates with separate credentials and sample data.',
      output: 'Run configuration and instructions for interpreting results.',
    },
  },
  {
    id: 'review',
    ar: {
      title: 'مراجعة يدوية مكمّلة',
      text: 'نراجع الوضوح والحالات الجديدة وحدود التغطية؛ فنجاح الاختبار الآلي لا يقيّم كل تجربة الاستخدام.',
      output: 'قائمة أولويات لما يحتاج إصلاحًا أو فحصًا أوسع.',
    },
    en: {
      title: 'Complementary manual review',
      text: 'Review clarity, new cases and coverage boundaries; automated passes do not assess every experience.',
      output: 'Prioritised findings for fixes or broader review.',
    },
  },
];
export const qaStages = [
  {
    id: 'plan',
    ar: {
      title: 'نحدد ما يهم',
      text: 'نراجع المنتج والتحديثات والمشكلات المتكررة، ونختار مسارات محددة وبيئة اختبار آمنة.',
      output: 'خطة نطاق، حالات اختبار ومعايير قبول.',
      needs: 'رابط البيئة ووصف الوظائف والحسابات التجريبية المسموح بها.',
    },
    en: {
      title: 'Define priorities',
      text: 'Review the product, update cycle and recurring issues, then agree focused journeys and a safe environment.',
      output: 'Scope, test cases and acceptance criteria.',
      needs: 'Environment URL, workflows and authorised sample accounts.',
    },
  },
  {
    id: 'build',
    ar: {
      title: 'نبني الاختبارات',
      text: 'نختار الأداة المناسبة ونجهز بيانات منفصلة واختبارات مفهومة يمكن صيانتها.',
      output: 'حزمة أولية وتعليمات تشغيل.',
      needs: 'توقعات واضحة لكل مسار ووصول إلى التوثيق أو المستودع عند الحاجة.',
    },
    en: {
      title: 'Build the checks',
      text: 'Choose suitable tooling, isolated sample data and readable tests that can be maintained.',
      output: 'An initial suite and run instructions.',
      needs: 'Expected behaviour and relevant documentation or repository access.',
    },
  },
  {
    id: 'verify',
    ar: {
      title: 'نفحص ونوثّق',
      text: 'نشغّل الحزمة ونعزل الأعطال عن مشكلات بيئة الاختبار، ثم نعيد فحص الإصلاحات المتفق عليها.',
      output: 'تقرير أخطاء بالخطوات والأولوية والأدلة.',
      needs: 'نسخة ثابتة للفحص وجهة مسؤولة عن اعتماد الإصلاحات.',
    },
    en: {
      title: 'Run and document',
      text: 'Run the suite, distinguish defects from environment failures and verify agreed fixes.',
      output: 'Defect reports with steps, priority and evidence.',
      needs: 'A stable test version and an owner to review fixes.',
    },
  },
  {
    id: 'handover',
    ar: {
      title: 'نسلّم ونحدّث',
      text: 'نوضح طريقة التشغيل وما تغطيه الحزمة، ونتفق على الصيانة عند تغير الوظائف.',
      output: 'ملفات وإعدادات وقائمة تغطية وحدود معروفة.',
      needs: 'تحديد مسؤولية التشغيل والتحديثات اللاحقة.',
    },
    en: {
      title: 'Hand over and maintain',
      text: 'Explain how to run the suite and its coverage, and agree maintenance as features change.',
      output: 'Files, configuration, coverage and known boundaries.',
      needs: 'Agreed ownership for runs and future updates.',
    },
  },
];
export const qaCases = [
  {
    id: 'checkout',
    demo: '/website-designs/retail-store',
    ar: {
      title: 'سلة متجر لا تقبل كمية خاطئة',
      sector: 'متجر متخصص افتراضي',
      challenge: 'تغيير حقل الكمية قد يسمح بطلب غير صالح أو إجمالي لا يطابق الكمية والسعر.',
      approach:
        'نختبر الحساب عند كمية صحيحة، ثم الصفر والكسور والقيم خارج الحد، ونتحقق من رفضها بوضوح.',
      scope: 'سلة تجريبية وسعر ثابت؛ ثم يمكن إضافة الشحن والخصومات والضرائب في نطاق مستقل.',
      measure:
        'مقارنة الإجمالي المتوقع بالفعلي، والتحقق من رفض الكميات غير الصالحة في كل إعادة تشغيل.',
      limit: 'لا تشمل التجربة بوابة دفع أو خصم مخزون أو امتثالًا ضريبيًا. نموذج المتجر للعرض فقط.',
    },
    en: {
      title: 'A basket that rejects invalid quantities',
      sector: 'Fictional specialist retailer',
      challenge:
        'A quantity change may allow invalid orders or totals that do not match the price and quantity.',
      approach:
        'Check a valid calculation, then zero, fractional and out-of-range quantities and their rejection.',
      scope:
        'A sample basket with a fixed price. Shipping, discounts and tax require separate agreed cases.',
      measure:
        'Compare expected and actual totals and verify invalid quantities are rejected on each run.',
      limit:
        'No payment gateway, stock deduction or tax compliance is tested. The store is a visual demo.',
    },
  },
  {
    id: 'booking',
    demo: '/work-systems/appointments',
    ar: {
      title: 'موعد واحد لا يُحجز مرتين',
      sector: 'مركز خدمات افتراضي',
      challenge: 'قبول وقت محجوز مسبقًا يسبب تعارضًا في جدول العمل ويحتاج متابعة يدوية.',
      approach: 'نختبر وقتًا متاحًا ووقتًا مشغولًا وطلبًا بلا وقت، ونوضح استجابة كل حالة.',
      scope:
        'قائمة مواعيد تجريبية ثابتة؛ منع التعارض المتزامن يحتاج اختبار قاعدة البيانات والمعاملات.',
      measure: 'قبول الوقت المتاح ورفض المشغول والفارغ، مع نتيجة يمكن إعادة إنتاجها.',
      limit: 'المختبر لا يحفظ حجزًا ولا يختبر التزامن أو المناطق الزمنية أو إرسال تذكيرات.',
    },
    en: {
      title: 'One slot, one booking',
      sector: 'Fictional service centre',
      challenge:
        'Accepting an occupied appointment creates scheduling conflicts and manual follow-up.',
      approach:
        'Check an available slot, an occupied slot and a missing time, with an explicit response for each.',
      scope:
        'A fixed sample schedule. Simultaneous booking protection needs database and transaction tests.',
      measure:
        'Accept available slots and reject occupied or empty values with reproducible outcomes.',
      limit: 'The lab saves no bookings and does not test concurrency, time zones or reminders.',
    },
  },
  {
    id: 'permissions',
    demo: '/work-systems/maintenance',
    ar: {
      title: 'كل مستخدم يرى الإجراء المناسب',
      sector: 'منشأة صيانة افتراضية',
      challenge: 'إظهار إجراء اعتماد لمستخدم غير مخوّل قد يسبب تعديلًا غير مقصود في سير الطلب.',
      approach:
        'نختبر مصفوفة أدوار محددة: المشرف والموظف والمستخدم غير المعروف، قبل الاعتماد وبعده.',
      scope: 'قاعدة صلاحية محلية توضيحية؛ في مشروع فعلي تُفحص الصلاحية على الخادم أيضًا.',
      measure: 'مطابقة السماح والمنع للقواعد المعتمدة، بما فيها رفض الدور غير المعروف.',
      limit: 'هذا فحص وظيفي لقاعدة صلاحية، ولا يمثل اختبار اختراق أو تدقيقًا أمنيًا شاملًا.',
    },
    en: {
      title: 'The right action for each role',
      sector: 'Fictional maintenance business',
      challenge:
        'An approval action exposed to an unauthorised role may cause unintended workflow changes.',
      approach:
        'Check a defined role matrix: supervisor, employee and unknown role against the agreed rule.',
      scope:
        'An illustrative local permission rule. A real system also requires server-side enforcement checks.',
      measure:
        'Match allow/deny outcomes to the approved matrix, including rejection of unknown roles.',
      limit:
        'This is a functional rule check, not penetration testing or a comprehensive security audit.',
    },
  },
];
