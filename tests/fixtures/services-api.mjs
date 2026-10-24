// Isolated Playwright-only API fixture. Never imported by application code.
import { createServer } from 'node:http';
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
createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url, 'http://localhost');
  const send = (status, body) => {
    res.writeHead(status);
    res.end(JSON.stringify(body));
  };
  if (url.pathname === '/health') return send(200, { ok: true });
  // Code-owned product sitemap entries are tested independently of CMS records.
  if (url.pathname === '/api/v1/seo/routes') return send(200, { items: [], total: 0 });
  const home = url.pathname.match(/^\/api\/v1\/home\/(en|tr|ar)$/);
  if (home)
    return send(200, {
      content: { copy: homeCopy[home[1]], hero: referenceHeroCopy[home[1]] },
      partners: [],
    });
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
