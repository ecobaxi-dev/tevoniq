import { defaultCompanyContent } from '../../packages/validation/dist/index.js';
export const showcaseState = { visible: true, unavailable: false };
const identifier = (n) => `71000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export function showcaseFixture(url) {
  const locale = url.searchParams.get('locale') || url.pathname.split('/').at(-1) || 'en',
    ar = locale === 'ar',
    t = (a, e) => (ar ? a : e);
  const industryEntries = [
    ['smes', t('المنشآت الصغيرة والمتوسطة', 'Small and medium businesses')],
    ['retail', t('التجزئة', 'Retail')],
    ['manufacturing', t('التصنيع', 'Manufacturing')],
    ['real-estate', t('العقارات', 'Real estate')],
    ['hospitality', t('الضيافة', 'Hospitality')],
    ['logistics', t('الخدمات اللوجستية', 'Logistics')],
  ].map(([slug, name], i) => ({
    id: identifier(i + 1),
    slug,
    name,
    shortDescription: t(
      'احتياج توضيحي لتنظيم الطلبات ومتابعة العمل على مراحل.',
      'An illustrative need for organised requests and staged delivery.',
    ),
    featured: true,
  }));
  const projects = [
    ['demo-connected-retail', t('نموذج عمليات متجر', 'Retail workflow concept')],
    ['demo-hospitality-workspace', t('نموذج إدارة ضيافة', 'Hospitality workflow concept')],
    ['demo-enterprise-knowledge-search', t('نموذج معرفة العمل', 'Workplace knowledge concept')],
  ].map(([slug, title], i) => ({
    id: identifier(i + 20),
    slug,
    title,
    summary: t(
      'تصور توضيحي يشرح الحاجة ونطاق البداية، وليس مشروع عميل.',
      'An illustrative concept explaining a need and initial scope, not a client engagement.',
    ),
    clientLabel: t('سياق افتراضي', 'Fictional context'),
    heroImage: null,
    featured: true,
    country: '',
    city: '',
    projectDate: null,
  }));
  const articles = [
    [
      'fixture-resource',
      'resource',
      t('قائمة تجهيز متطلبات المشروع', 'Project requirements checklist'),
    ],
    ['fixture-article', 'blog', t('كيف نختار بداية مناسبة', 'Choosing a suitable starting point')],
    [
      'fixture-study',
      'case-study',
      t('دراسة سيناريو متابعة الطلبات', 'Request follow-up scenario study'),
    ],
  ].map(([slug, kind, title], i) => ({
    id: identifier(i + 40),
    slug,
    title,
    excerpt: t(
      'محتوى توضيحي لاختبار عرض المقالات والموارد المنشورة فقط.',
      'Illustrative content used only to verify published articles and resources.',
    ),
    content: [
      { type: 'heading', level: 2, text: t('حدد المهمة أولًا', 'Define the task first') },
      {
        type: 'paragraph',
        text: t(
          'نراجع المستخدمين والبيانات وطريقة العمل ثم نحدد المخرجات ومعيار القبول.',
          'Review users, records and workflow, then define deliverables and acceptance criteria.',
        ),
      },
    ],
    coverImage: '',
    coverImageAlt: '',
    author: 'TEVONIQ',
    category: null,
    tags: [],
    publicationDate: `2020-01-0${3 - i}T09:00:00.000Z`,
    updatedAt: '2020-01-03T09:00:00.000Z',
    readingTime: 3 + i,
    featured: true,
    language: locale,
    kind,
    seoTitle: title,
    seoDescription: t(
      'مادة منشورة للتحقق من مسارات المعرفة.',
      'A published fixture for verifying knowledge routes.',
    ),
    ogImage: '',
    canonicalUrl: '',
  }));
  const isPath =
    /^\/api\/v1\/(industries|projects|insights|company\/(partners|about|why-tevoniq))(\/|$)/.test(
      url.pathname,
    );
  if (!isPath) return undefined;
  if (showcaseState.unavailable)
    return { status: 503, body: { message: 'Unavailable showcase fixture' } };
  const paginate = (items) => {
    const q = url.searchParams.get('q') || '',
      page = Number(url.searchParams.get('page') || 1),
      limit = Number(url.searchParams.get('limit') || 12);
    let filtered = showcaseState.visible ? items : [];
    if (q)
      filtered = filtered.filter((item) =>
        (item.title || item.name).toLowerCase().includes(q.toLowerCase()),
      );
    return {
      items: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      page,
      limit,
    };
  };
  if (url.pathname === '/api/v1/industries')
    return { status: 200, body: paginate(industryEntries) };
  if (url.pathname.startsWith('/api/v1/industries/')) {
    const item = industryEntries.find((v) => url.pathname.endsWith('/' + v.slug));
    return item && showcaseState.visible
      ? {
          status: 200,
          body: {
            ...item,
            locale,
            availableLocales: ['ar', 'en', 'tr'],
            seoTitle: item.name,
            seoDescription: item.shortDescription,
            blocks: [],
            services: [],
            projects: [],
            solutions: [],
          },
        }
      : { status: 404, body: { message: 'Not found' } };
  }
  if (url.pathname === '/api/v1/projects/filters')
    return { status: 200, body: { industries: [], services: [], solutions: [] } };
  if (url.pathname === '/api/v1/projects') return { status: 200, body: paginate(projects) };
  if (url.pathname.startsWith('/api/v1/projects/')) {
    const item = projects.find((v) => url.pathname.endsWith('/' + v.slug));
    return item && showcaseState.visible
      ? {
          status: 200,
          body: {
            ...item,
            locale,
            availableLocales: ['ar', 'en', 'tr'],
            gallery: [],
            challenge: t(
              'تتكرر الخطوات اليدوية ويصعب تتبع حالة الطلب.',
              'Repeated manual steps make request status difficult to track.',
            ),
            approach: t(
              'نبدأ بمسار طلب محدد ومسؤول ومعيار قبول.',
              'Start with one request flow, an owner and acceptance criteria.',
            ),
            solution: t(
              'شاشة متابعة وسجلات ببيانات نموذجية واضحة.',
              'A tracking screen and records with clearly illustrative data.',
            ),
            implementation: t(
              'تصور تعليمي ببيانات افتراضية، وليس تنفيذ عميل.',
              'An educational concept with fictional data, not a client delivery.',
            ),
            technologies: ['Example tool'],
            results: [{ value: '3', label: t('حالات في النموذج', 'Example statuses') }],
            testimonial: 'Do not show this synthetic testimonial',
            testimonialAttribution: 'Illustrative person',
            seoTitle: item.title,
            seoDescription: item.summary,
            industries: [],
            services: [],
            solutions: [],
          },
        }
      : { status: 404, body: { message: 'Not found' } };
  }
  if (url.pathname === '/api/v1/insights/taxonomies') return { status: 200, body: { items: [] } };
  if (url.pathname === '/api/v1/insights') {
    const kind = url.searchParams.get('kind');
    return {
      status: 200,
      body: paginate(kind ? articles.filter((a) => a.kind === kind) : articles),
    };
  }
  if (url.pathname.startsWith('/api/v1/insights/')) {
    const article = articles.find((v) => url.pathname.endsWith('/' + v.slug));
    return article && showcaseState.visible
      ? { status: 200, body: { article, related: articles.filter((v) => v.id !== article.id) } }
      : { status: 404, body: { message: 'Not found' } };
  }
  if (url.pathname === '/api/v1/company/why-tevoniq')
    return showcaseState.visible
      ? {
          status: 200,
          body: {
            ...defaultCompanyContent('why-tevoniq'),
            title: t('لماذا TEVONIQ', 'Why TEVONIQ'),
            intro: 'Published why fixture.',
            sections: [
              {
                title: t('مبادئ منشورة', 'Published principles'),
                body: 'Published principles fixture for preservation.',
              },
            ],
          },
        }
      : { status: 404, body: { message: 'Not found' } };
  if (url.pathname === '/api/v1/company/about')
    return showcaseState.visible
      ? {
          status: 200,
          body: {
            ...defaultCompanyContent('about'),
            title: t('عن TEVONIQ', 'About TEVONIQ'),
            intro: t('محتوى الشركة المنشور للاختبار.', 'Published company fixture.'),
            sections: [
              {
                title: t('هوية الشركة', 'Company identity'),
                body: 'Company identity fixture — Istanbul.',
              },
            ],
          },
        }
      : { status: 404, body: { message: 'Not found' } };
  if (url.pathname === '/api/v1/company/partners')
    return showcaseState.visible
      ? {
          status: 200,
          body: { ...defaultCompanyContent('partners'), title: t('الشركاء', 'Partners') },
        }
      : { status: 404, body: { message: 'Not found' } };
  return undefined;
}
