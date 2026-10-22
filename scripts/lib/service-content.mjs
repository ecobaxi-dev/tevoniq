import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { serviceWriteSchema } from '../../packages/validation/dist/index.js';

const labels = {
  en: {
    overview: 'A scope built around your requirements',
    capabilities: 'What the scope can include',
    deliverables: 'Proposed deliverables',
    useCases: 'Where this service can fit',
    process: 'From discovery to handover',
    acceptance: 'How delivery would be evaluated',
    faq: 'Questions before starting',
    scopeQuestion: 'What does this service description commit to?',
    scopeAnswer:
      'This is a proposed service scope for discussion, not evidence of a completed engagement. Availability, deliverables, technology choices, timing and support terms must be confirmed in a written agreement.',
    cta: 'Define the next step for your business',
    ctaBody:
      'Describe your current systems, the challenge you want to address and the constraints that matter. A focused brief helps establish a practical scope.',
    ctaLabel: 'Discuss this service',
  },
  tr: {
    overview: 'İhtiyaçlarınıza göre belirlenen kapsam',
    capabilities: 'Kapsama alınabilecek çalışmalar',
    deliverables: 'Önerilen teslimatlar',
    useCases: 'Uygun kullanım alanları',
    process: 'Keşiften devre kadar',
    acceptance: 'Teslimat nasıl değerlendirilebilir?',
    faq: 'Başlamadan önce sorular',
    scopeQuestion: 'Bu hizmet açıklaması hangi taahhütleri içerir?',
    scopeAnswer:
      'Bu içerik, tamamlanmış bir işin kanıtı değil, görüşmeye açık bir hizmet kapsamıdır. Uygunluk, teslimatlar, teknoloji tercihleri, takvim ve destek koşulları yazılı anlaşmayla doğrulanmalıdır.',
    cta: 'İşletmeniz için sonraki adımı tanımlayın',
    ctaBody:
      'Mevcut sistemlerinizi, ele almak istediğiniz sorunu ve önemli kısıtları paylaşın. Odaklı bir ihtiyaç özeti uygulanabilir kapsamı belirlemeye yardımcı olur.',
    ctaLabel: 'Hizmeti görüşün',
  },
  ar: {
    overview: 'نطاق يُبنى حول متطلباتك',
    capabilities: 'ما الذي يمكن أن يشمله النطاق؟',
    deliverables: 'المخرجات المقترحة',
    useCases: 'متى يكون هذا النطاق مناسبًا؟',
    process: 'من الاكتشاف إلى التسليم',
    acceptance: 'كيف يُقيّم التنفيذ؟',
    faq: 'أسئلة قبل البدء',
    scopeQuestion: 'ما الذي يلتزم به وصف الخدمة؟',
    scopeAnswer:
      'هذا نطاق خدمة مقترح للنقاش، وليس توثيقًا لعمل منفذ. يُؤكد توفر الخدمة ومخرجاتها واختياراتها التقنية وجدولها وشروط دعمها ضمن اتفاق مكتوب.',
    cta: 'حدّد الخطوة التالية لأعمالك',
    ctaBody:
      'شاركنا أنظمتك الحالية والتحدي الذي تريد معالجته والقيود المهمة. يساعد وصف الاحتياج بوضوح على تحديد نطاق عملي.',
    ctaLabel: 'ناقش هذه الخدمة',
  },
};

export const seedTitles = {
  'custom-software-development': 'Custom Software Development',
  'api-integration': 'API Integration',
  'business-automation': 'Business Automation',
  'artificial-intelligence': 'Artificial Intelligence',
  'cloud-solutions': 'Cloud Solutions',
  cybersecurity: 'Cybersecurity',
  'network-infrastructure': 'Network Infrastructure',
  'managed-it-services': 'Managed IT Services',
};

export function isUntouchedService(row) {
  if (
    !row ||
    !seedTitles[row.slug] ||
    row.active ||
    row.deletedAt ||
    row.version !== 0 ||
    row.sortOrder !== 0 ||
    row.createdById ||
    row.updatedById ||
    row.translations.length !== 1
  )
    return false;
  const t = row.translations[0];
  return (
    t.locale === 'en' &&
    t.title === seedTitles[row.slug] &&
    !t.published &&
    t.summary === '' &&
    t.seoTitle === '' &&
    t.seoDescription === '' &&
    Array.isArray(t.blocks) &&
    t.blocks.length === 0
  );
}

export function serviceContentPayload(entry, order, version = 0) {
  return serviceWriteSchema.parse({
    slug: entry.slug,
    active: true,
    sortOrder: order,
    version,
    translations: ['en', 'tr', 'ar'].map((locale) => {
      const copy = entry.translations[locale],
        t = labels[locale];
      const block = (key, type, title, fields) => {
        const h = createHash('sha256')
          .update(`tevoniq:service-content:v1:${entry.slug}:${locale}:${key}`)
          .digest('hex');
        return {
          id: `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`,
          type,
          title,
          ...fields,
        };
      };
      const items = (values) => values.map(([title, description]) => ({ title, description }));
      return {
        locale,
        title: copy.title,
        summary: copy.summary,
        published: true,
        seoTitle: `${copy.title} | TEVONIQ`,
        seoDescription: copy.summary,
        blocks: [
          block('hero', 'hero', copy.title, { description: copy.summary, assetKey: 'brand-icon' }),
          block('overview', 'overview', t.overview, { body: copy.overview }),
          block('capabilities', 'capabilities', t.capabilities, {
            items: items(copy.capabilities),
          }),
          block('deliverables', 'features', t.deliverables, { items: items(copy.deliverables) }),
          block('use-cases', 'use-cases', t.useCases, {
            items: copy.useCases.map((title) => ({ title, description: '' })),
          }),
          block('process', 'overview', t.process, { body: copy.process }),
          block('acceptance', 'overview', t.acceptance, { body: copy.acceptance }),
          block('faq', 'faq', t.faq, {
            items: [
              { question: copy.question, answer: copy.answer },
              { question: t.scopeQuestion, answer: t.scopeAnswer },
            ],
          }),
          block('cta', 'cta', t.cta, { body: t.ctaBody, label: t.ctaLabel, href: '/contact' }),
        ],
      };
    }),
  });
}

export async function loadServiceContent() {
  return JSON.parse(
    await readFile(
      new URL('../../apps/api/prisma/content/service-content.json', import.meta.url),
      'utf8',
    ),
  );
}
