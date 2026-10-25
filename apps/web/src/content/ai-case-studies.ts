import type { Locale } from '@tevoniq/types';
import studies from './ai-case-studies.json';
import digitalStudies from './digital-case-studies.json';
export const aiCaseStudies = [
  ...studies.map((study) => ({
    ...study,
    serviceSlug: 'ai-augmented-development',
    imageSection: 2,
    gallery: [{ src: study.diagram, ...study.images.diagram }],
  })),
  ...digitalStudies.map((study) => ({ ...study, serviceSlug: 'digital-transformation' })),
];
export function aiCaseStudyHref(locale: Locale, slug: string) {
  return `/${locale}/insights/case-studies/${slug}`;
}
export const aiCaseCopy = {
  en: {
    title: 'AI in practice: case studies',
    label: 'Case study',
    nav: 'Case studies',
    read: 'Explore the study',
    back: 'Back to the service',
    notice:
      'External case studies. Reported results belong to the featured engagements and are not TEVONIQ project results.',
    source: 'Original publication',
    sections: 'In this study',
    results: 'Reported results',
    related: 'Explore more case studies',
    contact: 'Discuss a similar challenge',
    image: 'Project illustration',
    snapshot: 'Results as reported in the source publication; individual outcomes vary.',
  },
  ar: {
    title: 'الذكاء الاصطناعي عمليًا: دراسات حالة',
    label: 'دراسة حالة',
    nav: 'دراسات الحالة',
    read: 'استكشف الدراسة',
    back: 'العودة إلى الخدمة',
    notice:
      'دراسات حالة خارجية. تخص النتائج المشاريع المعروضة، وليست نتائج مشاريع نفّذتها TEVONIQ.',
    source: 'المنشور الأصلي',
    sections: 'في هذه الدراسة',
    results: 'النتائج المنشورة',
    related: 'استكشف دراسات أخرى',
    contact: 'ناقش تحديًا مشابهًا',
    image: 'صورة توضيحية للمشروع',
    snapshot: 'النتائج وفق المنشور الأصلي؛ تختلف النتائج حسب المشروع.',
  },
  tr: {
    title: 'Uygulamada yapay zekâ: vaka çalışmaları',
    label: 'Vaka çalışması',
    nav: 'Vaka çalışmaları',
    read: 'Çalışmayı keşfedin',
    back: 'Hizmete dön',
    notice:
      'Dış vaka çalışmalarıdır. Bildirilen sonuçlar ilgili projelere aittir; TEVONIQ proje sonuçları değildir.',
    source: 'Orijinal yayın',
    sections: 'Bu çalışmada',
    results: 'Bildirilen sonuçlar',
    related: 'Diğer vaka çalışmaları',
    contact: 'Benzer bir ihtiyacı görüşelim',
    image: 'Proje görseli',
    snapshot: 'Sonuçlar kaynak yayında bildirildiği şekildedir; projeye göre farklılık gösterir.',
  },
} satisfies Record<Locale, Record<string, string>>;
