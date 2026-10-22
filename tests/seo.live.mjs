import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { seoFieldsSchema } from '../packages/validation/dist/index.js';

test('production HTML, sitemap and RSS share CMS SEO policy', async (t) => {
  const translations = ['en', 'tr', 'ar'].map((locale) => ({
    locale,
    canonical: '',
    seo: seoFieldsSchema.parse({}),
  }));
  const items = ['/', '/contact', '/services'].flatMap((route) =>
    translations.map((tr) => ({
      ...tr,
      route,
      title: route === '/' ? 'Home' : route.slice(1),
      updatedAt: null,
      translations,
    })),
  );
  items.find((r) => r.route === '/contact' && r.locale === 'tr').seo = seoFieldsSchema.parse({
    robots: 'noindex,follow',
  });
  for (const item of items.filter((r) => r.route === '/contact'))
    item.translations = items
      .filter((r) => r.route === '/contact')
      .map(({ locale, canonical, seo }) => ({ locale, canonical, seo }));
  const organization = {
    companyName: 'Verified fixture company',
    legalName: 'Verified fixture legal name',
    email: 'info@example.com',
  };
  const api = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'application/json');
    if (url.pathname.endsWith('/seo/organization')) return res.end(JSON.stringify(organization));
    if (url.pathname.endsWith('/seo/routes')) {
      const rows = items.filter(
        (r) => !url.searchParams.has('path') || r.route === url.searchParams.get('path'),
      );
      return res.end(JSON.stringify({ items: rows, total: rows.length }));
    }
    if (url.pathname.endsWith('/insights'))
      return res.end(JSON.stringify({ items: [], total: 0, page: 1, limit: 100 }));
    res.statusCode = 404;
    res.end('{}');
  });
  await new Promise((r) => api.listen(0, '127.0.0.1', r));
  t.after(() => api.close());
  const port = 18000 + Math.floor(Math.random() * 1000),
    site = 'https://verified.example';
  const child = spawn(
    process.execPath,
    [resolve('node_modules/next/dist/bin/next'), 'start', '--port', String(port)],
    {
      cwd: resolve('apps/web'),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        API_URL: `http://127.0.0.1:${api.address().port}`,
        SITE_URL: site,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let output = '';
  child.stdout.on('data', (d) => (output += d));
  child.stderr.on('data', (d) => (output += d));
  t.after(() => child.kill());
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + '/health')).ok) break;
    } catch { /* Retry until the production server is ready. */ }
    if (child.exitCode !== null) assert.fail(output);
    await setTimeout(100);
  }
  for (const locale of ['en', 'tr', 'ar']) {
    const response = await fetch(base + '/' + locale);
    assert.equal(response.status, 200);
    const html = await response.text(),
      head = html.split('</head>')[0];
    assert.match(head, new RegExp(`rel="canonical" href="${site}/${locale}"`));
    for (const lang of ['en', 'tr', 'ar']) assert.match(head, new RegExp(`hrefLang="${lang}"`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const graphs = [
      ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    ].map((m) => JSON.parse(m[1]));
    assert.ok(
      graphs.some((g) =>
        g['@graph']?.some(
          (n) => n['@type'] === 'Organization' && n.legalName === organization.legalName,
        ),
      ),
    );
  }
  const xml = await fetch(base + '/sitemap.xml');
  assert.equal(xml.status, 200);
  const sitemap = await xml.text();
  assert.match(sitemap, /<loc>https:\/\/verified.example\/en<\/loc>/);
  assert.doesNotMatch(sitemap, /verified.example\/tr\/contact/);
  assert.match(sitemap, /hreflang="ar"/);
  const robots = await fetch(base + '/robots.txt');
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/verified.example\/sitemap.xml/);
  const rss = await fetch(base + '/rss.xml?locale=ar');
  assert.equal(rss.status, 200);
  assert.match(await rss.text(), /<language>ar<\/language>/);
});

