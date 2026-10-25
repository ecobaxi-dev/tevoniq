export type HomeService = {
  id: 'website' | 'workflow' | 'automation' | 'dashboard';
  title: string;
  description: string;
  example: string;
  deliverables: string[];
};

export const homeServices = {
  ar: {
    eyebrow: 'خدماتنا',
    title: 'خدمات تناسب احتياج منشأتك',
    introduction:
      'موقع يعرّف بأعمالك، أو نظام ينظّم طلباتك، أو ربط يختصر خطواتك. نبدأ بما تحتاجه اليوم، ونحدّد معك نطاقًا واضحًا يمكن تطويره على مراحل.',
    exampleLabel: 'مثال توضيحي',
    details: 'ما الذي نُسلّمه؟',
    discuss: 'ناقش احتياجك',
    allServices: 'استكشف جميع الخدمات',
    scope:
      'نحدّد الوظائف والمدة والتكلفة بعد فهم احتياجك. يشمل الاتفاق مخرجات التسليم والاختبار، وما يغطيه الدعم والصيانة.',
    previews: {
      website: ['خدمات منشأتك', 'طلب تواصل'],
      workflow: ['طلب جديد', 'قيد التنفيذ', 'مكتمل'],
      automation: ['نموذج', 'طلب', 'إشعار'],
      dashboard: ['متابعة الطلبات', 'الحالات', 'النشاط'],
    },
    services: [
      {
        id: 'website',
        title: 'مواقع الأعمال',
        description:
          'نطوّر موقعًا يعرّف بخدماتك ويجعل الوصول إليك وإرسال الاستفسارات أسهل، بتجربة واضحة على الهاتف والكمبيوتر.',
        example: 'شركة خدمات تعرض أعمالها وتستقبل طلبات معاينة من موقعها.',
        deliverables: [
          'صفحات تعرض خدماتك ومعلومات التواصل.',
          'نموذج استفسارات مع التحقق من المدخلات.',
          'تهيئة أساسية للظهور في البحث وإرشادات لإدارة المحتوى.',
        ],
      },
      {
        id: 'workflow',
        title: 'أنظمة إدارة العمل',
        description:
          'نبني نظامًا يجمع الطلبات والحالات والملاحظات في مكان واحد، لتعرف ما وصل، وما أُنجز، وما يحتاج إلى متابعة.',
        example: 'منشأة صيانة تتابع طلب الخدمة من الاستلام إلى الإغلاق.',
        deliverables: [
          'إدارة الطلبات ومراحل العمل المتفق عليها.',
          'بحث وتصفية وملاحظات وسجل للتحديثات.',
          'صلاحيات استخدام وتوثيق لمسارات العمل المحددة.',
        ],
      },
      {
        id: 'automation',
        title: 'الأتمتة والربط',
        description:
          'نربط أدواتك ونؤتمت الخطوات المتكررة لتقليل نقل البيانات يدويًا، وتنظيم الإشعارات والمتابعة.',
        example: 'تحويل نموذج تواصل إلى طلب منظّم، ثم إرسال إشعار للمسؤول.',
        deliverables: [
          'ربط الأدوات التي تتيح التكامل عبر واجهاتها.',
          'تشغيل إجراءات وإشعارات وفق شروط واضحة.',
          'معالجة الأخطاء وسجل تشغيل وإرشادات للمتابعة.',
        ],
      },
      {
        id: 'dashboard',
        title: 'لوحات المعلومات',
        description:
          'نحوّل بياناتك إلى مؤشرات وتقارير مفهومة تساعدك على متابعة المبيعات والطلبات وما يحتاج إلى قرار.',
        example: 'لوحة توضّح الطلبات حسب حالتها، والأعمال المتأخرة خلال فترة محددة.',
        deliverables: [
          'ربط مصادر البيانات المتفق عليها والتحقق من جودتها.',
          'مؤشرات ورسوم وفلاتر تناسب طريقة متابعتك.',
          'تقارير قابلة للتصدير وفق النطاق المحدد.',
        ],
      },
    ] satisfies HomeService[],
  },
  en: {
    eyebrow: 'OUR SERVICES',
    title: 'Practical services for your business',
    introduction:
      'A website to introduce your business, a system to organise requests, or an integration to simplify routine work. We start with what you need today and agree on a clear scope, delivered in stages.',
    exampleLabel: 'Illustrative example',
    details: 'What do we deliver?',
    discuss: 'Discuss your needs',
    allServices: 'Explore all services',
    scope:
      'We define features, timing and cost after understanding your needs. The agreement covers deliverables, testing, and the scope of support and maintenance.',
    previews: {
      website: ['Your services', 'Get in touch'],
      workflow: ['New request', 'In progress', 'Complete'],
      automation: ['Form', 'Request', 'Notification'],
      dashboard: ['Request overview', 'Status', 'Activity'],
    },
    services: [
      {
        id: 'website',
        title: 'Business websites',
        description:
          'We build websites that explain your services and make enquiries easy, with a clear experience on mobile and desktop.',
        example: 'A service business presents its work and receives site-visit requests online.',
        deliverables: [
          'Pages for your services and contact information.',
          'An enquiry form with input validation.',
          'Basic search visibility setup and content management guidance.',
        ],
      },
      {
        id: 'workflow',
        title: 'Work management systems',
        description:
          'We bring requests, statuses and notes into one system so you can see what arrived, what is done and what needs attention.',
        example: 'A maintenance business follows a service request from receipt to closure.',
        deliverables: [
          'Requests and agreed workflow stages.',
          'Search, filters, notes and an update history.',
          'User permissions and documentation for the defined workflows.',
        ],
      },
      {
        id: 'automation',
        title: 'Automation and integrations',
        description:
          'We connect your tools and automate repeatable steps to reduce manual data entry and organise notifications and follow-up.',
        example: 'A contact form creates a structured request and notifies the person responsible.',
        deliverables: [
          'Connections to tools with available integration APIs.',
          'Actions and notifications based on clear rules.',
          'Error handling, execution logs and monitoring guidance.',
        ],
      },
      {
        id: 'dashboard',
        title: 'Dashboards and reports',
        description:
          'We turn your data into readable indicators and reports to help you follow sales, requests and decisions that need attention.',
        example:
          'A dashboard groups requests by status and highlights overdue work for a selected period.',
        deliverables: [
          'Connections to agreed data sources and data quality checks.',
          'Indicators, charts and filters suited to your needs.',
          'Exportable reports within the agreed scope.',
        ],
      },
    ] satisfies HomeService[],
  },
};
