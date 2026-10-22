import type { Locale } from '@tevoniq/types';

export type HomeCopy = {
  eyebrow: string;
  headline: string;
  accent: string;
  introduction: string;
  explore: string;
  contact: string;
  capabilityLabel: string;
  capabilityTitle: string;
  capabilityBody: string;
  pillars: string[];
  solutionsLabel: string;
  solutionsTitle: string;
  solutions: { title: string; description: string }[];
  technologiesLabel: string;
  technologiesTitle: string;
  technologies: string[];
  whyLabel: string;
  whyTitle: string;
  values: string[];
  industries: string;
  projects: string;
  partners: string;
  insights: string;
  cta: string;
  ctaBody: string;
  footer: string;
  rights: string;
};
/** Editorial bootstrap based on the owner's brief. Replace through the CMS adapter. */
export const homeCopy: Record<Locale, HomeCopy> = {
  en: {
    eyebrow: 'PREMIUM TECHNOLOGY',
    headline: 'Premium Technology',
    accent: 'for a Smarter Tomorrow',
    introduction:
      'TEVONIQ delivers advanced technology solutions designed to connect, secure, automate and transform modern businesses.',
    explore: 'Explore Solutions',
    contact: 'Contact Us',
    capabilityLabel: 'CONNECTED THINKING',
    capabilityTitle: 'One vision. Every layer of technology.',
    capabilityBody:
      'TEVONIQ brings together software, infrastructure and intelligent systems. A multi-disciplinary approach connects the technologies your business needs into a coherent whole.',
    pillars: ['Connect', 'Secure', 'Automate', 'Transform'],
    solutionsLabel: 'CORE SOLUTIONS',
    solutionsTitle: 'Technology built around your business.',
    solutions: [
      {
        title: 'Artificial Intelligence',
        description: 'Put data to work through intelligent applications and purposeful automation.',
      },
      {
        title: 'Cloud Solutions',
        description:
          'Shape flexible cloud environments around your workloads and operational needs.',
      },
      {
        title: 'Cybersecurity',
        description:
          'Build protection into your infrastructure, applications and everyday operations.',
      },
      {
        title: 'System Integration',
        description:
          'Connect platforms, processes and information across your technology environment.',
      },
      {
        title: 'Software Development',
        description: 'Create considered digital products around real business requirements.',
      },
      {
        title: 'Network Infrastructure',
        description:
          'Build the connectivity that brings your people, locations and systems together.',
      },
    ],
    technologiesLabel: 'A BROADER PERSPECTIVE',
    technologiesTitle: 'The right technologies. Working together.',
    technologies: [
      'Web & Mobile Development',
      'Managed IT Services',
      'ERP & CRM',
      'Automation',
      'IoT',
      'Data Infrastructure',
      'Digital Signage',
      'Audiovisual Systems',
      'Security Systems',
    ],
    whyLabel: 'WHY TEVONIQ',
    whyTitle: 'A considered approach. From the first conversation onward.',
    values: [
      'Premium Quality',
      'Engineering Expertise',
      'Innovative Mindset',
      'Security First',
      'Business Focus',
      'Long-Term Support',
    ],
    industries: 'Industries served',
    projects: 'Featured projects',
    partners: 'Technology partners',
    insights: 'Latest insights',
    cta: 'Let’s Build a Smarter Tomorrow',
    ctaBody: 'Start with your ambition. Together, we can define the technology to move it forward.',
    footer: 'Technology for a smarter tomorrow.',
    rights: 'All rights reserved.',
  },
  tr: {
    eyebrow: 'PREMIUM TECHNOLOGY',
    headline: 'Üstün Teknoloji',
    accent: 'Daha Akıllı Bir Yarın İçin',
    introduction:
      'TEVONIQ, modern işletmeleri birbirine bağlamak, korumak, otomatikleştirmek ve dönüştürmek için gelişmiş teknoloji çözümleri sunar.',
    explore: 'Çözümleri Keşfedin',
    contact: 'Bize Ulaşın',
    capabilityLabel: 'BÜTÜNSEL DÜŞÜNCE',
    capabilityTitle: 'Tek vizyon. Teknolojinin her katmanında.',
    capabilityBody:
      'TEVONIQ; yazılım, altyapı ve akıllı sistemleri bir araya getirir. Disiplinler arası yaklaşımımız, işletmenizin ihtiyaç duyduğu teknolojileri uyumlu bir bütüne dönüştürür.',
    pillars: ['Bağlan', 'Koru', 'Otomatikleştir', 'Dönüştür'],
    solutionsLabel: 'TEMEL ÇÖZÜMLER',
    solutionsTitle: 'İşletmenizin ihtiyaçlarına göre şekillenen teknoloji.',
    solutions: [
      {
        title: 'Yapay Zekâ',
        description: 'Akıllı uygulamalar ve amaca yönelik otomasyonla veriyi değere dönüştürün.',
      },
      {
        title: 'Bulut Çözümleri',
        description:
          'İş yüklerinize ve operasyonel ihtiyaçlarınıza uygun esnek bulut ortamları oluşturun.',
      },
      {
        title: 'Siber Güvenlik',
        description:
          'Altyapınızda, uygulamalarınızda ve günlük operasyonlarınızda güvenliği temel alın.',
      },
      {
        title: 'Sistem Entegrasyonu',
        description:
          'Teknoloji ortamınızdaki platformları, süreçleri ve bilgileri birbirine bağlayın.',
      },
      {
        title: 'Yazılım Geliştirme',
        description:
          'Gerçek iş ihtiyaçları etrafında özenle tasarlanmış dijital ürünler oluşturun.',
      },
      {
        title: 'Ağ Altyapısı',
        description:
          'İnsanlarınızı, lokasyonlarınızı ve sistemlerinizi bir araya getiren bağlantıyı kurun.',
      },
    ],
    technologiesLabel: 'DAHA GENİŞ BİR BAKIŞ',
    technologiesTitle: 'Doğru teknolojiler. Birlikte çalışır.',
    technologies: [
      'Web ve Mobil Geliştirme',
      'Yönetilen BT Hizmetleri',
      'ERP ve CRM',
      'Otomasyon',
      'IoT',
      'Veri Altyapısı',
      'Dijital Ekran Sistemleri',
      'Görsel-İşitsel Sistemler',
      'Güvenlik Sistemleri',
    ],
    whyLabel: 'NEDEN TEVONIQ',
    whyTitle: 'İlk görüşmeden itibaren özenli bir yaklaşım.',
    values: [
      'Üstün Kalite',
      'Mühendislik Uzmanlığı',
      'Yenilikçi Bakış',
      'Önce Güvenlik',
      'İş Odaklılık',
      'Uzun Vadeli Destek',
    ],
    industries: 'Hizmet verilen sektörler',
    projects: 'Öne çıkan projeler',
    partners: 'Teknoloji iş ortakları',
    insights: 'Son içerikler',
    cta: 'Daha Akıllı Bir Yarını Birlikte İnşa Edelim',
    ctaBody: 'Hedefinizle başlayalım. Onu ileriye taşıyacak teknolojiyi birlikte tanımlayabiliriz.',
    footer: 'Daha akıllı bir yarın için teknoloji.',
    rights: 'Tüm hakları saklıdır.',
  },
  ar: {
    eyebrow: 'PREMIUM TECHNOLOGY',
    headline: 'تقنية متقدمة',
    accent: 'لغد أكثر ذكاءً',
    introduction:
      'تقدم TEVONIQ حلولاً تقنية متقدمة مصممة لربط الأعمال الحديثة وتأمينها وأتمتتها وتطويرها.',
    explore: 'استكشف الحلول',
    contact: 'تواصل معنا',
    capabilityLabel: 'رؤية مترابطة',
    capabilityTitle: 'رؤية واحدة. تشمل كل طبقات التقنية.',
    capabilityBody:
      'تجمع TEVONIQ بين البرمجيات والبنية التحتية والأنظمة الذكية. يربط نهجنا متعدد التخصصات التقنيات التي تحتاجها أعمالك في منظومة متكاملة.',
    pillars: ['الربط', 'الحماية', 'الأتمتة', 'التطوير'],
    solutionsLabel: 'الحلول الأساسية',
    solutionsTitle: 'تقنية تتمحور حول أعمالك.',
    solutions: [
      {
        title: 'الذكاء الاصطناعي',
        description: 'وظّف البيانات من خلال تطبيقات ذكية وأتمتة هادفة.',
      },
      {
        title: 'الحلول السحابية',
        description: 'صمّم بيئات سحابية مرنة تناسب أحمال العمل واحتياجات التشغيل.',
      },
      {
        title: 'الأمن السيبراني',
        description: 'اجعل الحماية جزءاً من البنية التحتية والتطبيقات والعمليات اليومية.',
      },
      {
        title: 'تكامل الأنظمة',
        description: 'اربط المنصات والعمليات والمعلومات عبر بيئتك التقنية.',
      },
      {
        title: 'تطوير البرمجيات',
        description: 'أنشئ منتجات رقمية مدروسة تلبي متطلبات العمل الفعلية.',
      },
      {
        title: 'البنية التحتية للشبكات',
        description: 'ابنِ الاتصال الذي يجمع فرقك ومواقعك وأنظمتك.',
      },
    ],
    technologiesLabel: 'منظور أوسع',
    technologiesTitle: 'التقنيات المناسبة تعمل معاً.',
    technologies: [
      'تطوير الويب والجوال',
      'خدمات تقنية المعلومات المُدارة',
      'ERP وCRM',
      'الأتمتة',
      'إنترنت الأشياء',
      'البنية التحتية للبيانات',
      'اللافتات الرقمية',
      'الأنظمة السمعية والبصرية',
      'أنظمة الأمن',
    ],
    whyLabel: 'لماذا TEVONIQ',
    whyTitle: 'نهج مدروس. منذ المحادثة الأولى.',
    values: [
      'جودة متميزة',
      'خبرة هندسية',
      'فكر مبتكر',
      'الأمن أولاً',
      'التركيز على الأعمال',
      'دعم طويل الأمد',
    ],
    industries: 'القطاعات التي نخدمها',
    projects: 'مشاريع مميزة',
    partners: 'شركاء التقنية',
    insights: 'أحدث المقالات والموارد',
    cta: 'لنبنِ معاً غداً أكثر ذكاءً',
    ctaBody: 'لنبدأ بطموحك. معاً يمكننا تحديد التقنية التي تدفعه إلى الأمام.',
    footer: 'تقنية لغد أكثر ذكاءً.',
    rights: 'جميع الحقوق محفوظة.',
  },
};
