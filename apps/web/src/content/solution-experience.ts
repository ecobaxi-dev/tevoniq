import type { Locale } from '@tevoniq/types';

export type SolutionTrack = 'workflow' | 'resilience' | 'experience';
export const solutionTracks: Record<SolutionTrack, readonly string[]> = {
  workflow: ['intelligent-document-workflow', 'business-operations-hub'],
  resilience: ['resilient-hybrid-cloud', 'secure-digital-access'],
  experience: ['connected-retail-operations', 'smart-workplace-experience'],
};
export function solutionTrack(slug: string): SolutionTrack | undefined {
  return (Object.keys(solutionTracks) as SolutionTrack[]).find((key) =>
    solutionTracks[key].includes(slug),
  );
}
export function catalogHref(
  locale: Locale,
  query: { q: string; page: number; featured?: string | undefined; service?: string | undefined },
  featured = query.featured,
  page = query.page,
) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (featured) params.set('featured', featured);
  if (query.service) params.set('service', query.service);
  if (page > 1) params.set('page', String(page));
  return `/${locale}/solutions${params.size ? `?${params}` : ''}#solution-catalog`;
}

export const solutionExperience = {
  ar: {
    headline: 'حلول تبدأ من أعمالك.',
    accent: 'وتربط كل ما تحتاجه.',
    intro:
      'من أتمتة العمليات إلى حماية الأنظمة وربط مساحات العمل؛ استكشف حلولًا تجمع التقنيات المناسبة حول احتياج واضح.',
    browse: 'استكشف الحلول',
    consult: 'ناقش احتياجك معنا',
    principles: ['احتياج واضح', 'أنظمة مترابطة', 'تنفيذ على مراحل'],
    finderEyebrow: 'ابدأ من هدفك',
    finderTitle: 'ما الذي تريد تطويره؟',
    finderHint: 'اختر الأولوية الأقرب إلى أعمالك لتتعرف على الحلول المرتبطة بها.',
    suggested: 'حلول تناسب هذا الاتجاه',
    tracks: {
      workflow: 'أتمتة العمل',
      resilience: 'الحماية والاستمرارية',
      experience: 'تجربة مترابطة',
    },
    trackDescriptions: {
      workflow: 'امنح المستندات والطلبات والموافقات مسارًا أوضح، مع تقليل التنقل بين الأدوات.',
      resilience: 'نظّم الوصول إلى أنظمتك، وخطّط لاستمرار الخدمات واستعادة البيانات عند الحاجة.',
      experience: 'اربط الأشخاص والمواقع والقنوات الرقمية ضمن تجربة عمل متناسقة.',
    },
    catalogEyebrow: 'من التحدي إلى الحل',
    catalogTitle: 'اكتشف ما يناسب أعمالك',
    catalogBody: 'تعرّف على نطاق كل حل، والقدرات التي يجمعها، وطريقة دمجه مع أنظمتك الحالية.',
    searchPlaceholder: 'ابحث عن الأتمتة، السحابة، الوصول…',
    results: 'النتائج',
    noMatches: 'لم نجد حلًا يطابق بحثك. جرّب كلمة أخرى أو اعرض جميع الحلول.',
    retry: 'إعادة المحاولة',
    all: 'جميع الحلول',
    featured: 'المميزة',
    approachEyebrow: 'خطوة واضحة في كل مرحلة',
    approachTitle: 'من الاحتياج إلى منظومة تعمل معًا',
    steps: [
      {
        title: 'نفهم واقع أعمالك',
        body: 'نحدد التحديات والأولويات والأنظمة الحالية والنتائج التي تريد الوصول إليها.',
      },
      {
        title: 'نصمم الحل المناسب',
        body: 'نربط القدرات المطلوبة في نطاق واضح، مع مراعاة الأمان والتكامل وقابلية التطوير.',
      },
      {
        title: 'ننطلق على مراحل',
        body: 'نبدأ بنطاق محدد، ونراجع التقدم، ثم نتوسع مع التوثيق والتدريب وخطة الدعم.',
      },
    ],
    ctaTitle: 'لديك تحدٍّ لا تجده ضمن القائمة؟',
    ctaBody:
      'حدّثنا عن طريقة عملك وما تريد تحسينه. نبدأ بفهم الاحتياج، ثم نناقش التقنيات المناسبة له.',
    ctaAction: 'لنحدد خطوتك التالية',
    services: 'تعرّف على خدماتنا',
    inSolution: 'استكشف هذا الحل',
    back: 'جميع الحلول',
  },
  en: {
    headline: 'Built around your business.',
    accent: 'Connected where it matters.',
    intro:
      'From workflow automation to resilient systems and connected workplaces, explore technology brought together around a clear business need.',
    browse: 'Explore solutions',
    consult: 'Discuss your needs',
    principles: ['A clear business need', 'Connected systems', 'Delivery in stages'],
    finderEyebrow: 'START WITH YOUR GOAL',
    finderTitle: 'What would you like to improve?',
    finderHint:
      'Choose the priority closest to your business to explore a relevant starting point.',
    suggested: 'Solutions for this direction',
    tracks: {
      workflow: 'Automate work',
      resilience: 'Protect & sustain',
      experience: 'Connect experiences',
    },
    trackDescriptions: {
      workflow:
        'Give documents, requests and approvals a clearer path, with less switching between tools.',
      resilience:
        'Organize access to your systems and plan for service continuity and data recovery.',
      experience:
        'Bring people, locations and digital channels into a more coherent working experience.',
    },
    catalogEyebrow: 'FROM CHALLENGE TO SOLUTION',
    catalogTitle: 'Find a fit for your business',
    catalogBody:
      'Explore each solution’s scope, the capabilities it connects and how it can fit your existing systems.',
    searchPlaceholder: 'Search automation, cloud, access…',
    results: 'Results',
    noMatches: 'No solutions match your search. Try another term or explore all solutions.',
    retry: 'Try again',
    all: 'All solutions',
    featured: 'Featured',
    approachEyebrow: 'A CLEAR NEXT STEP',
    approachTitle: 'From a business need to connected delivery',
    steps: [
      {
        title: 'Understand your context',
        body: 'Identify the challenges, priorities, existing systems and outcomes that matter to your organization.',
      },
      {
        title: 'Shape the right solution',
        body: 'Connect the capabilities you need in a clear scope, considering security, integration and room to evolve.',
      },
      {
        title: 'Deliver in stages',
        body: 'Start with a focused scope, review progress and expand with documentation, training and a support plan.',
      },
    ],
    ctaTitle: 'Working on a challenge beyond this list?',
    ctaBody:
      'Tell us how your business works and what you want to improve. We start with the need, then discuss the technology that fits.',
    ctaAction: 'Define your next step',
    services: 'Explore our services',
    inSolution: 'Explore this solution',
    back: 'All solutions',
  },
  tr: {
    headline: 'İşletmenize göre şekillenen çözümler.',
    accent: 'İhtiyaç duyduğunuz yerde bağlantı.',
    intro:
      'İş akışı otomasyonundan dayanıklı sistemlere ve bağlantılı çalışma alanlarına kadar, belirli bir iş ihtiyacı etrafında birleşen teknolojileri keşfedin.',
    browse: 'Çözümleri keşfedin',
    consult: 'İhtiyaçlarınızı görüşelim',
    principles: ['Net bir iş ihtiyacı', 'Bağlantılı sistemler', 'Aşamalı uygulama'],
    finderEyebrow: 'HEDEFİNİZLE BAŞLAYIN',
    finderTitle: 'Neyi geliştirmek istiyorsunuz?',
    finderHint: 'Uygun bir başlangıç noktası bulmak için işletmenize en yakın önceliği seçin.',
    suggested: 'Bu hedefe uygun çözümler',
    tracks: {
      workflow: 'İşleri otomatikleştirin',
      resilience: 'Koruyun ve sürdürün',
      experience: 'Deneyimleri bağlayın',
    },
    trackDescriptions: {
      workflow:
        'Belgeler, talepler ve onaylar için araçlar arasında daha az geçişle daha net bir yol oluşturun.',
      resilience: 'Sistem erişimini düzenleyin; hizmet sürekliliğini ve veri kurtarmayı planlayın.',
      experience:
        'İnsanları, lokasyonları ve dijital kanalları tutarlı bir çalışma deneyiminde birleştirin.',
    },
    catalogEyebrow: 'İHTİYAÇTAN ÇÖZÜME',
    catalogTitle: 'İşletmenize uygun çözümü bulun',
    catalogBody:
      'Her çözümün kapsamını, birleştirdiği yetkinlikleri ve mevcut sistemlerinize nasıl uyabileceğini keşfedin.',
    searchPlaceholder: 'Otomasyon, bulut, erişim arayın…',
    results: 'Sonuçlar',
    noMatches:
      'Aramanızla eşleşen çözüm bulunamadı. Başka bir kelime deneyin veya tüm çözümleri inceleyin.',
    retry: 'Tekrar deneyin',
    all: 'Tüm çözümler',
    featured: 'Öne çıkanlar',
    approachEyebrow: 'HER AŞAMADA NETLİK',
    approachTitle: 'İş ihtiyacından bağlantılı uygulamaya',
    steps: [
      {
        title: 'Mevcut durumu anlayalım',
        body: 'Kuruluşunuz için önemli sorunları, öncelikleri, mevcut sistemleri ve hedefleri belirleyelim.',
      },
      {
        title: 'Uygun çözümü tasarlayalım',
        body: 'Güvenlik, entegrasyon ve gelişimi dikkate alarak gerekli yetkinlikleri net bir kapsamda birleştirelim.',
      },
      {
        title: 'Aşamalar halinde ilerleyelim',
        body: 'Odaklı kapsamla başlayalım; ilerlemeyi değerlendirelim ve dokümantasyon, eğitim ve destek planıyla genişletelim.',
      },
    ],
    ctaTitle: 'Bu listenin ötesinde bir ihtiyacınız mı var?',
    ctaBody:
      'İşletmenizin nasıl çalıştığını ve neyi geliştirmek istediğinizi anlatın. Önce ihtiyacı anlayalım, ardından uygun teknolojiyi görüşelim.',
    ctaAction: 'Sonraki adımı belirleyelim',
    services: 'Hizmetlerimizi keşfedin',
    inSolution: 'Bu çözümü keşfedin',
    back: 'Tüm çözümler',
  },
} satisfies Record<
  Locale,
  {
    headline: string;
    accent: string;
    intro: string;
    browse: string;
    consult: string;
    principles: string[];
    finderEyebrow: string;
    finderTitle: string;
    finderHint: string;
    suggested: string;
    tracks: Record<SolutionTrack, string>;
    trackDescriptions: Record<SolutionTrack, string>;
    catalogEyebrow: string;
    catalogTitle: string;
    catalogBody: string;
    searchPlaceholder: string;
    results: string;
    noMatches: string;
    retry: string;
    all: string;
    featured: string;
    approachEyebrow: string;
    approachTitle: string;
    steps: { title: string; body: string }[];
    ctaTitle: string;
    ctaBody: string;
    ctaAction: string;
    services: string;
    inSolution: string;
    back: string;
  }
>;
