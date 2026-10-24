import type { Locale } from '@tevoniq/types';
import { serviceNavigationGroups } from '@/content/service-expansion';
export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  menu?: 'mega' | 'submenu';
  children?: NavigationItem[];
  description?: string;
  groups?: NavigationGroup[];
};
export type NavigationGroup = { id: string; label: string; items: NavigationItem[] };
export type NavigationContent = {
  items: NavigationItem[];
  labels: {
    navigation: string;
    home: string;
    language: string;
    search: string;
    searchPlaceholder: string;
    searchDescription: string;
    noResults: string;
    results: string;
    menu: string;
    menuDescription: string;
    close: string;
    quote: string;
    allSolutions: string;
    allServices: string;
    overview: string;
    back: string;
    skip: string;
    searchHint: string;
    unavailable: string;
  };
};
const localized = {
  en: {
    primary: [
      'Home',
      'Solutions',
      'Services',
      'Industries',
      'Projects',
      'Company',
      'Insights',
      'Contact',
    ],
    company: ['About', 'Why TEVONIQ', 'Team', 'Partners', 'Careers'],
    insights: ['Blog', 'Resources', 'Case Studies'],
    labels: {
      navigation: 'Main navigation',
      home: 'TEVONIQ home',
      language: 'Language',
      search: 'Search',
      searchPlaceholder: 'Search pages…',
      searchDescription: 'Search services, solutions, industries, projects, insights, and pages.',
      noResults: 'No matching pages.',
      results: 'Search results',
      menu: 'Open navigation',
      menuDescription: 'Explore TEVONIQ',
      close: 'Close',
      quote: 'Request a Quote',
      allSolutions: 'All solutions',
      allServices: 'All services',
      overview: 'Overview',
      back: 'Back',
      skip: 'Skip to content',
      searchHint: 'Search available pages',
      unavailable: 'Navigation is temporarily unavailable.',
    },
  },
  tr: {
    primary: [
      'Ana Sayfa',
      'Çözümler',
      'Hizmetler',
      'Sektörler',
      'Projeler',
      'Kurumsal',
      'İçerikler',
      'İletişim',
    ],
    company: ['Hakkımızda', 'Neden TEVONIQ', 'Ekibimiz', 'İş Ortakları', 'Kariyer'],
    insights: ['Blog', 'Kaynaklar', 'Vaka Çalışmaları'],
    labels: {
      navigation: 'Ana menü',
      home: 'TEVONIQ ana sayfa',
      language: 'Dil',
      search: 'Ara',
      searchPlaceholder: 'Sayfalarda ara…',
      searchDescription:
        'Hizmetler, çözümler, sektörler, projeler, içerikler ve sayfalarda arayın.',
      noResults: 'Eşleşen sayfa bulunamadı.',
      results: 'Arama sonuçları',
      menu: 'Menüyü aç',
      menuDescription: 'TEVONIQ’yu keşfedin',
      close: 'Kapat',
      quote: 'Teklif Alın',
      allSolutions: 'Tüm çözümler',
      allServices: 'Tüm hizmetler',
      overview: 'Genel bakış',
      back: 'Geri',
      skip: 'İçeriğe geç',
      searchHint: 'Mevcut sayfalarda ara',
      unavailable: 'Menü geçici olarak kullanılamıyor.',
    },
  },
  ar: {
    primary: [
      'الرئيسية',
      'الحلول',
      'الخدمات',
      'القطاعات',
      'المشاريع',
      'الشركة',
      'المعرفة',
      'اتصل بنا',
    ],
    company: ['من نحن', 'لماذا TEVONIQ', 'فريقنا', 'الشركاء', 'الوظائف'],
    insights: ['المدونة', 'الموارد', 'دراسات الحالة'],
    labels: {
      navigation: 'التنقل الرئيسي',
      home: 'الصفحة الرئيسية لـ TEVONIQ',
      language: 'اللغة',
      search: 'بحث',
      searchPlaceholder: 'ابحث عن صفحة…',
      searchDescription: 'ابحث في الخدمات والحلول والقطاعات والمشاريع والمقالات والصفحات.',
      noResults: 'لا توجد صفحات مطابقة.',
      results: 'نتائج البحث',
      menu: 'فتح القائمة',
      menuDescription: 'استكشف TEVONIQ',
      close: 'إغلاق',
      quote: 'اطلب عرض سعر',
      allSolutions: 'جميع الحلول',
      allServices: 'جميع الخدمات',
      overview: 'نظرة عامة',
      back: 'رجوع',
      skip: 'انتقل إلى المحتوى',
      searchHint: 'البحث في الصفحات المتاحة',
      unavailable: 'قائمة التنقل غير متاحة مؤقتًا.',
    },
  },
} satisfies Record<
  Locale,
  { primary: string[]; company: string[]; insights: string[]; labels: NavigationContent['labels'] }
>;

/** Temporary, user-requested navigation labels. No invented services, partners, or claims.
 * Replace the adapter in lib/navigation.ts with published CMS records when available.
 */
export function getBootstrapNavigation(locale: Locale): NavigationContent {
  const copy = localized[locale];
  const ids = [
    'home',
    'solutions',
    'services',
    'industries',
    'projects',
    'company',
    'insights',
    'contact',
  ];
  const items: NavigationItem[] = ids.map((id, index) => ({
    id,
    label: copy.primary[index] ?? id,
    href: id === 'home' ? '/' : `/${id}`,
  }));
  const company = items.find((item) => item.id === 'company');
  if (company) {
    company.menu = 'submenu';
    company.children = ['about', 'why-tevoniq', 'team', 'partners', 'careers'].map((id, index) => ({
      id,
      label: copy.company[index] ?? id,
      href: id === 'careers' ? '/careers' : `/company/${id}`,
    }));
    if (locale === 'en' || locale === 'ar')
      company.children.push({ id: 'advocas-platform', label: 'Advocas', href: '/advocas' });
  }
  const insights = items.find((item) => item.id === 'insights');
  if (insights) {
    insights.menu = 'submenu';
    insights.children = ['blog', 'resources', 'case-studies'].map((id, index) => ({
      id,
      label: copy.insights[index] ?? id,
      href: `/insights/${id}`,
    }));
  }
  for (const item of items.filter((item) => item.id === 'solutions' || item.id === 'services')) {
    item.menu = 'mega';
    item.children = [
      {
        id: `${item.id}-overview`,
        label: item.id === 'solutions' ? copy.labels.allSolutions : copy.labels.allServices,
        href: item.href,
      },
    ];
  }
  const services = items.find((item) => item.id === 'services');
  if (services) services.groups = serviceNavigationGroups(locale);
  return { items, labels: copy.labels };
}
export function localizedHref(locale: Locale, href: string) {
  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}
export function isActivePath(pathname: string, href: string, homeHref: string) {
  return href === homeHref
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');
}
export function flattenNavigation(items: NavigationItem[]): NavigationItem[] {
  const result = new Map<string, NavigationItem>();
  for (const item of items) {
    result.set(item.href, item);
    for (const child of [
      ...(item.children ?? []),
      ...(item.groups?.flatMap((group) => group.items) ?? []),
    ])
      if (!result.has(child.href)) result.set(child.href, child);
  }
  return [...result.values()];
}
