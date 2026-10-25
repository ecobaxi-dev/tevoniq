import type { Locale } from '@tevoniq/types';

export const journeyCopy = {
  ar: {
    stage: 'المرحلة',
    outcome: 'ما نخرج به',
    stages: [
      {
        points: [
          'أهداف العمل وأولوياته',
          'الأنظمة الحالية ونقاط الربط',
          'نطاق أولي ومعايير نجاح واضحة',
        ],
        deliverable: 'صورة مشتركة للاحتياج والأولويات',
      },
      {
        points: ['بنية تربط القدرات المطلوبة', 'ضوابط الأمان والتكامل', 'خطة تنفيذ قابلة للمراجعة'],
        deliverable: 'مخطط للحل ونطاق عمل متفق عليه',
      },
      {
        points: ['نطاق أولي قابل للاختبار', 'مراجعة وتوسع على مراحل', 'توثيق وتدريب وخطة دعم'],
        deliverable: 'إطلاق منظم وأساس واضح للتطوير',
      },
    ],
  },
  en: {
    stage: 'Stage',
    outcome: 'What we define together',
    stages: [
      {
        points: [
          'Business goals and priorities',
          'Existing systems and integration points',
          'An initial scope and clear success criteria',
        ],
        deliverable: 'A shared understanding of needs and priorities',
      },
      {
        points: [
          'Architecture connecting the capabilities you need',
          'Security and integration requirements',
          'An implementation plan for review',
        ],
        deliverable: 'A solution blueprint and an agreed scope',
      },
      {
        points: [
          'A focused scope that can be tested',
          'Reviews and expansion in stages',
          'Documentation, training and a support plan',
        ],
        deliverable: 'A structured launch with room to evolve',
      },
    ],
  },
  tr: {
    stage: 'Aşama',
    outcome: 'Birlikte belirlediklerimiz',
    stages: [
      {
        points: [
          'İş hedefleri ve öncelikler',
          'Mevcut sistemler ve entegrasyon noktaları',
          'İlk kapsam ve net başarı ölçütleri',
        ],
        deliverable: 'İhtiyaç ve öncelikler hakkında ortak anlayış',
      },
      {
        points: [
          'Gerekli yetkinlikleri birleştiren mimari',
          'Güvenlik ve entegrasyon gereksinimleri',
          'İncelenebilir bir uygulama planı',
        ],
        deliverable: 'Çözüm taslağı ve üzerinde anlaşılan kapsam',
      },
      {
        points: [
          'Test edilebilir odaklı bir kapsam',
          'Aşamalı değerlendirme ve genişleme',
          'Dokümantasyon, eğitim ve destek planı',
        ],
        deliverable: 'Gelişime açık, düzenli bir başlangıç',
      },
    ],
  },
} satisfies Record<
  Locale,
  { stage: string; outcome: string; stages: { points: string[]; deliverable: string }[] }
>;

export function journeyKeyIndex(
  key: string,
  current: number,
  count: number,
  rtl: boolean,
): number | null {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return null;
  const direction = (key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
  return (current + direction + count) % count;
}
