import { approvedArabicHero, approvedArabicValues } from './home-presentation.ts';
import type { Locale } from '@tevoniq/types';
export const referenceHeroCopy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    accent: string;
    body: string;
    start: string;
    watch: string;
    unavailable: string;
    close: string;
    contact: string;
    values: { title: string; body: string }[];
  }
> = {
  en: {
    eyebrow: 'TECHNOLOGY FOR A BRIGHTER TOMORROW',
    title: 'Premium Technology',
    accent: 'for a Smarter Tomorrow',
    body: 'TEVONIQ delivers innovative technology solutions that connect people, businesses and a brighter future. Built for a more intelligent, secure and sustainable world.',
    start: 'Get Started',
    watch: 'Watch Video',
    unavailable: 'The TEVONIQ introduction video has not been provided yet.',
    close: 'Close',
    contact: 'Contact Us',
    values: [
      { title: 'People', body: 'Stronger Together' },
      { title: 'Technology', body: 'Drives Progress' },
      { title: 'A Better Tomorrow', body: 'For a Brighter World' },
    ],
  },
  tr: {
    eyebrow: 'DAHA AYDINLIK BİR YARIN İÇİN TEKNOLOJİ',
    title: 'Üstün Teknoloji',
    accent: 'Daha Akıllı Bir Yarın İçin',
    body: 'TEVONIQ; insanları, işletmeleri ve daha aydınlık bir geleceği birbirine bağlayan yenilikçi teknoloji çözümleri sunar. Daha akıllı, güvenli ve sürdürülebilir bir dünya için.',
    start: 'Başlayın',
    watch: 'Videoyu İzleyin',
    unavailable: 'TEVONIQ tanıtım videosu henüz sağlanmadı.',
    close: 'Kapat',
    contact: 'Bize Ulaşın',
    values: [
      { title: 'İnsan', body: 'Birlikte Daha Güçlü' },
      { title: 'Teknoloji', body: 'İlerlemeye Yön Verir' },
      { title: 'Daha İyi Bir Yarın', body: 'Daha Aydınlık Bir Dünya İçin' },
    ],
  },
  ar: {
    ...approvedArabicHero,
    start: 'ابدأ الآن',
    watch: 'شاهد الفيديو',
    unavailable: 'لم يتم توفير الفيديو التعريفي لشركة TEVONIQ بعد.',
    close: 'إغلاق',
    contact: 'تواصل معنا',
    values: approvedArabicValues,
  },
};
