import { createHash } from 'node:crypto';
import {
  industryWriteSchema,
  projectWriteSchema,
  articleWriteSchema,
  jobWriteSchema,
  estimateReadingTime,
  companyContentSchema,
} from '../../packages/validation/dist/index.js';
import {
  locales,
  demoLabels,
  industries,
  projects,
  topics,
  categories,
  teamRoles,
  partnerTypes,
  jobs,
  publicationDate,
} from '../../content/demo-content.mjs';

export const actorId = 'content-import:demo-catalog:2026-10-25';
export const demoRelease = '2026-10-25';
export function previewDemoAuthorized(env) {
  if (
    env.RENDER !== 'true' ||
    env.NODE_ENV !== 'production' ||
    env.PREVIEW_DEMO_CONTENT_RELEASE !== demoRelease ||
    !env.DATABASE_URL
  )
    return false;
  try {
    const site = new URL(env.SITE_URL);
    return (
      site.protocol === 'https:' && site.origin === env.SITE_URL && !site.username && !site.password
    );
  } catch {
    return false;
  }
}
export function contentId(key) {
  const h = createHash('sha256').update(`tevoniq:demo-catalog:v1:${key}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
const section = (key, locale, area, type, title, fields) => ({
  area,
  content: { id: contentId(`${key}:${locale}:${area}`), type, title, ...fields },
});
export function buildDemoContent(siteUrl = 'http://localhost:3000') {
  const industryRows = industries.map(([slug, names, challenges, serviceSlugs, uses], order) => ({
    id: contentId(`industry:${slug}`),
    serviceSlugs,
    value: industryWriteSchema.parse({
      slug,
      status: 'PUBLISHED',
      active: true,
      published: true,
      featured: order < 6,
      sortOrder: order,
      version: 0,
      serviceIds: [],
      solutionIds: [],
      projectIds: [],
      translations: locales.map((locale, i) => {
        const l = demoLabels[locale],
          s = (area, type, title, fields) => section(slug, locale, area, type, title, fields);
        return {
          locale,
          name: names[i],
          shortDescription: challenges[i],
          published: true,
          seoTitle: `${names[i]} | TEVONIQ`,
          seoDescription: challenges[i],
          blocks: [
            s('hero', 'hero', names[i], { description: challenges[i], assetKey: 'brand-icon' }),
            s('challenges', 'overview', l.challenges, { body: `${challenges[i]} ${l.notice}` }),
            s('capabilities', 'capabilities', l.capabilities, {
              items: [
                { title: l.architecture, description: l.architectureBody },
                { title: l.roadmap, description: l.roadmapBody },
                { title: l.benefits, description: l.benefitsBody },
              ],
            }),
            s('relevantSolutions', 'related-projects', l.solutions, { ids: [] }),
            s('relevantServices', 'related-services', l.services, { ids: [] }),
            s('useCases', 'benefits', l.uses, {
              items: [
                { title: uses[i], description: challenges[i] },
                { title: l.architecture, description: l.architectureBody },
                { title: l.roadmap, description: l.roadmapBody },
              ],
            }),
            s('projects', 'related-projects', l.projects, { ids: [] }),
            s('faq', 'faq', l.faq, {
              items: [
                { question: l.question, answer: l.answer },
                { question: l.secondQuestion, answer: l.secondAnswer },
              ],
            }),
            s('cta', 'cta', l.cta, { body: l.ctaBody, label: l.cta, href: '/contact' }),
          ],
        };
      }),
    }),
  }));
  const projectRows = projects.map((p, order) => ({
    id: contentId(`project:${p.slug}`),
    industrySlugs: p.industries,
    serviceSlugs: p.services,
    solutionSlugs: p.solutions,
    value: projectWriteSchema.parse({
      slug: p.slug,
      clientName: '',
      clientVisibility: 'PRIVATE',
      featured: true,
      published: true,
      verified: true,
      version: 0,
      sortOrder: order,
      industryIds: [],
      serviceIds: [],
      solutionIds: [],
      translations: locales.map((locale, i) => {
        const l = demoLabels[locale],
          title = `${l.demo}: ${p.titles[i]}`;
        return {
          locale,
          title,
          summary: `${p.source ? l.reference : l.notice} ${p.summaries[i]}`,
          published: true,
          heroImage: {
            url: `/brand/generated/${p.image}`,
            alt: `${l.demo}: ${p.titles[i]}`,
            caption: l.notice,
          },
          gallery: [{ url: '/brand/generated/workflow.png', alt: l.proposed, caption: l.notice }],
          challenge: `${l.notice} ${p.challenges[i]}`,
          approach: `${l.proposed}: ${l.roadmapBody}`,
          solution: `${p.source ? l.reference : l.notice} ${p.summaries[i]}`,
          implementation: `${l.proposed}: ${l.architectureBody}${p.source ? `\n\n${l.referenceLink}: ${p.source}` : ''}`,
          technologies: p.technologies,
          results: [
            { value: l.planned, label: l.acceptance },
            { value: l.demo, label: l.benefits },
          ],
          seoTitle: `${title} | TEVONIQ`,
          seoDescription: `${l.demo}: ${p.summaries[i]}`,
        };
      }),
    }),
  }));
  const taxonomies = locales.flatMap((locale, i) => [
    ...Object.entries(categories).map(([slug, names]) => ({
      id: contentId(`category:${slug}:${locale}`),
      slug: `demo-${slug}`,
      language: locale,
      name: names[i],
      type: 'category',
    })),
    {
      id: contentId(`tag:demo:${locale}`),
      slug: 'demo',
      language: locale,
      name: demoLabels[locale].demo,
      type: 'tag',
    },
  ]);
  const articles = locales.flatMap((locale, i) => {
    const l = demoLabels[locale];
    const complete = (topic, content, image) => {
      const title = `${l.demo}: ${topic.titles[i]}`;
      const value = articleWriteSchema.parse({
        title,
        slug: topic.slug,
        excerpt: `${l.articleNote} ${topic.intros[i]}`,
        content,
        coverImage: `${siteUrl}/brand/generated/${image}`,
        coverImageAlt: `${l.demo}: ${topic.titles[i]}`,
        author: l.author,
        categoryId: contentId(`category:${topic.category}:${locale}`),
        tagIds: [contentId(`tag:demo:${locale}`)],
        publicationDate,
        readingTime: estimateReadingTime(content),
        featured: true,
        status: 'published',
        language: locale,
        kind: topic.kind,
        seoTitle: `${title} | TEVONIQ`,
        seoDescription: `${l.demo}: ${topic.intros[i]}`,
        ogImage: `${siteUrl}/brand/generated/${image}`,
        canonicalUrl: '',
        version: 0,
      });
      return { id: contentId(`article:${topic.slug}:${locale}`), value };
    };
    return [
      ...topics.map((topic) =>
        complete(
          topic,
          [
            { type: 'paragraph', text: l.articleNote },
            { type: 'heading', text: topic.titles[i], level: 2 },
            { type: 'paragraph', text: topic.intros[i] },
            { type: 'heading', text: l.roadmap, level: 2 },
            { type: 'list', ordered: true, items: topic.items.map((item) => item[i]) },
            { type: 'heading', text: l.acceptance, level: 2 },
            { type: 'paragraph', text: l.benefitsBody },
            { type: 'paragraph', text: l.roadmapBody },
          ],
          topic.category === 'cloud' || topic.category === 'security'
            ? 'cloud-security.png'
            : 'workflow.png',
        ),
      ),
      ...projects.map((p) =>
        complete(
          {
            slug: `${p.slug}-case-study`,
            kind: 'case-study',
            category: 'delivery',
            titles: p.titles,
            intros: p.summaries,
          },
          [
            { type: 'paragraph', text: p.source ? l.reference : l.notice },
            { type: 'heading', text: l.challenges, level: 2 },
            { type: 'paragraph', text: p.challenges[i] },
            { type: 'heading', text: p.source ? l.referenceSummary : l.scope, level: 2 },
            { type: 'paragraph', text: p.summaries[i] },
            { type: 'heading', text: l.proposed, level: 2 },
            { type: 'paragraph', text: l.roadmapBody },
            { type: 'paragraph', text: l.notice },
            ...(p.source ? [{ type: 'link', text: l.referenceLink, url: p.source }] : []),
            { type: 'link', text: l.projects, url: `${siteUrl}/${locale}/projects/${p.slug}` },
          ],
          p.image,
        ),
      ),
    ];
  });
  const partners = locales.flatMap((locale, i) =>
    partnerTypes.map((names, order) => ({
      id: contentId(`partner:${order}:${locale}`),
      module: 'partners',
      language: locale,
      title: `${demoLabels[locale].demoPartner}: ${names[i]}`,
      status: 'published',
      // Approval is for displaying a clearly labelled fictional profile, not a
      // claim of affiliation with a real organization. No real brand is used.
      data: {
        verified: 'true',
        description: demoLabels[locale].partnerNote,
        website: '',
        image: '',
      },
      createdById: actorId,
      updatedById: actorId,
    })),
  );
  const team = locales.flatMap((locale, i) =>
    teamRoles.map(([names, bios], order) => ({
      id: contentId(`team:${order}:${locale}`),
      module: 'team',
      language: locale,
      title: `${demoLabels[locale].demoRole}: ${names[i]}`,
      status: 'published',
      data: { role: names[i], bio: `${demoLabels[locale].teamNote} ${bios[i]}`, image: '' },
      createdById: actorId,
      updatedById: actorId,
    })),
  );
  const careerRows = jobs.map((job) => ({
    id: contentId(`job:${job.slug}`),
    value: jobWriteSchema.parse({
      ...job,
      location: 'Demo — location to be confirmed',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      description:
        'Demonstration role for reviewing the careers layout. This is not an active vacancy and does not accept applications. Replace the title, location, responsibilities and requirements before publishing a real role.',
      status: 'PUBLISHED',
      publishedAt: publicationDate,
      closingDate: null,
      version: 0,
    }),
  }));
  return {
    industries: industryRows,
    projects: projectRows,
    taxonomies,
    articles,
    partners,
    team,
    jobs: careerRows,
  };
}

export function companyAdditions(slug, locale) {
  const i = locales.indexOf(locale),
    l = demoLabels[locale];
  if (slug === 'team')
    return [
      { title: l.architecture, body: l.architectureBody },
      { title: l.roadmap, body: l.roadmapBody },
      { title: l.benefits, body: l.benefitsBody },
    ];
  if (slug === 'partners')
    return [
      { title: l.scope, body: l.ctaBody },
      { title: l.roadmap, body: l.roadmapBody },
      { title: l.demoPartner, body: l.partnerNote },
    ];
  const headings =
    slug === 'careers'
      ? [
          ['How we collaborate', 'Nasıl iş birliği yaparız?', 'كيف نتعاون؟'],
          ['Learning and ownership', 'Öğrenme ve sorumluluk', 'التعلم والمسؤولية'],
          ['A clear application process', 'Net başvuru süreci', 'خطوات تقديم واضحة'],
        ]
      : [
          [l.scope, l.scope, l.scope],
          [l.architecture, l.architecture, l.architecture],
          [l.roadmap, l.roadmap, l.roadmap],
        ];
  const bodies =
    slug === 'careers'
      ? [
          [
            'We value clear decisions, shared documentation and regular feedback. The sample roles below illustrate the careers experience.',
            'Net kararları, ortak belgeleri ve düzenli geri bildirimi önemsiyoruz. Örnek roller kariyer deneyimini gösterir.',
            'نقدّر القرارات الواضحة والتوثيق المشترك والملاحظات الدورية. توضح الأدوار التجريبية تجربة قسم الوظائف.',
          ],
          [
            'Discuss responsibilities, learning goals and the support needed to do useful work.',
            'Sorumlulukları, öğrenme hedeflerini ve faydalı iş için gereken desteği görüşün.',
            'نناقش المسؤوليات وأهداف التعلم والدعم اللازم لإنجاز عمل مفيد.',
          ],
          [
            'For a real published vacancy, review the requirements, submit an application and agree the next step with the hiring team. Demo roles do not accept applications.',
            'Gerçek bir ilan için gereksinimleri inceleyin, başvurun ve işe alım ekibiyle sonraki adımı belirleyin. Örnek roller başvuru kabul etmez.',
            'عند نشر وظيفة فعلية، راجع المتطلبات وقدّم طلبك واتفق على الخطوة التالية مع فريق التوظيف. الوظائف التجريبية لا تستقبل طلبات.',
          ],
        ].map((values) => values[i])
      : [l.ctaBody, l.architectureBody, l.roadmapBody];
  return headings.map((names, n) => ({ title: names[i], body: bodies[n] }));
}
export function appendCompanyContent(slug, locale, content) {
  return companyContentSchema.parse({
    ...content,
    sections: [
      ...content.sections,
      ...companyAdditions(slug, locale).filter(
        (a) => !content.sections.some((s) => s.title === a.title),
      ),
    ],
  });
}

export function solutionRelationshipSections(slug, locale, blocks) {
  const l = demoLabels[locale];
  const added = [
    section(slug, locale, 'includedServices', 'related-services', l.services, { ids: [] }),
    section(
      slug,
      locale,
      'industries',
      'related-projects',
      { en: 'Relevant industries', tr: 'İlgili sektörler', ar: 'القطاعات ذات الصلة' }[locale],
      { ids: [] },
    ),
    section(slug, locale, 'relatedProjects', 'related-projects', l.projects, { ids: [] }),
  ].filter((candidate) => !blocks.some((b) => b.area === candidate.area));
  // Keep the existing call to action at the end.
  const position = blocks.findIndex((b) => b.area === 'cta');
  return position < 0
    ? [...blocks, ...added]
    : [...blocks.slice(0, position), ...added, ...blocks.slice(position)];
}
