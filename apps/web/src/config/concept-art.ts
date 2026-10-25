import type { Locale } from '@tevoniq/types';
import { solutionScenes, illustrationCopy, type SolutionScene } from './solution-illustrations';

const artwork = {
  workflow: {
    src: '/brand/generated/workflow.png',
    alt: {
      en: 'Glass documents connected through an automated workflow',
      tr: 'Otomatik iş akışında birbirine bağlanan cam belgeler',
      ar: 'مستندات زجاجية مترابطة ضمن مسار عمل مؤتمت',
    },
  },
  cloud: {
    src: '/brand/generated/cloud-security.png',
    alt: {
      en: 'Cloud servers protected by a glass shield',
      tr: 'Cam kalkanla korunan bulut sunucuları',
      ar: 'خوادم سحابية محمية بدرع زجاجي',
    },
  },
  connected: {
    src: '/brand/generated/connected-spaces.png',
    alt: {
      en: 'Miniature workplace and retail spaces connected to a central hub',
      tr: 'Merkezi sisteme bağlı minyatür ofis ve mağaza alanları',
      ar: 'مجسم لمساحات عمل ومتجر متصلين بنظام مركزي',
    },
  },
} satisfies Record<string, { src: string; alt: Record<Locale, string> }>;
export type ConceptArt = { src: string; alt: Record<Locale, string>; scene?: SolutionScene };
const subjects: Record<string, keyof typeof artwork> = {
  'custom-software-development': 'workflow',
  'api-integration': 'workflow',
  'business-automation': 'workflow',
  'artificial-intelligence': 'workflow',
  'cloud-solutions': 'cloud',
  cybersecurity: 'cloud',
  'network-infrastructure': 'connected',
  'managed-it-services': 'cloud',
  'intelligent-document-workflow': 'workflow',
  'connected-retail-operations': 'connected',
  'smart-workplace-experience': 'connected',
  'resilient-hybrid-cloud': 'cloud',
  'secure-digital-access': 'cloud',
  'business-operations-hub': 'workflow',
};
export function conceptArt(slug: string): ConceptArt | undefined {
  const key = subjects[slug];
  if (!key) return undefined;
  const scene = solutionScenes[slug];
  return scene
    ? {
        ...artwork[key],
        scene,
        alt: {
          en: illustrationCopy.en[scene].title,
          ar: illustrationCopy.ar[scene].title,
          tr: illustrationCopy.tr[scene].title,
        },
      }
    : artwork[key];
}
export const visualLabels = {
  en: {
    caption: 'Concept illustration',
    explore: 'Continue exploring',
    intro: 'Discover the services and solution concepts behind your next step.',
    services: 'Explore services',
    solutions: 'Explore solutions',
    view: 'Explore',
  },
  tr: {
    caption: 'Kavramsal görsel',
    explore: 'Keşfetmeye devam edin',
    intro: 'Bir sonraki adımınız için hizmetleri ve çözüm konseptlerini inceleyin.',
    services: 'Hizmetleri keşfedin',
    solutions: 'Çözümleri keşfedin',
    view: 'İncele',
  },
  ar: {
    caption: 'رسم توضيحي للمفهوم',
    explore: 'واصل الاستكشاف',
    intro: 'تعرّف على الخدمات وتصورات الحلول التي تساعدك على تحديد خطوتك التالية.',
    services: 'استكشف الخدمات',
    solutions: 'استكشف الحلول',
    view: 'استكشف',
  },
} satisfies Record<Locale, Record<string, string>>;
