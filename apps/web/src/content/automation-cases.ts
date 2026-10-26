export type AutomationLocale = 'ar' | 'en';
export type AutomationSlug =
  | 'lead-capture'
  | 'order-sync'
  | 'appointment-reminders'
  | 'invoice-follow-up'
  | 'stock-alerts'
  | 'daily-summary';
export type AutomationInput = {
  eventId: string;
  email: string;
  description: string;
  amount: number;
  quantity: number;
  stock: number;
  threshold: number;
  approved: boolean;
  consent: boolean;
  paid: boolean;
  dueDate: string;
  referenceDate: string;
  appointmentDate: string;
  orders: string;
};
export type AutomationCopy = {
  name: string;
  headline: string;
  audience: string;
  benefits: string[];
  integrations: string[];
  steps: string[];
  demoNote: string;
};
export type AutomationCase = {
  slug: AutomationSlug;
  theme: string;
  fields: (keyof AutomationInput)[];
  ar: AutomationCopy;
  en: AutomationCopy;
};
export const automationCases: AutomationCase[] = [
  {
    slug: 'lead-capture',
    theme: 'teal',
    fields: ['email', 'description', 'consent'],
    ar: {
      name: 'استقبال الاستفسارات وتنظيم المتابعة',
      headline: 'من نموذج الموقع إلى متابعة واضحة.',
      audience:
        'لمنشآت الخدمات التي تستقبل استفسارات عبر الموقع وتحتاج تسجيلها وتجهيز الرد الأولي.',
      benefits: [
        'جمع بيانات الطلب دون إعادة إدخالها',
        'تجهيز ملخص للمتابعة',
        'احترام اختيار التواصل في المسار',
      ],
      integrations: ['نموذج التواصل في الموقع', 'CRM أو سجل الطلبات', 'البريد عبر حساب معتمد'],
      steps: [
        'استفسار جديد',
        'فحص البيانات',
        'تجهيز سجل المتابعة',
        'تجهيز الرد الأولي',
        'تسجيل النتيجة',
      ],
      demoNote: 'تشغيل النموذج يحضّر سجلًا وردًا توضيحيًا عند تفعيل التواصل؛ لا يرسل بريدًا.',
    },
    en: {
      name: 'Enquiry capture & follow-up',
      headline: 'From a website enquiry to a clear next step.',
      audience: 'For service businesses collecting website enquiries and preparing follow-up.',
      benefits: [
        'Avoid re-entering enquiry data',
        'Prepare a follow-up summary',
        'Respect contact preferences',
      ],
      integrations: [
        'Website contact form',
        'CRM or request register',
        'Email through an authorised account',
      ],
      steps: [
        'New enquiry',
        'Validate details',
        'Prepare follow-up record',
        'Prepare reply draft',
        'Record outcome',
      ],
      demoNote: 'The demo prepares a record and an optional reply draft; it does not send email.',
    },
  },
  {
    slug: 'order-sync',
    theme: 'orange',
    fields: ['email', 'amount', 'quantity', 'stock', 'threshold', 'approved'],
    ar: {
      name: 'ربط الطلب بالمخزون وتجهيز التنفيذ',
      headline: 'طلب واحد، وخطوات مترابطة.',
      audience: 'للمتاجر الصغيرة التي تحتاج فحص توفر المنتجات وتحضير مسار تجهيز الطلب.',
      benefits: [
        'فحص الكمية قبل تجهيز الطلب',
        'إظهار ما يحتاج إلى موافقة',
        'منع إعادة معالجة الطلب نفسه',
      ],
      integrations: [
        'طلبات المتجر الإلكتروني',
        'المخزون بواجهة موثقة',
        'الفواتير والشحن وفق النطاق',
      ],
      steps: ['طلب جديد', 'فحص المخزون', 'مراجعة الموافقة', 'تجهيز التنفيذ', 'تسجيل النتيجة'],
      demoNote:
        'الكميات والقيم افتراضية؛ يُحسب الرصيد المقترح بعد الطلب دون تعديل مخزون فعلي أو إنشاء فاتورة.',
    },
    en: {
      name: 'Order & inventory handoff',
      headline: 'One order. Connected next steps.',
      audience: 'For small stores checking availability and preparing order fulfilment.',
      benefits: [
        'Check quantities before fulfilment',
        'Show approval requirements',
        'Avoid processing the same order twice',
      ],
      integrations: [
        'Online store orders',
        'Inventory with a documented API',
        'Invoicing and shipping within scope',
      ],
      steps: [
        'New order',
        'Check stock',
        'Review approval',
        'Prepare fulfilment',
        'Record outcome',
      ],
      demoNote:
        'Sample quantities and values produce a proposed balance, without changing real inventory or issuing an invoice.',
    },
  },
  {
    slug: 'appointment-reminders',
    theme: 'blue',
    fields: ['email', 'appointmentDate', 'referenceDate', 'consent'],
    ar: {
      name: 'تذكير المواعيد وتجهيز التأكيد',
      headline: 'موعد واضح، وتذكير في وقته.',
      audience: 'لمقدمي الخدمات الذين يريدون تجهيز تذكيرات المواعيد وفق التوفر وتفضيلات التواصل.',
      benefits: ['حساب تاريخ التذكير', 'تجاوز الموعد الماضي', 'احترام تفضيل التواصل'],
      integrations: ['سجل المواعيد', 'التقويم بواجهة معتمدة', 'مزود إشعارات مصرح به'],
      steps: ['موعد مسجل', 'فحص التاريخ', 'مراجعة التواصل', 'تجهيز التذكير', 'تسجيل النتيجة'],
      demoNote:
        'يُحسب التذكير قبل الموعد بيوم. التاريخ المرجعي تختاره للتجربة؛ لا تُجدول رسالة فعلية.',
    },
    en: {
      name: 'Appointment reminder preparation',
      headline: 'A clear appointment. A timely reminder.',
      audience:
        'For service providers preparing reminders around appointment dates and contact preferences.',
      benefits: [
        'Calculate the reminder date',
        'Skip past appointments',
        'Respect contact preferences',
      ],
      integrations: [
        'Appointment register',
        'Calendar through a supported API',
        'Authorised notification provider',
      ],
      steps: [
        'Appointment event',
        'Check date',
        'Review contact preference',
        'Prepare reminder',
        'Record outcome',
      ],
      demoNote:
        'The reminder is prepared one day before the appointment. You choose the reference date; no real message is scheduled.',
    },
  },
  {
    slug: 'invoice-follow-up',
    theme: 'violet',
    fields: [
      'email',
      'amount',
      'dueDate',
      'referenceDate',
      'threshold',
      'paid',
      'consent',
      'approved',
    ],
    ar: {
      name: 'تنظيم متابعة الفواتير المستحقة',
      headline: 'متابعة مدروسة، قبل أي رسالة.',
      audience: 'لمنشآت الخدمات التي تحتاج تجهيز متابعة الفواتير المستحقة ومراجعتها قبل التواصل.',
      benefits: [
        'تجاوز الفواتير المدفوعة',
        'فحص تاريخ الاستحقاق',
        'طلب موافقة للقيم التي تتجاوز الحد المحدد',
      ],
      integrations: ['برنامج الفواتير بواجهة موثقة', 'سجل العملاء', 'البريد أو الإشعارات المعتمدة'],
      steps: [
        'فاتورة مسجلة',
        'فحص الاستحقاق',
        'مراجعة الموافقة',
        'تجهيز المتابعة',
        'تسجيل النتيجة',
      ],
      demoNote: 'النموذج يحضّر مسودة متابعة فقط؛ لا يعدّل الفاتورة أو يحصّل أموالًا أو يرسل رسائل.',
    },
    en: {
      name: 'Due-invoice follow-up',
      headline: 'Review the next step before sending a message.',
      audience: 'For service businesses preparing and reviewing follow-up for due invoices.',
      benefits: [
        'Skip paid invoices',
        'Check the due date',
        'Require approval above a configured amount',
      ],
      integrations: [
        'Invoice software with a documented API',
        'Customer register',
        'Authorised email or notifications',
      ],
      steps: [
        'Invoice event',
        'Check due status',
        'Review approval',
        'Prepare follow-up',
        'Record outcome',
      ],
      demoNote:
        'This prepares a follow-up draft only; it does not change invoices, collect money or send messages.',
    },
  },
  {
    slug: 'stock-alerts',
    theme: 'green',
    fields: ['stock', 'threshold', 'approved'],
    ar: {
      name: 'تنبيه نقص المخزون وطلب المراجعة',
      headline: 'اعرف ما يحتاج إلى إعادة طلب.',
      audience: 'للمتاجر والمستودعات الصغيرة التي تحتاج مراجعة الأصناف عند الوصول إلى الحد المحدد.',
      benefits: [
        'فحص الرصيد مقابل حد التنبيه',
        'تجاوز الأصناف ذات الرصيد الكافي',
        'تجهيز طلب مراجعة قبل الشراء',
      ],
      integrations: [
        'المخزون أو نقاط البيع بواجهة موثقة',
        'سجل المشتريات',
        'البريد أو لوحة الطلبات',
      ],
      steps: [
        'قراءة الرصيد',
        'فحص حد التنبيه',
        'موافقة المراجعة',
        'تجهيز طلب مراجعة',
        'تسجيل النتيجة',
      ],
      demoNote: 'اقتراح الكمية حساب توضيحي قابل للتخصيص، وليس أمر شراء أو تعديلًا للمخزون.',
    },
    en: {
      name: 'Low-stock alert & review',
      headline: 'Know what needs a reorder review.',
      audience: 'For small stores and stockrooms reviewing items at a configured threshold.',
      benefits: [
        'Compare balance with the alert threshold',
        'Skip adequately stocked items',
        'Prepare a review before purchasing',
      ],
      integrations: [
        'Inventory or POS with a documented API',
        'Purchasing register',
        'Email or request board',
      ],
      steps: [
        'Read balance',
        'Check threshold',
        'Review approval',
        'Prepare review request',
        'Record outcome',
      ],
      demoNote:
        'The proposed quantity is an adjustable demo calculation, not a purchase order or inventory update.',
    },
  },
  {
    slug: 'daily-summary',
    theme: 'rose',
    fields: ['orders', 'referenceDate'],
    ar: {
      name: 'تجميع ملخص الطلبات اليومي',
      headline: 'صورة أوضح، من بيانات متفرقة.',
      audience: 'لأصحاب المنشآت الذين يحتاجون ملخصًا تشغيليًا من سجلات طلبات محددة.',
      benefits: ['تجميع عدد الطلبات وقيمتها', 'منع احتساب الرقم نفسه مرتين', 'تجهيز ملخص للمراجعة'],
      integrations: [
        'سجلات الطلبات بواجهة موثقة',
        'ملف بيانات متفق عليه',
        'البريد أو لوحة المتابعة',
      ],
      steps: [
        'سجلات الطلبات',
        'فحص التكرار والقيم',
        'تجميع البيانات',
        'تجهيز الملخص',
        'تسجيل النتيجة',
      ],
      demoNote:
        'أدخل رقم الطلب وقيمته في كل سطر. الملخص تشغيلي توضيحي ولا يمثل تقريرًا محاسبيًا معتمدًا.',
    },
    en: {
      name: 'Daily order summary',
      headline: 'A clearer view from separate records.',
      audience: 'For owners preparing an operational summary from a defined set of orders.',
      benefits: [
        'Aggregate order count and value',
        'Avoid counting duplicate order IDs',
        'Prepare a reviewable summary',
      ],
      integrations: [
        'Order records through a documented API',
        'Agreed data file',
        'Email or management dashboard',
      ],
      steps: [
        'Order records',
        'Check IDs and values',
        'Aggregate data',
        'Prepare summary',
        'Record outcome',
      ],
      demoNote:
        'Enter an order ID and amount on each line. This is an illustrative operational summary, not an approved accounting report.',
    },
  },
];
export const findAutomationCase = (slug: string) =>
  automationCases.find((item) => item.slug === slug);
export function defaultAutomationInput(slug?: AutomationSlug): AutomationInput {
  return {
    eventId: 'DEMO-1001',
    email: 'visitor@example.com',
    description: 'طلب توضيحي / Sample enquiry',
    amount: 1200,
    quantity: 2,
    stock: 5,
    threshold: slug === 'stock-alerts' ? 10 : 1000,
    approved: false,
    consent: true,
    paid: false,
    dueDate: '2026-11-01',
    referenceDate: '2026-11-02',
    appointmentDate: '2026-11-05',
    orders: 'ORD-101,125\nORD-102,240\nORD-103,350',
  };
}
