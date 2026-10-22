import type { Locale } from '@tevoniq/types';
export const serviceLabels: Record<
  Locale,
  {
    title: string;
    intro: string;
    empty: string;
    error: string;
    search: string;
    previous: string;
    next: string;
    back: string;
    contact: string;
    loading: string;
  }
> = {
  en: {
    title: 'Services',
    intro: 'Explore our available technology services.',
    empty: 'No services are currently published in this language.',
    error: 'Services are temporarily unavailable. Please try again later.',
    search: 'Search services',
    previous: 'Previous',
    next: 'Next',
    back: 'All services',
    contact: 'Contact Us',
    loading: 'Loading services',
  },
  tr: {
    title: 'Hizmetler',
    intro: 'Mevcut teknoloji hizmetlerimizi keşfedin.',
    empty: 'Bu dilde henüz yayımlanmış bir hizmet bulunmuyor.',
    error: 'Hizmetlere şu anda ulaşılamıyor. Lütfen daha sonra tekrar deneyin.',
    search: 'Hizmetlerde ara',
    previous: 'Önceki',
    next: 'Sonraki',
    back: 'Tüm hizmetler',
    contact: 'Bize Ulaşın',
    loading: 'Hizmetler yükleniyor',
  },
  ar: {
    title: 'الخدمات',
    intro: 'استكشف خدماتنا التقنية المتاحة.',
    empty: 'لا توجد خدمات منشورة بهذه اللغة حالياً.',
    error: 'الخدمات غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.',
    search: 'البحث في الخدمات',
    previous: 'السابق',
    next: 'التالي',
    back: 'جميع الخدمات',
    contact: 'تواصل معنا',
    loading: 'جارٍ تحميل الخدمات',
  },
};
