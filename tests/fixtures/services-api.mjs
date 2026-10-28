// Isolated Playwright-only API fixture. Never imported by application code.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { retiredServiceSlugs } from '../../packages/types/src/retired-catalog.ts';
const directoryCatalog = JSON.parse(
  readFileSync(new URL('../../content/service-expansion.json', import.meta.url), 'utf8'),
);
import { homeCopy } from '../../apps/web/src/content/home.ts';
import { referenceHeroCopy } from '../../apps/web/src/content/reference-hero.ts';
const id = '11111111-1111-4111-8111-111111111111';
const blocks = [
  {
    id: '22222222-2222-4222-8222-222222222222',
    type: 'hero',
    title: 'Development service fixture',
    description: 'Browser test data only',
    assetKey: 'none',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    type: 'faq',
    title: 'Test FAQ',
    items: [
      {
        question: 'Is this commercial content?',
        answer: 'No. This is isolated browser test data.',
      },
    ],
  },
];
let record = {
  id,
  slug: 'development-fixture',
  active: true,
  version: 0,
  translations: [
    {
      locale: 'en',
      published: true,
      title: 'Development service fixture',
      summary: 'Browser test data only',
      seoTitle: 'Development fixture SEO',
      seoDescription: 'Isolated browser test data',
      blocks,
    },
  ],
};
const token = 'a'.repeat(64);
let consultingPublished = true;
let businessAutomationPublished = true;
let erpPublished = true;
let engineeringPublished = true;
let iotPublished = true;
createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url, 'http://localhost');
  const send = (status, body) => {
    res.writeHead(status);
    res.end(JSON.stringify(body));
  };
  if (url.pathname === '/health') return send(200, { ok: true });
  // Code-owned product sitemap entries are tested independently of CMS records.
  if (url.pathname === '/api/v1/seo/routes') {
    const entries = ['cloud-solutions', 'development-fixture'].map((slug) => ({
      route: `/services/${slug}`,
      locale: 'en',
      title: 'SEO fixture',
      canonical: '',
      updatedAt: null,
      seo: {},
      translations: [{ locale: 'en', canonical: '', seo: {} }],
    }));
    const items = url.searchParams.has('path')
      ? entries.filter((item) => item.route === url.searchParams.get('path'))
      : entries;
    return send(200, { items, total: items.length });
  }
  if (/^\/api\/v1\/navigation\/(en|ar|tr)$/.test(url.pathname))
    return send(200, {
      labels: {},
      items: [
        {
          id,
          label: 'Renamed legacy service',
          href: '/services/sap-services',
          group: 'services',
          order: 100,
        },
      ],
    });
  if (url.pathname === '/api/v1/search' && url.searchParams.get('q') === 'retirement-check')
    return send(200, {
      query: 'retirement-check',
      groups: [
        {
          type: 'service',
          hasMore: false,
          items: [
            {
              id: 'retired',
              type: 'service',
              title: 'Legacy service',
              excerpt: 'Legacy published data',
              url: '/en/services/cloud-solutions',
            },
            {
              id,
              type: 'service',
              title: 'Development service fixture',
              excerpt: 'Kept published data',
              url: '/en/services/development-fixture',
            },
          ],
        },
      ],
    });
  if (url.pathname === '/api/v1/services' && url.searchParams.get('q') === 'retirement-check')
    return send(200, {
      items: [
        {
          id: 'retired',
          slug: 'cloud-solutions',
          title: 'Legacy published service',
          summary: 'Old publication fixture',
        },
        {
          id,
          slug: record.slug,
          title: record.translations[0].title,
          summary: record.translations[0].summary,
        },
      ],
      total: 2,
      page: 1,
      limit: 12,
    });
  if (url.pathname === '/api/v1/services/cloud-solutions')
    return send(200, {
      id,
      slug: 'cloud-solutions',
      locale: url.searchParams.get('locale') || 'en',
      title: 'Legacy published service',
      summary: 'Old publication fixture',
      seoTitle: 'Legacy fixture',
      seoDescription: 'Legacy fixture content for retirement regression',
      blocks,
      relatedServices: [],
      relatedProjects: [],
    });
  const home = url.pathname.match(/^\/api\/v1\/home\/(en|tr|ar)$/);
  if (home)
    return send(200, {
      content: { copy: homeCopy[home[1]], hero: referenceHeroCopy[home[1]] },
      partners: [],
    });
  if (url.pathname === '/api/v1/services' && url.searchParams.get('q')?.startsWith('directory-')) {
    if (url.searchParams.get('q') === 'directory-error')
      return send(503, { message: 'Unavailable fixture' });
    const locale = url.searchParams.get('locale') || 'en';
    const slugs = [
      'it-consulting',
      'software-product-engineering',
      'business-automation',
      'erp-solutions',
      'iot-solutions',
      'artificial-intelligence',
      'cybersecurity',
      'api-integration',
    ];
    const cards = slugs.map((slug, index) => {
      const service = directoryCatalog.groups
        .flatMap((group) => group.services)
        .find((service) => service.slug === slug);
      return {
        id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        slug,
        title: service.translations[locale].title,
        summary: service.translations[locale].summary,
      };
    });
    if (locale === 'en')
      cards.push({
        id,
        slug: 'development-fixture',
        title: 'Development service fixture',
        summary: 'Published service without a navigation category',
      });
    if (url.searchParams.get('q') === 'directory-pages') {
      const page = Number(url.searchParams.get('page') || 1),
        limit = 4;
      return send(200, {
        items: cards.slice((page - 1) * limit, page * limit),
        total: cards.length,
        page,
        limit,
      });
    }
    const retired = retiredServiceSlugs.map((slug, index) => ({
      id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      slug,
      title: 'Archived offering',
      summary: 'Must not be visible',
    }));
    return send(200, {
      items: [...cards, ...retired],
      total: cards.length + retired.length,
      page: 1,
      limit: 48,
    });
  }
  if (url.pathname === '/api/v1/services')
    return send(200, {
      items:
        url.searchParams.get('q') === 'empty'
          ? []
          : [
              {
                id,
                slug: record.slug,
                title: record.translations[0].title,
                summary: record.translations[0].summary,
              },
            ],
      total: url.searchParams.get('q') === 'empty' ? 0 : 1,
      page: 1,
      limit: 12,
    });
  if (url.pathname === '/fixture/iot-state' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    iotPublished = JSON.parse(body).published === true;
    return send(200, { published: iotPublished });
  }
  if (url.pathname === '/api/v1/services/iot-solutions') {
    const locale = url.searchParams.get('locale');
    if (!iotPublished || !['ar', 'en', 'tr'].includes(locale))
      return send(404, { message: 'Not found' });
    const title =
      locale === 'ar'
        ? 'الأنظمة المدمجة وإنترنت الأشياء'
        : locale === 'en'
          ? 'Embedded & IoT'
          : 'Gömülü Sistemler ve IoT';
    return send(200, {
      id,
      slug: 'iot-solutions',
      locale,
      title,
      summary: 'Isolated IoT fixture',
      seoTitle: title,
      seoDescription: 'Isolated IoT fixture',
      blocks,
      relatedServices: [],
      relatedProjects: [],
    });
  }
  if (url.pathname === '/fixture/engineering-state' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    engineeringPublished = JSON.parse(body).published === true;
    return send(200, { published: engineeringPublished });
  }
  if (url.pathname === '/api/v1/services/software-product-engineering') {
    const locale = url.searchParams.get('locale');
    if (!engineeringPublished || !['ar', 'en', 'tr'].includes(locale))
      return send(404, { message: 'Not found' });
    const title =
      locale === 'ar'
        ? 'هندسة المنتجات البرمجية'
        : locale === 'en'
          ? 'Software Product Engineering'
          : 'Yazılım Ürün Mühendisliği';
    return send(200, {
      id,
      slug: 'software-product-engineering',
      locale,
      title,
      summary: 'Isolated engineering fixture',
      seoTitle: title,
      seoDescription: 'Isolated engineering fixture',
      blocks,
      relatedServices: [],
      relatedProjects: [],
    });
  }
  if (url.pathname === '/fixture/erp-state' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    erpPublished = JSON.parse(body).published === true;
    return send(200, { published: erpPublished });
  }
  if (url.pathname === '/api/v1/services/erp-solutions') {
    const locale = url.searchParams.get('locale');
    if (!erpPublished || !['ar', 'en', 'tr'].includes(locale))
      return send(404, { message: 'Not found' });
    const title =
      locale === 'ar'
        ? 'حلول تخطيط موارد المؤسسات'
        : locale === 'en'
          ? 'ERP Solutions'
          : 'ERP Çözümleri';
    return send(200, {
      id,
      slug: 'erp-solutions',
      locale,
      title,
      summary: 'Isolated ERP fixture',
      seoTitle: title,
      seoDescription: 'Isolated ERP fixture',
      blocks,
      relatedServices: [],
      relatedProjects: [],
    });
  }
  if (url.pathname === '/fixture/business-automation-state' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    businessAutomationPublished = JSON.parse(body).published === true;
    return send(200, { published: businessAutomationPublished });
  }
  if (url.pathname === '/api/v1/services/business-automation') {
    const locale = url.searchParams.get('locale');
    if (!businessAutomationPublished || !['ar', 'en', 'tr'].includes(locale))
      return send(404, { message: 'Not found' });
    const title =
      locale === 'ar'
        ? 'المنصات الذكية والأتمتة'
        : locale === 'en'
          ? 'Intelligent Platforms and Automation'
          : 'İş Otomasyonu';
    return send(200, {
      id,
      slug: 'business-automation',
      locale,
      title,
      summary: 'Isolated automation fixture',
      seoTitle: title,
      seoDescription: 'Isolated automation fixture',
      blocks,
      relatedServices: [],
      relatedProjects: [],
    });
  }
  if (url.pathname === '/fixture/consulting-state' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    consultingPublished = JSON.parse(body).published === true;
    return send(200, { published: consultingPublished });
  }
  if (url.pathname === '/api/v1/services/it-consulting') {
    const locale = url.searchParams.get('locale');
    if (!consultingPublished || !['ar', 'en', 'tr'].includes(locale))
      return send(404, { message: 'Not found' });
    const title =
      locale === 'ar'
        ? 'الاستشارات التقنية'
        : locale === 'en'
          ? 'Technology Consulting'
          : 'Teknoloji Danışmanlığı';
    return send(200, {
      id,
      slug: 'it-consulting',
      locale,
      title,
      summary: 'Isolated consulting fixture',
      seoTitle: title,
      seoDescription: 'Isolated consulting fixture',
      blocks,
      relatedServices: [],
      relatedProjects: [],
    });
  }
  if (url.pathname.startsWith('/api/v1/services/')) {
    const t = record.translations[0];
    if (
      !url.pathname.endsWith('/development-fixture') ||
      url.searchParams.get('locale') !== 'en' ||
      !record.active ||
      !t.published
    )
      return send(404, { message: 'Not found' });
    return send(200, {
      id,
      slug: record.slug,
      locale: 'en',
      title: t.title,
      summary: t.summary,
      seoTitle: t.seoTitle,
      seoDescription: t.seoDescription,
      blocks: t.blocks,
      relatedServices: [],
      relatedProjects: [],
    });
  }
  if (url.pathname === '/api/v1/leads/options')
    return send(200, {
      budgetRanges: [{ value: 'fixture-budget', label: 'Fixture budget' }],
      services: [{ id, title: 'Development service fixture' }],
      attachmentsEnabled: false,
      maxAttachments: 3,
      maxAttachmentBytes: 2097152,
      turnstileSiteKey: null,
    });
  if (url.pathname === '/api/v1/newsletter/config') return send(200, { turnstileSiteKey: null });
  if (url.pathname === '/api/v1/leads/submit' && req.method === 'POST')
    return send(202, { reference: 'lead-fixture-001' });
  if (url.pathname === '/api/v1/cms/auth/login') return send(200, { token });
  if (req.headers.authorization !== `Bearer ${token}`)
    return send(401, { message: 'Unauthorized' });
  if (url.pathname.endsWith('/auth/me')) return send(200, { id: 'test-admin', role: 'ADMIN' });
  if (url.pathname.endsWith('/auth/logout')) return send(200, { ok: true });
  if (req.method === 'GET') return send(200, { items: [record], total: 1, page: 1, limit: 12 });
  let body = '';
  for await (const chunk of req) body += chunk;
  const value = JSON.parse(body);
  record = { ...value, id, version: record.version + 1 };
  return send(200, record);
}).listen(4100, '127.0.0.1');
