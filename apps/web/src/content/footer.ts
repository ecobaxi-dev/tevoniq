import type { Locale } from '@tevoniq/types';

export const footerCopy = {
  en: {
    description: 'Technology that connects, secures and transforms your business.',
    newsletter: 'Stay ahead of what’s next.',
    newsletterText: 'Ideas, insights and updates from TEVONIQ. Delivered thoughtfully.',
    eyebrow: 'THE TEVONIQ PERSPECTIVE',
    email: 'Email address',
    placeholder: 'Your email address',
    subscribe: 'Subscribe',
    consent: 'I agree to receive TEVONIQ newsletter emails and may unsubscribe at any time.',
    success: 'If confirmation is needed, check your email to confirm your subscription.',
    error: 'Unable to subscribe. Please try again.',
    unavailable: 'Subscriptions are temporarily unavailable.',
    resources: 'Resources',
    legal: 'Legal',
    contact: 'Contact',
    social: 'Follow TEVONIQ',
    privacy: 'Privacy Policy',
    terms: 'Terms',
    cookies: 'Cookie Policy',
    rights: 'All rights reserved.',
    language: 'Footer language',
    footer: 'Footer navigation',
    contactCta: 'Let’s talk',
  },
  tr: {
    description: 'İşletmenizi bağlayan, koruyan ve dönüştüren teknoloji.',
    newsletter: 'Geleceği yakından takip edin.',
    newsletterText: 'TEVONIQ’dan fikirler, içgörüler ve yenilikler. Özenle seçilmiş içerikler.',
    eyebrow: 'TEVONIQ PERSPEKTİFİ',
    email: 'E-posta adresi',
    placeholder: 'E-posta adresiniz',
    subscribe: 'Abone olun',
    consent:
      'TEVONIQ bülten e-postalarını almayı kabul ediyorum ve istediğim zaman abonelikten çıkabilirim.',
    success: 'Onay gerekiyorsa aboneliğinizi onaylamak için e-postanızı kontrol edin.',
    error: 'Abone olunamadı. Lütfen tekrar deneyin.',
    unavailable: 'Bülten aboneliği geçici olarak kullanılamıyor.',
    resources: 'Kaynaklar',
    legal: 'Yasal',
    contact: 'İletişim',
    social: 'TEVONIQ’yu takip edin',
    privacy: 'Gizlilik Politikası',
    terms: 'Kullanım Koşulları',
    cookies: 'Çerez Politikası',
    rights: 'Tüm hakları saklıdır.',
    language: 'Alt bilgi dili',
    footer: 'Alt bilgi menüsü',
    contactCta: 'İletişime geçin',
  },
  ar: {
    description: 'تقنية تربط أعمالك وتحميها وتدفعها نحو التحول.',
    newsletter: 'كن على اطلاع بما هو قادم.',
    newsletterText: 'أفكار ورؤى ومستجدات من TEVONIQ. محتوى نختاره بعناية.',
    eyebrow: 'رؤية TEVONIQ',
    email: 'البريد الإلكتروني',
    placeholder: 'عنوان بريدك الإلكتروني',
    subscribe: 'اشترك',
    consent: 'أوافق على تلقي رسائل نشرة TEVONIQ ويمكنني إلغاء الاشتراك في أي وقت.',
    success: 'إذا كان التأكيد مطلوبًا، تحقق من بريدك الإلكتروني لتأكيد اشتراكك.',
    error: 'تعذر الاشتراك. يرجى المحاولة مرة أخرى.',
    unavailable: 'الاشتراك في النشرة غير متاح مؤقتًا.',
    resources: 'الموارد',
    legal: 'المعلومات القانونية',
    contact: 'تواصل معنا',
    social: 'تابع TEVONIQ',
    privacy: 'سياسة الخصوصية',
    terms: 'الشروط والأحكام',
    cookies: 'سياسة ملفات الارتباط',
    rights: 'جميع الحقوق محفوظة.',
    language: 'لغة تذييل الصفحة',
    footer: 'روابط تذييل الصفحة',
    contactCta: 'لنتحدث',
  },
} satisfies Record<Locale, Record<string, string>>;

export function footerHref(locale: Locale, href: string) {
  if (/^https?:\/\//.test(href) || /^\/(en|tr|ar)(\/|$)/.test(href)) return href;
  return `/${locale}${href === '/' ? '' : href}`;
}

export function configuredSocialLinks(value: string) {
  const networks = [
    ['linkedin.com', 'LinkedIn'],
    ['instagram.com', 'Instagram'],
    ['facebook.com', 'Facebook'],
    ['x.com', 'X'],
    ['twitter.com', 'X'],
    ['youtube.com', 'YouTube'],
    ['youtu.be', 'YouTube'],
    ['github.com', 'GitHub'],
  ];
  return [
    ...new Set(
      value
        .split(/\r?\n/)
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ].flatMap((href) => {
    try {
      const url = new URL(href);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return [];
      const host = url.hostname.replace(/^www\./, '');
      const name =
        networks.find(([domain]) => host === domain || host.endsWith('.' + domain))?.[1] || host;
      return [{ href: url.href, name }];
    } catch {
      return [];
    }
  });
}
