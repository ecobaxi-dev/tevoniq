import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { solutionWriteSchema } from '../../packages/validation/dist/index.js';

const labels = {
  en: {
    challenge: 'The business challenge',
    overview: 'A practical solution concept',
    architecture: 'How the components connect',
    capabilities: 'Proposed capabilities',
    benefits: 'Intended business value',
    delivery: 'A phased implementation approach',
    faq: 'Before you begin',
    evidenceQuestion: 'Is this a completed TEVONIQ project?',
    evidenceAnswer:
      'This is an illustrative solution concept, not a completed client project or an existing product. Scope, technology selection, delivery capacity and commercial terms would need to be confirmed for your requirements.',
    measurementQuestion: 'How would success be assessed?',
    cta: 'Shape this concept around your business',
    ctaBody:
      'Share your current process, existing systems and priorities. Use this concept as a starting point for a scoped technical discussion.',
    ctaLabel: 'Discuss your requirements',
  },
  tr: {
    challenge: 'İşletmenin karşılaştığı sorun',
    overview: 'Uygulanabilir bir çözüm konsepti',
    architecture: 'Bileşenler nasıl bağlanır?',
    capabilities: 'Önerilen yetenekler',
    benefits: 'Hedeflenen iş değeri',
    delivery: 'Aşamalı uygulama yaklaşımı',
    faq: 'Başlamadan önce',
    evidenceQuestion: 'Bu, tamamlanmış bir TEVONIQ projesi mi?',
    evidenceAnswer:
      'Bu içerik, tamamlanmış bir müşteri projesi veya mevcut bir ürün değil, örnek bir çözüm konseptidir. Kapsam, teknoloji seçimi, uygulama kapasitesi ve ticari koşullar ihtiyaçlarınıza göre ayrıca doğrulanmalıdır.',
    measurementQuestion: 'Başarı nasıl değerlendirilebilir?',
    cta: 'Konsepti işletmenize göre şekillendirin',
    ctaBody:
      'Mevcut sürecinizi, sistemlerinizi ve önceliklerinizi paylaşın. Bu konsept, kapsamı belirlenmiş bir teknik görüşmenin başlangıcı olabilir.',
    ctaLabel: 'İhtiyaçlarınızı paylaşın',
  },
  ar: {
    challenge: 'التحدي الذي يعالجه التصور',
    overview: 'فكرة الحل المقترح',
    architecture: 'كيف تتكامل المكونات؟',
    capabilities: 'الإمكانات المقترحة',
    benefits: 'القيمة المستهدفة للأعمال',
    delivery: 'منهج التنفيذ على مراحل',
    faq: 'قبل البدء',
    evidenceQuestion: 'هل هذا مشروع أنجزته TEVONIQ بالفعل؟',
    evidenceAnswer:
      'هذا تصور توضيحي لحل تقني، وليس مشروعًا منفذًا لعميل أو منتجًا قائمًا. يحتاج النطاق واختيار التقنيات والقدرة على التنفيذ والشروط التجارية إلى تأكيد وفق متطلباتكم.',
    measurementQuestion: 'كيف يمكن تقييم نجاح الحل؟',
    cta: 'لنصغ هذا التصور حول احتياجات أعمالك',
    ctaBody:
      'شاركنا إجراءاتك الحالية والأنظمة المستخدمة وأولوياتك. يمكن أن يكون هذا التصور نقطة بداية لنقاش تقني محدد النطاق.',
    ctaLabel: 'ناقش متطلباتك',
  },
};

function blockId(slug, locale, area) {
  const hex = createHash('sha256')
    .update(`tevoniq:concept:v1:${slug}:${locale}:${area}`)
    .digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function conceptPayload(concept, order, serviceIds = []) {
  return solutionWriteSchema.parse({
    slug: concept.slug,
    status: 'PUBLISHED',
    active: true,
    published: true,
    featured: order < 3,
    sortOrder: order,
    version: 0,
    serviceIds,
    industryIds: [],
    projectIds: [],
    translations: ['en', 'tr', 'ar'].map((locale) => {
      const copy = concept.translations[locale];
      const t = labels[locale];
      const section = (area, type, title, fields) => ({
        area,
        content: { id: blockId(concept.slug, locale, area), type, title, ...fields },
      });
      return {
        locale,
        name: copy.name,
        shortDescription: copy.summary,
        published: true,
        seoTitle: `${copy.name} | TEVONIQ`,
        seoDescription: copy.summary,
        blocks: [
          section('hero', 'hero', copy.name, { description: copy.summary, assetKey: 'brand-icon' }),
          section('businessChallenge', 'overview', t.challenge, { body: copy.challenge }),
          section('solutionOverview', 'overview', t.overview, { body: copy.overview }),
          section('architecture', 'overview', t.architecture, { body: copy.architecture }),
          section('capabilities', 'capabilities', t.capabilities, {
            items: copy.capabilities.map(([title, description]) => ({ title, description })),
          }),
          section('businessBenefits', 'benefits', t.benefits, {
            items: copy.benefits.map(([title, description]) => ({ title, description })),
          }),
          section('implementationApproach', 'overview', t.delivery, { body: copy.delivery }),
          section('faq', 'faq', t.faq, {
            items: [
              { question: t.evidenceQuestion, answer: t.evidenceAnswer },
              { question: t.measurementQuestion, answer: copy.measurement },
            ],
          }),
          section('cta', 'cta', t.cta, { body: t.ctaBody, label: t.ctaLabel, href: '/contact' }),
        ],
      };
    }),
  });
}

export async function loadConcepts() {
  return JSON.parse(
    await readFile(
      new URL('../../apps/api/prisma/content/solution-concepts.json', import.meta.url),
      'utf8',
    ),
  );
}
