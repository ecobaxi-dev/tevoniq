export type DesignLocale = 'ar' | 'en';
export type WebsiteDesign = {
  slug: string;
  sector: string;
  image: string;
  accent: string;
  ar: DesignCopy;
  en: DesignCopy;
};
type DesignCopy = {
  name: string;
  brand: string;
  headline: string;
  summary: string;
  audience: string;
  pages: string[];
  benefits: string[];
  integrations: string[];
  automation: string;
  selling: string;
  items: string[];
  categories: string[];
};
export const websiteDesigns: WebsiteDesign[] = [
  {
    slug: 'furniture-atelier',
    sector: 'furniture',
    image: 'furniture',
    accent: '#ae126a',
    ar: {
      name: 'معرض الأثاث والتصميم حسب الطلب',
      brand: 'لِين للأثاث',
      headline: 'مساحتك، على ذوقك.',
      summary: 'كتالوج بصري للأثاث يجمع التصفح والشراء وطلب تصميم يناسب مساحة العميل.',
      audience: 'معارض الأثاث وورش التصنيع والديكور الداخلي.',
      pages: [
        'الرئيسية والإلهام',
        'التصنيفات والمنتجات',
        'تفاصيل المنتج والمقاسات',
        'التصميم حسب الطلب',
        'السلة والتواصل',
      ],
      benefits: [
        'عرض الخامات والمقاسات قبل التواصل',
        'جمع طلبات التصنيع في نموذج منظم',
        'تسهيل اكتشاف القطع المتناسقة',
      ],
      integrations: [
        'المخزون ونقاط البيع عبر واجهة ربط موثقة',
        'إدارة طلبات التصنيع',
        'بوابة الدفع وخدمة الشحن',
      ],
      automation: 'اختيار المقاس والخامة ← طلب موحد ← مراجعة السعر ← إشعار العميل بحالة التصنيع.',
      selling: 'بيع مباشر للقطع الجاهزة؛ أما التصنيع الخاص فيبدأ بعرض سعر معتمد.',
      items: ['جلسة هادئة', 'زاوية طبيعية', 'مجموعة المساحة الصغيرة'],
      categories: ['الكل', 'غرف المعيشة', 'تصميم خاص'],
    },
    en: {
      name: 'Furniture & bespoke interiors',
      brand: 'LEEN LIVING',
      headline: 'Your space. Your way.',
      summary: 'A visual furniture catalogue with shopping and made-to-measure enquiries.',
      audience: 'Furniture showrooms, makers and interior studios.',
      pages: [
        'Home & inspiration',
        'Collections',
        'Product & dimensions',
        'Made to measure',
        'Basket & contact',
      ],
      benefits: [
        'Show materials before an enquiry',
        'Collect structured custom requests',
        'Help shoppers discover matching pieces',
      ],
      integrations: [
        'Inventory and POS through a documented API',
        'Production order management',
        'Payment and delivery providers',
      ],
      automation:
        'Choose dimensions and material → structured enquiry → approved quote → production updates.',
      selling: 'Direct sales for ready-made pieces; bespoke work starts with an approved quote.',
      items: ['Quiet living', 'Natural corner', 'Small-space collection'],
      categories: ['All', 'Living rooms', 'Bespoke'],
    },
  },
  {
    slug: 'retail-store',
    sector: 'retail',
    image: 'retail',
    accent: '#c86628',
    ar: {
      name: 'متجر تجاري متعدد المنتجات',
      brand: 'رِواق ستور',
      headline: 'اختيارات تستحق مكانها في يومك.',
      summary: 'متجر واضح وسريع يعرض المنتجات والتصنيفات ويقرب العميل من قرار الشراء.',
      audience: 'المتاجر المحلية والعلامات التجارية الصغيرة.',
      pages: ['واجهة المتجر', 'التصنيفات', 'المنتج', 'السلة والدفع', 'الشحن والاستبدال'],
      benefits: [
        'البيع خارج ساعات العمل',
        'توضيح السعر وخيارات المنتج',
        'تقليل الأسئلة المتكررة عن التوفر',
      ],
      integrations: ['نظام المخزون', 'المحاسبة والفواتير', 'الدفع والشحن'],
      automation: 'طلب جديد ← التحقق من المخزون ← تأكيد الدفع ← تجهيز الشحنة وإشعار العميل.',
      selling: 'يدعم تنفيذ متجر كامل بعد ربط المخزون والدفع والشحن واعتماد السياسات.',
      items: ['مجموعة يومية', 'تفاصيل مختارة', 'إصدار الموسم'],
      categories: ['الكل', 'اليومي', 'الموسمي'],
    },
    en: {
      name: 'Multi-product retail store',
      brand: 'RIWAQ STORE',
      headline: 'Good finds. Everyday living.',
      summary: 'A clear storefront that moves visitors from collections to a basket.',
      audience: 'Independent retailers and small consumer brands.',
      pages: ['Storefront', 'Collections', 'Product', 'Basket & checkout', 'Delivery & returns'],
      benefits: [
        'Sell outside opening hours',
        'Explain price and variants',
        'Reduce stock enquiries',
      ],
      integrations: ['Inventory', 'Accounting & invoices', 'Payments & delivery'],
      automation: 'New order → stock check → payment confirmation → fulfilment update.',
      selling:
        'A full store requires live inventory, payment, shipping and approved store policies.',
      items: ['Everyday edit', 'Selected details', 'Seasonal collection'],
      categories: ['All', 'Everyday', 'Seasonal'],
    },
  },
  {
    slug: 'industrial',
    sector: 'industrial',
    image: 'industrial',
    accent: '#ee783c',
    ar: {
      name: 'موقع المصنع والمورد الصناعي',
      brand: 'ركائز للصناعة',
      headline: 'قدراتك الصناعية، بصورة واضحة.',
      summary: 'واجهة احترافية لعرض القدرات الفنية والمنتجات وجمع طلبات عروض الأسعار.',
      audience: 'المصانع والورش والموردون بين الشركات.',
      pages: ['المصنع', 'القدرات وخطوط الإنتاج', 'كتالوج المنتجات', 'طلب عرض سعر', 'التواصل'],
      benefits: [
        'توضيح نطاق التصنيع',
        'جمع المواصفات والكميات مبكرًا',
        'تسهيل مقارنة المنتجات الفنية',
      ],
      integrations: [
        'إدارة علاقات العملاء CRM',
        'المخزون وتخطيط الطلبات',
        'البريد وإدارة عروض الأسعار',
      ],
      automation: 'اختيار المنتج والكمية ← تسجيل فرصة بيع ← مراجعة المواصفات ← متابعة العرض.',
      selling: 'طلب عرض سعر للطلبات الفنية؛ ويمكن إضافة شراء مباشر للمنتجات ذات الأسعار الثابتة.',
      items: ['تصنيع القطع', 'تجهيز خطوط العمل', 'توريد المكونات'],
      categories: ['الكل', 'التصنيع', 'التوريد'],
    },
    en: {
      name: 'Manufacturing & supply',
      brand: 'RAKAIZ INDUSTRIES',
      headline: 'Make your capability visible.',
      summary:
        'An industrial website that presents capabilities and captures qualified quote requests.',
      audience: 'Manufacturers, workshops and B2B suppliers.',
      pages: ['Company', 'Capabilities', 'Product catalogue', 'Request a quote', 'Contact'],
      benefits: [
        'Explain manufacturing scope',
        'Collect specifications early',
        'Make technical products comparable',
      ],
      integrations: ['CRM', 'Inventory & order planning', 'Email & quotation management'],
      automation:
        'Product and quantity → sales opportunity → specification review → quote follow-up.',
      selling: 'Quote-led for technical orders; fixed-price products can support direct sales.',
      items: ['Component manufacturing', 'Production systems', 'Industrial supply'],
      categories: ['All', 'Manufacturing', 'Supply'],
    },
  },
  {
    slug: 'real-estate',
    sector: 'property',
    image: 'property',
    accent: '#af8655',
    ar: {
      name: 'معرض العقارات وحجز المعاينات',
      brand: 'أُفق للعقارات',
      headline: 'المكان الذي تبدأ منه خطوتك القادمة.',
      summary: 'عروض عقارية قابلة للتصفية مع تفاصيل واضحة ومسار لحجز المعاينة.',
      audience: 'المكاتب العقارية ومسوقو المشروعات الصغيرة.',
      pages: ['الرئيسية', 'العقارات والبحث', 'تفاصيل العقار', 'حجز المعاينة', 'عن المكتب'],
      benefits: [
        'اختصار البحث بالتصنيفات',
        'جمع اهتمام العميل بعقار محدد',
        'تنظيم مواعيد المعاينات',
      ],
      integrations: ['CRM العقاري', 'التقويم والمواعيد', 'مصدر بيانات العقارات'],
      automation: 'اختيار عقار ← طلب معاينة ← مراجعة الموعد ← تذكير ومتابعة الاهتمام.',
      selling: 'المسار الأساسي هو الاستفسار والمعاينة؛ الحجز المدفوع يحتاج شروطًا وإجراءات معتمدة.',
      items: ['فيلا بإطلالة مفتوحة', 'منزل بتفاصيل معاصرة', 'مساحة للعمل والحياة'],
      categories: ['الكل', 'فلل', 'شقق'],
    },
    en: {
      name: 'Property listings & viewings',
      brand: 'OFUQ ESTATES',
      headline: 'Find the place for your next chapter.',
      summary: 'Filterable property listings with a clear path to a viewing request.',
      audience: 'Property offices and independent developers.',
      pages: ['Home', 'Property search', 'Property details', 'Book a viewing', 'About'],
      benefits: [
        'Narrow the search',
        'Capture property-specific interest',
        'Organise viewing requests',
      ],
      integrations: ['Property CRM', 'Calendar', 'Property data feed'],
      automation:
        'Select property → viewing request → confirm availability → reminder and follow-up.',
      selling:
        'Enquiries and viewings first; paid reservations need approved terms and procedures.',
      items: ['Open-view villa', 'Contemporary home', 'Room for everyday life'],
      categories: ['All', 'Villas', 'Apartments'],
    },
  },
  {
    slug: 'agriculture',
    sector: 'agriculture',
    image: 'farm',
    accent: '#527745',
    ar: {
      name: 'موقع المزرعة والمنتجات الزراعية',
      brand: 'نماء',
      headline: 'من الأرض، إلى مائدتك.',
      summary: 'عرض المحاصيل والمواسم واستقبال طلبات الأفراد والموردين والاشتراكات.',
      audience: 'المزارع ومورّدو المنتجات الطازجة والمشاتل.',
      pages: [
        'المزرعة',
        'المحاصيل والمواسم',
        'صناديق المنتجات',
        'طلبات الجملة',
        'التوصيل والتواصل',
      ],
      benefits: [
        'توضيح التوفر الموسمي',
        'استقبال كميات وطلبات محددة',
        'بناء مسار للطلبات المتكررة',
      ],
      integrations: ['المخزون الموسمي', 'إدارة التوصيل', 'الفواتير وطلبات الجملة'],
      automation: 'اختيار الصندوق والكمية ← التحقق من التوفر والمنطقة ← تأكيد الطلب ← خطة التوصيل.',
      selling: 'بيع منتجات وصناديق موسمية بعد ضبط التوفر ومناطق التوصيل وآلية الدفع.',
      items: ['صندوق الموسم', 'اختيار المزرعة', 'طلب التوريد'],
      categories: ['الكل', 'صناديق', 'توريد'],
    },
    en: {
      name: 'Farm & seasonal produce',
      brand: 'NAMAA',
      headline: 'From the land, to your table.',
      summary: 'Seasonal produce, farm boxes and structured wholesale enquiries.',
      audience: 'Farms, fresh produce suppliers and nurseries.',
      pages: ['The farm', 'Seasonal produce', 'Farm boxes', 'Wholesale', 'Delivery & contact'],
      benefits: [
        'Explain seasonal availability',
        'Capture quantities clearly',
        'Support repeat orders',
      ],
      integrations: ['Seasonal inventory', 'Delivery planning', 'Invoices & wholesale orders'],
      automation: 'Box and quantity → availability and area check → confirmation → delivery plan.',
      selling: 'Seasonal online sales require stock, delivery areas and payment configuration.',
      items: ['Seasonal box', 'Farm selection', 'Wholesale supply'],
      categories: ['All', 'Boxes', 'Wholesale'],
    },
  },
  {
    slug: 'business-services',
    sector: 'services',
    image: 'services',
    accent: '#3869c6',
    ar: {
      name: 'موقع الخدمات وحجز المواعيد',
      brand: 'وجهة للخدمات',
      headline: 'خدمتك تبدأ بخطوة بسيطة.',
      summary: 'شرح مفهوم للخدمات والأسعار المبدئية مع طلب موعد أو استشارة.',
      audience: 'مقدمو الخدمات المهنية والصيانة والاستشارات.',
      pages: ['الرئيسية', 'الخدمات', 'تفاصيل الخدمة', 'طلب موعد', 'الأسئلة والتواصل'],
      benefits: [
        'توضيح ما تتضمنه الخدمة',
        'جمع تفاصيل الاحتياج قبل الاتصال',
        'تقليل تشتت طلبات المواعيد',
      ],
      integrations: ['تقويم المواعيد', 'CRM وإدارة الطلبات', 'الفواتير وتذكير المواعيد'],
      automation: 'تحديد الخدمة والوقت ← التحقق من التوفر ← تأكيد الحجز ← تذكير ومتابعة.',
      selling: 'يمكن إضافة حجز مدفوع أو دفعة مقدمة بعد تحديد السياسة وربط بوابة دفع.',
      items: ['استشارة أولية', 'خدمة دورية', 'خطة مخصصة'],
      categories: ['الكل', 'استشارات', 'خدمات دورية'],
    },
    en: {
      name: 'Services & appointment booking',
      brand: 'WIJHA SERVICES',
      headline: 'A simpler first step to better service.',
      summary: 'Clear service information with appointment and consultation requests.',
      audience: 'Professional services, maintenance and consultants.',
      pages: ['Home', 'Services', 'Service details', 'Request an appointment', 'FAQ & contact'],
      benefits: [
        'Explain the scope',
        'Collect requirements before a call',
        'Keep appointment requests organised',
      ],
      integrations: ['Calendar', 'CRM & request management', 'Invoices & reminders'],
      automation:
        'Service and date → availability check → booking confirmation → reminder and follow-up.',
      selling: 'Paid bookings or deposits can be added after policy and payment setup.',
      items: ['Initial consultation', 'Regular service', 'Tailored plan'],
      categories: ['All', 'Consulting', 'Regular services'],
    },
  },
];
export function findWebsiteDesign(slug: string) {
  return websiteDesigns.find((design) => design.slug === slug);
}
export const designImage = (name: string) => `/brand/website-designs/${name}.webp`;
