export type SystemLocale = 'ar' | 'en';
export type WorkSystemCopy = {
  name: string;
  brand: string;
  headline: string;
  audience: string;
  recordLabel: string;
  addLabel: string;
  valueLabel: string;
  totalLabel: string;
  placeholder: string;
  stages: string[];
  modules: string[];
  benefits: string[];
  integrations: string[];
  automation: string;
};
export type WorkSystem = {
  slug: string;
  theme: string;
  view: 'table' | 'board' | 'agenda';
  measure: 'money' | 'hours' | 'minutes';
  ar: WorkSystemCopy;
  en: WorkSystemCopy;
  records: {
    id: number;
    ar: { title: string; contact: string };
    en: { title: string; contact: string };
    value: number;
    quantity: number;
    status: number;
    priority: 'normal' | 'high';
    date: string;
    time: string;
  }[];
};
export const workSystems: WorkSystem[] = [
  {
    slug: 'maintenance',
    theme: 'teal',
    view: 'table',
    measure: 'money',
    ar: {
      name: 'إدارة طلبات الصيانة',
      brand: 'مسار للصيانة',
      headline: 'من بلاغ جديد إلى خدمة مكتملة، بخطوات واضحة.',
      audience: 'لمنشآت الصيانة والخدمات الميدانية التي تحتاج متابعة الطلبات والمواعيد والملاحظات.',
      recordLabel: 'طلب صيانة',
      addLabel: 'طلب جديد',
      valueLabel: 'قيمة تقديرية (ر.س)',
      totalLabel: 'إجمالي التقديرات',
      placeholder: 'فحص تكييف، صيانة جهاز، زيارة موقع',
      stages: ['جديد', 'مجدول', 'قيد التنفيذ', 'مكتمل'],
      modules: ['سجل الطلبات', 'تفاصيل البلاغ والموعد', 'الأولوية والحالة', 'ملاحظات وسجل تحديثات'],
      benefits: [
        'جمع البلاغات بدل تشتتها في الرسائل',
        'تمييز الطلبات العاجلة والمتأخرة',
        'معرفة الخطوة التالية لكل طلب',
      ],
      integrations: [
        'نموذج طلب الخدمة في الموقع',
        'تقويم الزيارات',
        'المحاسبة والفواتير عبر واجهة موثقة',
      ],
      automation: 'بلاغ الموقع ← إنشاء طلب ← مراجعة الموعد ← متابعة التنفيذ وإشعار العميل.',
    },
    en: {
      name: 'Maintenance requests',
      brand: 'MASAR SERVICE',
      headline: 'From a new request to a completed visit.',
      audience: 'For maintenance businesses and field services managing requests, dates and notes.',
      recordLabel: 'Service request',
      addLabel: 'New request',
      valueLabel: 'Estimate (SAR)',
      totalLabel: 'Total estimates',
      placeholder: 'AC inspection, equipment repair, site visit',
      stages: ['New', 'Scheduled', 'In progress', 'Completed'],
      modules: [
        'Request register',
        'Issue and appointment details',
        'Priority and status',
        'Notes and activity history',
      ],
      benefits: [
        'Keep requests in one place',
        'Identify urgent and overdue work',
        'See the next step for each request',
      ],
      integrations: [
        'Website service form',
        'Visit calendar',
        'Accounting and invoices via supported APIs',
      ],
      automation: 'Website enquiry → request → schedule review → progress and customer updates.',
    },
    records: [
      {
        id: 1,
        ar: {
          title: 'فحص جهاز تكييف',
          contact: 'منشأة ألف • بيانات توضيحية',
        },
        en: {
          title: 'AC inspection',
          contact: 'Business A • sample',
        },
        value: 350,
        quantity: 1,
        status: 0,
        priority: 'high',
        date: '2026-11-02',
        time: '09:00',
      },
      {
        id: 2,
        ar: {
          title: 'زيارة صيانة دورية',
          contact: 'منشأة باء • بيانات توضيحية',
        },
        en: {
          title: 'Routine maintenance',
          contact: 'Business B • sample',
        },
        value: 600,
        quantity: 1,
        status: 1,
        priority: 'normal',
        date: '2026-11-03',
        time: '10:00',
      },
      {
        id: 3,
        ar: {
          title: 'إصلاح وحدة تحكم',
          contact: 'منشأة جيم • بيانات توضيحية',
        },
        en: {
          title: 'Control unit repair',
          contact: 'Business C • sample',
        },
        value: 450,
        quantity: 1,
        status: 2,
        priority: 'high',
        date: '2026-11-04',
        time: '11:00',
      },
      {
        id: 4,
        ar: {
          title: 'فحص تمديدات',
          contact: 'منشأة دال • بيانات توضيحية',
        },
        en: {
          title: 'Installation inspection',
          contact: 'Business D • sample',
        },
        value: 280,
        quantity: 1,
        status: 3,
        priority: 'normal',
        date: '2026-11-05',
        time: '12:00',
      },
    ],
  },
  {
    slug: 'sales-crm',
    theme: 'violet',
    view: 'board',
    measure: 'money',
    ar: {
      name: 'متابعة العملاء وفرص البيع',
      brand: 'صلة للمبيعات',
      headline: 'كل فرصة بيع، لها خطوة تالية.',
      audience: 'للمنشآت التي تتلقى استفسارات وتحتاج متابعة العروض والتواصل حتى حسم الفرصة.',
      recordLabel: 'فرصة بيع',
      addLabel: 'فرصة جديدة',
      valueLabel: 'قيمة الفرصة (ر.س)',
      totalLabel: 'قيمة الفرص المفتوحة',
      placeholder: 'عميل محتمل، طلب عرض، متابعة عرض',
      stages: ['استفسار', 'تأهيل', 'عرض سعر', 'تم الاتفاق'],
      modules: [
        'لوحة مراحل البيع',
        'بيانات التواصل والاحتياج',
        'قيمة الفرصة وموعد المتابعة',
        'ملاحظات وسجل التواصل',
      ],
      benefits: [
        'تقليل نسيان المتابعة',
        'رؤية الفرص حسب المرحلة',
        'توحيد المعلومات قبل إرسال العرض',
      ],
      integrations: ['نماذج استفسار الموقع', 'البريد وتقويم المتابعة', 'برنامج العروض والفواتير'],
      automation: 'استفسار جديد ← فرصة بيع ← مهمة متابعة ← عرض سعر ← تحديث نتيجة الاتفاق.',
    },
    en: {
      name: 'Sales & customer follow-up',
      brand: 'SILA SALES',
      headline: 'Give every opportunity a next step.',
      audience: 'For small businesses following enquiries, quotations and customer conversations.',
      recordLabel: 'Opportunity',
      addLabel: 'New opportunity',
      valueLabel: 'Opportunity value (SAR)',
      totalLabel: 'Open pipeline value',
      placeholder: 'New enquiry, quote request, quotation follow-up',
      stages: ['Enquiry', 'Qualified', 'Quotation', 'Agreed'],
      modules: [
        'Sales pipeline',
        'Contact and requirements',
        'Value and follow-up date',
        'Conversation notes and activity',
      ],
      benefits: [
        'Reduce missed follow-ups',
        'See opportunities by stage',
        'Keep context before quoting',
      ],
      integrations: [
        'Website enquiry forms',
        'Email and follow-up calendar',
        'Quotation and invoicing software',
      ],
      automation: 'Enquiry → opportunity → follow-up → quotation → agreement outcome.',
    },
    records: [
      {
        id: 1,
        ar: {
          title: 'تجهيز موقع تعريفي',
          contact: 'نشاط ألف • بيانات توضيحية',
        },
        en: {
          title: 'Business website enquiry',
          contact: 'Business A • sample',
        },
        value: 4000,
        quantity: 1,
        status: 0,
        priority: 'normal',
        date: '2026-11-02',
        time: '09:00',
      },
      {
        id: 2,
        ar: {
          title: 'تطوير نموذج طلبات',
          contact: 'نشاط باء • بيانات توضيحية',
        },
        en: {
          title: 'Request workflow enquiry',
          contact: 'Business B • sample',
        },
        value: 6500,
        quantity: 1,
        status: 1,
        priority: 'high',
        date: '2026-11-03',
        time: '10:00',
      },
      {
        id: 3,
        ar: {
          title: 'تجديد نظام متابعة',
          contact: 'نشاط جيم • بيانات توضيحية',
        },
        en: {
          title: 'Workflow renewal',
          contact: 'Business C • sample',
        },
        value: 3000,
        quantity: 1,
        status: 2,
        priority: 'normal',
        date: '2026-11-04',
        time: '11:00',
      },
      {
        id: 4,
        ar: {
          title: 'صفحات خدمات جديدة',
          contact: 'نشاط دال • بيانات توضيحية',
        },
        en: {
          title: 'Service pages enquiry',
          contact: 'Business D • sample',
        },
        value: 2200,
        quantity: 1,
        status: 3,
        priority: 'normal',
        date: '2026-11-05',
        time: '12:00',
      },
    ],
  },
  {
    slug: 'workshop-orders',
    theme: 'orange',
    view: 'board',
    measure: 'money',
    ar: {
      name: 'أوامر الورشة والتصنيع حسب الطلب',
      brand: 'صُنع لإدارة الورشة',
      headline: 'تابع كل طلب، من المقاس إلى التسليم.',
      audience: 'للورش ومصنّعي الأثاث والمنتجات حسب الطلب، ضمن مسار تشغيل محدد.',
      recordLabel: 'أمر عمل',
      addLabel: 'أمر جديد',
      valueLabel: 'قيمة تقديرية (ر.س)',
      totalLabel: 'قيمة أوامر العمل',
      placeholder: 'طاولة حسب المقاس، تجهيز قطعة، أمر تصنيع',
      stages: ['مستلم', 'تحضير', 'تصنيع', 'جاهز للتسليم'],
      modules: [
        'سجل أوامر العمل',
        'المواصفات والمقاسات',
        'مراحل التنفيذ وموعد التسليم',
        'ملاحظات وتغييرات الطلب',
      ],
      benefits: [
        'توضيح مواصفات كل أمر',
        'تمييز ما ينتظر البدء وما أصبح جاهزًا',
        'توثيق التعديلات بدل ضياعها في المحادثات',
      ],
      integrations: [
        'طلبات التصميم من الموقع',
        'برنامج المخزون عند توفر واجهة ربط',
        'العروض والفواتير',
      ],
      automation:
        'طلب معتمد ← أمر عمل بالمواصفات ← تحضير المواد ← متابعة التصنيع ← جاهزية التسليم.',
    },
    en: {
      name: 'Workshop & made-to-order jobs',
      brand: 'SUN WORKSHOP',
      headline: 'Track each job, from measurements to delivery.',
      audience: 'For workshops and made-to-order makers with a focused production workflow.',
      recordLabel: 'Work order',
      addLabel: 'New work order',
      valueLabel: 'Estimate (SAR)',
      totalLabel: 'Work order value',
      placeholder: 'Custom table, component preparation, production job',
      stages: ['Received', 'Preparation', 'Production', 'Ready'],
      modules: [
        'Work order register',
        'Specifications and dimensions',
        'Production stages and due date',
        'Notes and changes',
      ],
      benefits: [
        'Clarify each order’s specification',
        'Distinguish waiting and ready jobs',
        'Record changes outside chat threads',
      ],
      integrations: [
        'Website custom order forms',
        'Inventory software with a supported API',
        'Quotations and invoicing',
      ],
      automation: 'Approved request → specification → materials → production → ready for delivery.',
    },
    records: [
      {
        id: 1,
        ar: {
          title: 'طاولة بقياس خاص',
          contact: 'طلب توضيحي • 180 × 90 سم',
        },
        en: {
          title: 'Custom-size table',
          contact: 'Sample order • 180 × 90 cm',
        },
        value: 1800,
        quantity: 1,
        status: 0,
        priority: 'normal',
        date: '2026-11-02',
        time: '09:00',
      },
      {
        id: 2,
        ar: {
          title: 'وحدة تخزين خشبية',
          contact: 'طلب توضيحي • خشب طبيعي',
        },
        en: {
          title: 'Wooden storage unit',
          contact: 'Sample order • natural wood',
        },
        value: 2600,
        quantity: 1,
        status: 1,
        priority: 'high',
        date: '2026-11-03',
        time: '10:00',
      },
      {
        id: 3,
        ar: {
          title: 'مجموعة رفوف',
          contact: 'طلب توضيحي • تشطيب فاتح',
        },
        en: {
          title: 'Shelving set',
          contact: 'Sample order • light finish',
        },
        value: 900,
        quantity: 1,
        status: 2,
        priority: 'normal',
        date: '2026-11-04',
        time: '11:00',
      },
      {
        id: 4,
        ar: {
          title: 'تجهيز مكتب',
          contact: 'طلب توضيحي • مقاس مخصص',
        },
        en: {
          title: 'Desk fabrication',
          contact: 'Sample order • custom size',
        },
        value: 1400,
        quantity: 1,
        status: 3,
        priority: 'normal',
        date: '2026-11-05',
        time: '12:00',
      },
    ],
  },
  {
    slug: 'appointments',
    theme: 'blue',
    view: 'agenda',
    measure: 'minutes',
    ar: {
      name: 'إدارة المواعيد وطلبات الحجز',
      brand: 'موعد لتنظيم الخدمات',
      headline: 'مواعيد واضحة، ومتابعة أسهل.',
      audience: 'لمقدمي الخدمات والاستشارات الذين يحتاجون طلب مواعيد ومراجعتها وتأكيدها.',
      recordLabel: 'موعد',
      addLabel: 'موعد جديد',
      valueLabel: 'المدة (دقيقة)',
      totalLabel: 'إجمالي الدقائق المجدولة',
      placeholder: 'استشارة أولية، زيارة خدمة، جلسة متابعة',
      stages: ['طلب موعد', 'مؤكد', 'قيد الخدمة', 'مكتمل'],
      modules: ['طلبات المواعيد', 'تاريخ ووقت كل خدمة', 'التأكيد وإعادة الجدولة', 'ملاحظات الخدمة'],
      benefits: ['تجميع طلبات المواعيد', 'توضيح ما تم تأكيده', 'الاحتفاظ بسياق الزيارة والمتابعة'],
      integrations: ['نموذج الحجز في الموقع', 'تقويم مقدم الخدمة', 'إشعارات التأكيد والتذكير'],
      automation: 'طلب موعد ← التحقق من التوفر ← تأكيد ← تذكير ← تسجيل نتيجة الخدمة.',
    },
    en: {
      name: 'Appointments & booking requests',
      brand: 'MAWED SCHEDULER',
      headline: 'Clear appointments. Easier follow-up.',
      audience: 'For service providers and consultants reviewing and confirming appointments.',
      recordLabel: 'Appointment',
      addLabel: 'New appointment',
      valueLabel: 'Duration (minutes)',
      totalLabel: 'Scheduled minutes',
      placeholder: 'Initial consultation, service visit, follow-up session',
      stages: ['Requested', 'Confirmed', 'In service', 'Completed'],
      modules: [
        'Booking requests',
        'Service date and time',
        'Confirmation and rescheduling',
        'Service notes',
      ],
      benefits: [
        'Collect booking requests',
        'Identify confirmed appointments',
        'Keep service and follow-up context',
      ],
      integrations: [
        'Website booking form',
        'Provider calendar',
        'Confirmation and reminder notifications',
      ],
      automation:
        'Booking request → availability review → confirmation → reminder → service outcome.',
    },
    records: [
      {
        id: 1,
        ar: {
          title: 'استشارة أولية',
          contact: 'زائر ألف • بيانات توضيحية',
        },
        en: {
          title: 'Initial consultation',
          contact: 'Visitor A • sample',
        },
        value: 30,
        quantity: 1,
        status: 0,
        priority: 'normal',
        date: '2026-11-02',
        time: '09:00',
      },
      {
        id: 2,
        ar: {
          title: 'زيارة خدمة',
          contact: 'زائر باء • بيانات توضيحية',
        },
        en: {
          title: 'Service visit',
          contact: 'Visitor B • sample',
        },
        value: 60,
        quantity: 1,
        status: 1,
        priority: 'high',
        date: '2026-11-03',
        time: '10:00',
      },
      {
        id: 3,
        ar: {
          title: 'جلسة متابعة',
          contact: 'زائر جيم • بيانات توضيحية',
        },
        en: {
          title: 'Follow-up session',
          contact: 'Visitor C • sample',
        },
        value: 45,
        quantity: 1,
        status: 2,
        priority: 'normal',
        date: '2026-11-04',
        time: '11:00',
      },
      {
        id: 4,
        ar: {
          title: 'مراجعة احتياج',
          contact: 'زائر دال • بيانات توضيحية',
        },
        en: {
          title: 'Requirements review',
          contact: 'Visitor D • sample',
        },
        value: 30,
        quantity: 1,
        status: 3,
        priority: 'normal',
        date: '2026-11-05',
        time: '12:00',
      },
    ],
  },
  {
    slug: 'inventory',
    theme: 'green',
    view: 'table',
    measure: 'money',
    ar: {
      name: 'متابعة المخزون وحركات الأصناف',
      brand: 'رصيد للمخزون',
      headline: 'اعرف ما لديك، وما يحتاج إلى إعادة طلب.',
      audience: 'للمتاجر والمستودعات الصغيرة التي تحتاج سجل أصناف وحركات إدخال وصرف محدد النطاق.',
      recordLabel: 'صنف',
      addLabel: 'صنف جديد',
      valueLabel: 'قيمة الوحدة التقديرية (ر.س)',
      totalLabel: 'قيمة المخزون التقديرية',
      placeholder: 'صنف، قطعة غيار، مستلزم تشغيل',
      stages: ['متوفر', 'منخفض', 'نفد'],
      modules: [
        'سجل الأصناف والأرصدة',
        'إدخال وصرف الكميات',
        'تصفية الأصناف المنخفضة',
        'سجل الحركات والملاحظات',
      ],
      benefits: [
        'معرفة الرصيد بعد كل حركة',
        'تمييز الكميات المنخفضة',
        'توثيق سبب الإدخال أو الصرف',
      ],
      integrations: ['نقاط البيع بواجهة موثقة', 'طلبات المتجر الإلكتروني', 'المحاسبة والمشتريات'],
      automation:
        'حركة بيع أو توريد معتمدة ← تحديث الرصيد ← تنبيه عند الحد المحدد ← مراجعة إعادة الطلب.',
    },
    en: {
      name: 'Inventory & stock movements',
      brand: 'RASEED INVENTORY',
      headline: 'Know what’s in stock, and what needs reordering.',
      audience: 'For small stores and stockrooms needing a focused item and movement register.',
      recordLabel: 'Item',
      addLabel: 'New item',
      valueLabel: 'Estimated unit value (SAR)',
      totalLabel: 'Estimated stock value',
      placeholder: 'Product, spare part, operating supply',
      stages: ['In stock', 'Low stock', 'Out of stock'],
      modules: [
        'Item and balance register',
        'Receipts and issues',
        'Low-stock filtering',
        'Movement history and notes',
      ],
      benefits: [
        'See balances after movements',
        'Identify low quantities',
        'Record why stock changed',
      ],
      integrations: [
        'POS with a supported API',
        'Online store orders',
        'Accounting and purchasing',
      ],
      automation: 'Approved sale or receipt → balance update → threshold alert → reorder review.',
    },
    records: [
      {
        id: 1,
        ar: {
          title: 'قطعة غيار أ',
          contact: 'SKU-101 • صنف توضيحي',
        },
        en: {
          title: 'Spare part A',
          contact: 'SKU-101 • sample item',
        },
        value: 35,
        quantity: 24,
        status: 0,
        priority: 'normal',
        date: '2026-11-02',
        time: '09:00',
      },
      {
        id: 2,
        ar: {
          title: 'مستلزم تشغيل ب',
          contact: 'SKU-102 • صنف توضيحي',
        },
        en: {
          title: 'Supply B',
          contact: 'SKU-102 • sample item',
        },
        value: 18,
        quantity: 5,
        status: 1,
        priority: 'high',
        date: '2026-11-03',
        time: '10:00',
      },
      {
        id: 3,
        ar: {
          title: 'منتج ج',
          contact: 'SKU-103 • صنف توضيحي',
        },
        en: {
          title: 'Product C',
          contact: 'SKU-103 • sample item',
        },
        value: 70,
        quantity: 0,
        status: 2,
        priority: 'high',
        date: '2026-11-04',
        time: '11:00',
      },
      {
        id: 4,
        ar: {
          title: 'مجموعة د',
          contact: 'SKU-104 • صنف توضيحي',
        },
        en: {
          title: 'Kit D',
          contact: 'SKU-104 • sample item',
        },
        value: 120,
        quantity: 12,
        status: 0,
        priority: 'normal',
        date: '2026-11-05',
        time: '12:00',
      },
    ],
  },
  {
    slug: 'projects-tasks',
    theme: 'rose',
    view: 'board',
    measure: 'hours',
    ar: {
      name: 'إدارة المشاريع والمهام',
      brand: 'خطوة للمشاريع',
      headline: 'حوّل نطاق المشروع إلى مهام قابلة للمتابعة.',
      audience: 'لمقدمي الخدمات والمنشآت التي تنفذ مشاريع صغيرة وتحتاج تنظيم المهام والتسليمات.',
      recordLabel: 'مهمة',
      addLabel: 'مهمة جديدة',
      valueLabel: 'تقدير العمل (ساعات)',
      totalLabel: 'ساعات العمل المفتوحة',
      placeholder: 'مهمة، مراجعة، تسليم مرحلة',
      stages: ['مخطط', 'قيد التنفيذ', 'مراجعة', 'منجز'],
      modules: [
        'لوحة المهام',
        'الأولوية والموعد',
        'تقدير العمل لكل مهمة',
        'ملاحظات وتحديثات التسليم',
      ],
      benefits: [
        'تجزئة العمل إلى خطوات واضحة',
        'تمييز المهام التي تحتاج مراجعة',
        'الاحتفاظ بتاريخ تغييرات الحالة',
      ],
      integrations: ['طلبات العملاء المعتمدة', 'تقويم التسليمات', 'إشعارات تقدم العمل'],
      automation: 'اعتماد نطاق ← إنشاء مهام ← تنفيذ ومراجعة ← اعتماد التسليم ← توثيق الإغلاق.',
    },
    en: {
      name: 'Projects & task management',
      brand: 'KHUTWA PROJECTS',
      headline: 'Turn project scope into trackable work.',
      audience:
        'For service businesses delivering small projects and organising tasks and handovers.',
      recordLabel: 'Task',
      addLabel: 'New task',
      valueLabel: 'Work estimate (hours)',
      totalLabel: 'Open work hours',
      placeholder: 'Task, review, milestone delivery',
      stages: ['Planned', 'In progress', 'Review', 'Done'],
      modules: [
        'Task board',
        'Priority and due date',
        'Work estimates',
        'Notes and delivery activity',
      ],
      benefits: [
        'Break work into clear steps',
        'Identify tasks awaiting review',
        'Keep a status change history',
      ],
      integrations: ['Approved customer requests', 'Delivery calendar', 'Progress notifications'],
      automation: 'Approved scope → tasks → implementation and review → handover → closure.',
    },
    records: [
      {
        id: 1,
        ar: {
          title: 'تحديد المتطلبات',
          contact: 'مشروع توضيحي • مرحلة التحضير',
        },
        en: {
          title: 'Define requirements',
          contact: 'Sample project • preparation',
        },
        value: 3,
        quantity: 1,
        status: 0,
        priority: 'normal',
        date: '2026-11-02',
        time: '09:00',
      },
      {
        id: 2,
        ar: {
          title: 'إعداد نموذج الطلب',
          contact: 'مشروع توضيحي • مرحلة التنفيذ',
        },
        en: {
          title: 'Prepare request form',
          contact: 'Sample project • implementation',
        },
        value: 5,
        quantity: 1,
        status: 1,
        priority: 'high',
        date: '2026-11-03',
        time: '10:00',
      },
      {
        id: 3,
        ar: {
          title: 'مراجعة تجربة المستخدم',
          contact: 'مشروع توضيحي • مرحلة المراجعة',
        },
        en: {
          title: 'Review user experience',
          contact: 'Sample project • review',
        },
        value: 2,
        quantity: 1,
        status: 2,
        priority: 'normal',
        date: '2026-11-04',
        time: '11:00',
      },
      {
        id: 4,
        ar: {
          title: 'تسليم الهيكل الأولي',
          contact: 'مشروع توضيحي • تسليم أولي',
        },
        en: {
          title: 'Deliver initial structure',
          contact: 'Sample project • initial handover',
        },
        value: 4,
        quantity: 1,
        status: 3,
        priority: 'normal',
        date: '2026-11-05',
        time: '12:00',
      },
    ],
  },
];
export const findWorkSystem = (slug: string) => workSystems.find((system) => system.slug === slug);
