export type NetworkLocale = 'ar' | 'en';
export const networkCopy = {
  ar: {
    serviceTitle: 'البنية التحتية للشبكات',
    seoDescription:
      'تصميم وإعداد ومراقبة شبكات المنشآت الصغيرة والمتوسطة: الشبكات السلكية واللاسلكية، فصل الوصول، ربط المواقع، التوثيق وخطة الاستعادة، مع أمثلة تفاعلية ومرشد احتياج.',
    title: 'شبكة يعتمد عليها عملك',
    subtitle: 'اتصال واضح. وصول منظم. تشغيل يمكن متابعته.',
    intro:
      'نساعدك على تصميم شبكة تناسب موقعك وأجهزتك، وإعداد الوصول ومتابعة الأعطال وتوثيق التشغيل. نراجع الموجود أولًا، ثم نحدد الأجهزة والإعدادات وأعمال الموقع المطلوبة قبل الاتفاق على التنفيذ.',
    faq: [
      {
        question: 'هل يمكن الاستفادة من الأجهزة الموجودة؟',
        answer:
          'نبدأ بجرد الطرازات وحالة الدعم والبرامج والتراخيص والمنافذ والطاقة. نحدد ما يمكن الاحتفاظ به وما يحتاج تحديثًا أو استبدالًا؛ لا نفترض توافق جميع الأجهزة قبل المراجعة.',
      },
      {
        question: 'هل تورّدون الأجهزة وتنفذون التمديدات في كل الدول؟',
        answer:
          'يُحدد التوريد والتركيب والتمديدات والمعاينة بحسب بلد المشروع وإمكان التنفيذ الفعلي، ويُثبت ذلك في العرض. يمكن فصل التصميم والإعداد عن الشراء والأعمال الميدانية؛ لا يُفهم عرض الخدمة التزامًا بتغطية ميدانية في كل بلد.',
      },
      {
        question: 'هل الأسعار تشمل التراخيص والدعم؟',
        answer:
          'نفصل الأجهزة والتراخيص والاشتراكات عن التصميم والإعداد والتركيب والمتابعة. نوضح التجديدات والضمان وحدود دعم المصنع ومسؤوليات كل طرف قبل الشراء.',
      },
      {
        question: 'هل نحتاج جدارًا ناريًا أم جهاز تشفير مستقلًا؟',
        answer:
          'نحدد وظيفة الحماية أو التشفير المطلوبة أولًا. جدار الشبكة وسياسات الوصول وVPN قد تلائم احتياج الاتصال، بينما حماية مفاتيح تشفير متخصصة أو HSM تحتاج تقييمًا مستقلًا وخبرة وتنفيذًا محددين في النطاق.',
      },
      {
        question: 'كيف نتحقق من نجاح التنفيذ؟',
        answer:
          'نتفق على فحوص قبول: الوصول المسموح والمنع بين الشبكات، والتغطية في مناطق محددة، واستعادة الإعدادات، والتحويل الاحتياطي عند وجوده. النتائج تخص البيئة والوقت اللذين جرى فيهما الفحص ولا تعني ضمان عدم الانقطاع.',
      },
      {
        question: 'هل المتابعة على مدار الساعة؟',
        answer:
          'نحدد ساعات المتابعة وقنواتها ومدة الاستجابة ومسؤولية التصعيد في الاتفاق. لوحة المراقبة والتنبيهات لا تعني وجود مراقبة بشرية أو استجابة على مدار الساعة دون خدمة متفق عليها.',
      },
    ],
  },
  en: {
    serviceTitle: 'Network Infrastructure',
    seoDescription:
      'SME network design, configuration, monitoring and documentation: wired and wireless access, segmentation, site connectivity and recovery planning, with interactive examples and a needs guide.',
    title: 'A network your work relies on',
    subtitle: 'Clear connectivity. Defined access. Visible operations.',
    intro:
      'We help design a network around your premises and devices, configure access, monitor issues and document operations. Review existing equipment first, then agree hardware, configuration and site work before implementation.',
    faq: [
      {
        question: 'Can we reuse existing equipment?',
        answer:
          'Start with an inventory of models, support status, firmware, licensing, ports and power. Identify what can remain and what needs updating or replacement; compatibility is reviewed before being confirmed.',
      },
      {
        question: 'Do you supply hardware and install cabling in every country?',
        answer:
          'Procurement, installation, cabling and surveys depend on the project country and confirmed delivery arrangements. Design and configuration can be separate from purchasing and site work. This service does not imply field coverage in every country.',
      },
      {
        question: 'Are licences and support included?',
        answer:
          'Hardware, licences and subscriptions are separated from design, configuration, installation and maintenance. Renewals, warranties, vendor support boundaries and ownership are clarified before purchase.',
      },
      {
        question: 'Do we need a firewall or dedicated encryption hardware?',
        answer:
          'First define the protection or encryption requirement. Firewall rules and VPN may address connectivity needs, while specialised key protection or HSM hardware requires a separate assessment and explicitly scoped expertise and implementation.',
      },
      {
        question: 'How is acceptance checked?',
        answer:
          'Agree checks for permitted access, isolation, coverage in specific areas, configuration recovery and failover where included. Results apply to the tested environment and time and do not guarantee uninterrupted service.',
      },
      {
        question: 'Is monitoring available around the clock?',
        answer:
          'Monitoring hours, channels, response times and escalation ownership are agreed explicitly. A dashboard and alerts do not imply continuous human monitoring or a round-the-clock response service.',
      },
    ],
  },
};
export const networkServices = [
  {
    id: 'design',
    ar: {
      title: 'دراسة الشبكة وتصميمها',
      text: 'نراجع المواقع والأجهزة والمشكلات، ونضع مخطط الاتصال والعناوين وفصل الشبكات وخيارات الاستفادة من الموجود.',
      output: 'مخطط موثق وقائمة أجهزة وكميات أولية ومعايير قبول.',
    },
    en: {
      title: 'Network review and design',
      text: 'Review premises, devices and issues, then plan topology, addressing, segmentation and equipment reuse.',
      output: 'A documented design, initial bill of materials and acceptance criteria.',
    },
  },
  {
    id: 'access',
    ar: {
      title: 'الشبكات السلكية واللاسلكية',
      text: 'اختيار السويتشات ونقاط الوصول ومراجعة المنافذ والطاقة والتغطية، مع شبكة منفصلة للضيوف والأجهزة حسب الحاجة.',
      output: 'خطة منافذ وتغطية وإعدادات وصول؛ الأعداد النهائية بعد المعاينة.',
    },
    en: {
      title: 'Wired and wireless access',
      text: 'Select switches and access points, review ports, power and coverage, and separate guests and devices where needed.',
      output: 'Port and coverage plans and access configuration; final counts follow a survey.',
    },
  },
  {
    id: 'firewall',
    ar: {
      title: 'الجدار الناري وربط المواقع',
      text: 'إعداد قواعد اتصال واضحة وVPN للمستخدمين أو الفروع بحسب الإمكانات والتراخيص، مع تقليل الوصول إلى المطلوب.',
      output: 'مصفوفة وصول وإعدادات موثقة وفحوص سماح ومنع متفق عليها.',
    },
    en: {
      title: 'Firewall and site connectivity',
      text: 'Configure explicit traffic policies and user or site VPN, subject to capabilities and licensing, with necessary access only.',
      output: 'An access matrix, documented settings and agreed allow/deny checks.',
    },
  },
  {
    id: 'continuity',
    ar: {
      title: 'استمرارية الاتصال والاستعادة',
      text: 'دراسة خط احتياطي والطاقة ونسخ الإعدادات، واختبار التحويل والاستعادة عندما تدخل ضمن نطاق المشروع.',
      output: 'خطة تعثر واستعادة ونتائج اختبار؛ دون افتراض انعدام الانقطاع.',
    },
    en: {
      title: 'Connectivity and recovery planning',
      text: 'Assess backup connectivity, power and configuration copies, with failover and recovery tests where scoped.',
      output: 'Failure and recovery procedures and test evidence, without assumed zero downtime.',
    },
  },
  {
    id: 'monitoring',
    ar: {
      title: 'المراقبة والتنبيهات',
      text: 'متابعة توافر أجهزة وروابط محددة، وتنظيم تنبيهات الأعطال والتعافي وربطها بقناة أو نظام تذاكر مصرح به.',
      output: 'لوحة متابعة وتنبيهات وحدود رصد ومسؤولية استجابة واضحة.',
    },
    en: {
      title: 'Monitoring and alerts',
      text: 'Track selected devices and links, organise failure and recovery alerts and connect an authorised channel or ticket system.',
      output: 'A dashboard, alerts, monitoring boundaries and response ownership.',
    },
  },
  {
    id: 'handover',
    ar: {
      title: 'الإدارة والتوثيق والمتابعة',
      text: 'جرد الأجهزة ونسخ الإعدادات وسجل تغييرات وخطة تحديث واستعادة، مع تحديد متابعة لاحقة تناسب حجم المنشأة.',
      output: 'حزمة تسليم وتعليمات تشغيل وصلاحيات وإجراءات تغيير متفق عليها.',
    },
    en: {
      title: 'Administration and handover',
      text: 'Inventory equipment, back up configuration and maintain change, update and recovery procedures with scoped follow-up.',
      output: 'Handover files, run instructions, access ownership and agreed change procedures.',
    },
  },
];
export const networkCases = [
  {
    id: 'office',
    ar: {
      title: 'مكتب بشبكات وصول منفصلة',
      sector: 'مكتب افتراضي',
      challenge: 'يتشارك الموظفون والزوار والطابعات اتصالًا واحدًا، ويصعب فهم من يصل إلى ماذا.',
      approach: 'تقسيم منطقي للموظفين والضيوف والأجهزة، مع قواعد وصول ومراجعة تغطية نقاط العمل.',
      hardware: 'سويتش مُدار، نقاط وصول مناسبة، وبوابة بحسب المتطلبات والموجود.',
      software: 'مصفوفة وصول وجرد ونسخ إعدادات ومراقبة للأجهزة المتفق عليها.',
      acceptance: 'اختبار وصول الموظف إلى الموارد المسموحة ومنع الضيف من شبكة الموظفين.',
      limit:
        'عدد نقاط الوصول ونوع المعدات يحتاجان مخططًا ومعاينة؛ الرسم تعليمي وليس تصميم موقع فعلي.',
    },
    en: {
      title: 'An office with separate access zones',
      sector: 'Fictional office',
      challenge:
        'Staff, visitors and printers share connectivity without a clear view of access boundaries.',
      approach: 'Separate staff, guest and device zones with explicit rules and a coverage review.',
      hardware:
        'A managed switch, suitable access points and a gateway selected around requirements and existing hardware.',
      software: 'An access matrix, inventory, configuration copies and scoped monitoring.',
      acceptance: 'Verify permitted staff access and guest isolation from the staff network.',
      limit:
        'Access point counts and equipment selection require plans and a survey. The diagram is educational, not a site design.',
    },
  },
  {
    id: 'store',
    ar: {
      title: 'متجر يفصل التشغيل عن الزوار',
      sector: 'متجر افتراضي',
      challenge: 'تتأثر متابعة البيع عند تعطل الاتصال، وتتشارك أجهزة التشغيل شبكة الزوار.',
      approach: 'فصل أجهزة البيع والتشغيل عن الضيوف، ودراسة خط احتياطي وخطة اختبار التحويل.',
      hardware: 'بوابة تدعم متطلبات الربط، سويتش مناسب، نقاط وصول وطاقة احتياطية بحسب الدراسة.',
      software: 'تنبيهات انقطاع وتعافٍ وسجل تغييرات وخطة متابعة للحالات المتفق عليها.',
      acceptance:
        'فحص فصل الشبكات والتحويل والتعافي، والتحقق من توافق نظام البيع مع طريقة الاتصال.',
      limit:
        'الخط الاحتياطي لا يضمن استمرار الدفع أو كل التطبيقات؛ يعتمد ذلك على مزود الخدمة وإعدادات التطبيق.',
    },
    en: {
      title: 'Keep store operations separate from guests',
      sector: 'Fictional retailer',
      challenge:
        'Connectivity loss affects sales operations, while operating devices share guest access.',
      approach:
        'Separate operational devices and assess backup connectivity with a failover test plan.',
      hardware:
        'A gateway meeting connectivity needs, a suitable switch, access points and assessed backup power.',
      software: 'Failure and recovery alerts, change records and an agreed follow-up process.',
      acceptance:
        'Check isolation, failover and recovery, including POS compatibility with the connectivity method.',
      limit:
        'A backup link does not guarantee payments or all applications continue; provider and application behaviour matter.',
    },
  },
  {
    id: 'branches',
    ar: {
      title: 'فروع مرتبطة بصلاحيات واضحة',
      sector: 'منشأة افتراضية متعددة المواقع',
      challenge: 'تحتاج المواقع إلى موارد مشتركة، لكن فتح الوصول الكامل يزيد تعقيد التشغيل.',
      approach:
        'تحديد الموارد المسموحة لكل فرع، ودراسة ربط VPN ومراقبة الروابط ومسار بديل عند الحاجة.',
      hardware: 'بوابات متوافقة مع الربط المطلوب وأجهزة وصول لكل موقع بحسب الجرد.',
      software: 'توثيق المسارات والصلاحيات وتنبيهات الروابط وإجراءات التعافي.',
      acceptance: 'اختبار الوصول إلى الموارد المعتمدة ومنع المسارات الأخرى والتحقق من سلوك التعثر.',
      limit:
        'الربط والأداء يتأثران بخطوط الإنترنت والعناوين والتراخيص؛ المخطط لا يمثل وعدًا بأداء أو تغطية دولية.',
    },
    en: {
      title: 'Connect sites with explicit permissions',
      sector: 'Fictional multi-site business',
      challenge:
        'Sites need shared resources, but unrestricted connectivity complicates operations.',
      approach:
        'Define allowed resources per site, assess VPN connectivity and monitor links and fallback needs.',
      hardware:
        'Gateways compatible with the agreed connection and site access equipment based on inventory.',
      software: 'Route and access documentation, link alerts and recovery procedures.',
      acceptance: 'Verify approved resource access, blocked paths and agreed failure behaviour.',
      limit:
        'Performance depends on internet links, addressing and licensing. The example promises neither throughput nor international field coverage.',
    },
  },
];
export const networkEquipment = [
  {
    id: 'cisco',
    name: 'Cisco Catalyst 1200 / 1300',
    kind: 'Switching',
    ar: {
      title: 'سويتشات مُدارة للمكاتب والفروع',
      use: 'مثال نقيّمه لتنظيم المنافذ والشبكات في منشأة صغيرة أو متوسطة.',
      check: 'نراجع عدد المنافذ وسرعاتها وPoE والطراز المحدد والتوافق ودعم المصنع.',
    },
    en: {
      title: 'Managed office and branch switches',
      use: 'An example to assess for access ports and segmentation in small and medium businesses.',
      check: 'Review port count, speed, PoE, exact model, compatibility and vendor support.',
    },
  },
  {
    id: 'unifi',
    name: 'Ubiquiti UniFi',
    kind: 'Wi-Fi & Gateways',
    ar: {
      title: 'بوابات وسويتشات ونقاط وصول',
      use: 'مثال لمنظومة تجمع الاتصال السلكي واللاسلكي والإدارة بحسب تجهيز المشروع.',
      check: 'نراجع التغطية والكثافة والطاقة وطريقة الإدارة وقدرات كل جهاز.',
    },
    en: {
      title: 'Gateways, switches and access points',
      use: 'An example ecosystem combining wired and wireless connectivity and management.',
      check: 'Review coverage, density, power, management approach and each device capability.',
    },
  },
  {
    id: 'fortinet',
    name: 'Fortinet FortiGate',
    kind: 'Firewall & VPN',
    ar: {
      title: 'جدار ناري ووصول وربط',
      use: 'مثال نقيّمه لسياسات الاتصال وربط المواقع أو الوصول عن بُعد.',
      check: 'نراجع الأداء مع الخدمات المفعلة، ونوع VPN والتراخيص والتجديدات ودورة الدعم.',
    },
    en: {
      title: 'Firewall, access and connectivity',
      use: 'An example to assess for traffic policies, site connectivity or remote access.',
      check:
        'Review performance with enabled services, VPN type, licensing, renewals and support lifecycle.',
    },
  },
  {
    id: 'netgate',
    name: 'Netgate / pfSense Plus',
    kind: 'Firewall & Routing',
    ar: {
      title: 'خيار للجدار الناري والتوجيه',
      use: 'مثال نراجعه عندما تلائم إمكاناته وبيئة تشغيله حاجة المشروع.',
      check: 'نراجع الجهاز والتوافق والترخيص وخيارات الدعم وخطة التحديث والاستعادة.',
    },
    en: {
      title: 'A firewall and routing option',
      use: 'An example to assess where its capabilities and operating environment fit the project.',
      check:
        'Review appliance compatibility, licensing, support and update and recovery ownership.',
    },
  },
  {
    id: 'zabbix',
    name: 'Zabbix',
    kind: 'Monitoring',
    ar: {
      title: 'مراقبة الأجهزة والاتصال',
      use: 'أداة يمكن البناء عليها لمتابعة حالة عناصر الشبكة والتنبيهات.',
      check: 'نراجع إمكان الوصول ووسيلة جمع القياسات والتخزين وقنوات التنبيه ومسؤولية الاستجابة.',
    },
    en: {
      title: 'Device and connectivity monitoring',
      use: 'A tool that can support network status visibility and alerts.',
      check:
        'Review access, collection methods, storage, notification channels and response ownership.',
    },
  },
  {
    id: 'hsm',
    name: 'HSM / Thales Luna',
    kind: 'Specialist assessment',
    ar: {
      title: 'حماية مفاتيح تشفير متخصصة',
      use: 'مثال لحاجة متقدمة تستلزم تقييمًا مستقلًا قبل اقتراح الأجهزة أو التنفيذ.',
      check:
        'نحدد استخدام المفاتيح والتكامل والخبرة المطلوبة والتكلفة ومسؤولية التشغيل. ليس بديلًا مباشرًا لجدار الشبكة.',
    },
    en: {
      title: 'Specialised cryptographic key protection',
      use: 'An example of an advanced requirement needing a separate assessment before equipment or implementation is proposed.',
      check:
        'Define key use, integration, required expertise, cost and operational ownership. It is not a direct firewall replacement.',
    },
  },
];
export const networkStages = [
  {
    id: 'review',
    ar: [
      'نراجع الموقع والموجود',
      'نحصر الأجهزة والاتصال والمشكلات وإمكان التنفيذ، ونحدد ما يحتاج معاينة وما يمكن مراجعته عن بُعد.',
      'جرد وحدود نطاق وأسئلة يجب حسمها قبل التصميم.',
    ],
    en: [
      'Review the premises and inventory',
      'Review equipment, links, issues and delivery arrangements, distinguishing remote review from required site work.',
      'Inventory, scope boundaries and questions to resolve before design.',
    ],
  },
  {
    id: 'design',
    ar: [
      'نصمم ونختار',
      'نرسم الشبكة ومناطق الوصول ونراجع خيارات الأجهزة والتراخيص ونفصل التصميم عن التوريد والأعمال الميدانية.',
      'مخطط وقائمة مواد ومصفوفة وصول وعرض مفصل.',
    ],
    en: [
      'Design and select',
      'Plan topology and access zones, assess equipment and licensing and separate design from procurement and field work.',
      'Topology, bill of materials, access matrix and an itemised scope.',
    ],
  },
  {
    id: 'configure',
    ar: [
      'نجهز ونختبر',
      'ننظم نافذة التغيير ونسخة الإعدادات وخطة التراجع، وننفذ الإعدادات والفحوص التي تم الاتفاق عليها.',
      'إعدادات موثقة وأدلة فحص وقائمة ملاحظات.',
    ],
    en: [
      'Configure and verify',
      'Agree a change window, configuration backup and rollback plan, then implement and test the agreed settings.',
      'Documented configuration, test evidence and outstanding findings.',
    ],
  },
  {
    id: 'handover',
    ar: [
      'نسلّم ونتابع',
      'نسلم الوثائق وطريقة الاستعادة وملكية الوصول، ونحدد نطاق المراقبة وساعات المتابعة والصيانة اللاحقة.',
      'حزمة تشغيل ومسؤوليات واضحة واتفاق متابعة عند الحاجة.',
    ],
    en: [
      'Hand over and follow up',
      'Deliver documentation, recovery instructions and access ownership, then agree monitoring and support hours.',
      'Operational files, explicit ownership and scoped maintenance where needed.',
    ],
  },
];
