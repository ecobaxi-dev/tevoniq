// Opt-in local PostgreSQL + production frontend verification. Never run against production.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, delimiter } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { hashPassword, digest } from '../apps/api/dist/cms/password.js';
import { initialSolutionNames } from '../apps/api/prisma/solution-catalog.ts';
import { categorySlug } from '../apps/api/prisma/service-catalog.ts';
import { solutionAreas } from '../packages/validation/dist/index.js';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const origin = process.env.SOLUTIONS_TEST_WEB_URL ?? 'http://localhost:3200';
const base = 'http://localhost:4000/api/v1';
const run = randomUUID(),
  slug = `development-solution-${run}`;
const password = randomBytes(24).toString('hex');
const users = [],
  serviceIds = [],
  solutionIds = [];
const report = { checks: [], screenshots: [] };
const labels = {
  en: 'Development solution verification',
  tr: 'Geliştirme çözümü doğrulaması',
  ar: 'التحقق من حل للتطوير',
};
let browser, page, solution, token;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function passed(check) {
  report.checks.push(check);
  console.log(`PASS ${check}`);
}
async function api(path, { method = 'GET', body, auth = token, status = 200 } = {}) {
  await wait(800);
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  assert.equal(res.status, status, `${method} ${path}: ${await res.clone().text()}`);
  return res.json();
}
function writable(r) {
  const {
    slug,
    status,
    active,
    published,
    featured,
    sortOrder,
    version,
    serviceIds,
    industryIds,
    projectIds,
  } = r;
  return {
    slug,
    status,
    active,
    published,
    featured,
    sortOrder,
    version,
    serviceIds,
    industryIds,
    projectIds,
    translations: r.translations.map(
      ({ locale, name, shortDescription, published, seoTitle, seoDescription, blocks }) => ({
        locale,
        name,
        shortDescription,
        published,
        seoTitle,
        seoDescription,
        blocks,
      }),
    ),
  };
}
function blocks(locale) {
  return Object.entries(solutionAreas).map(([area, type]) => {
    const content = { id: randomUUID(), type, title: `${labels[locale]} — ${area}` };
    if (type === 'hero') Object.assign(content, { description: labels[locale], assetKey: 'none' });
    else if (type === 'overview') content.body = labels[locale];
    else if (type === 'cta')
      Object.assign(content, { body: labels[locale], label: labels[locale], href: '/contact' });
    else if (type.startsWith('related-')) content.ids = [];
    else
      content.items =
        type === 'faq'
          ? [{ question: `${labels[locale]}?`, answer: labels[locale] }]
          : [{ title: labels[locale], description: labels[locale] }];
    return { area, content };
  });
}
async function saveUi() {
  const result = page.waitForResponse(
    (r) => r.url().includes('/api/cms/solutions') && ['PUT', 'POST'].includes(r.request().method()),
  );
  await page.getByRole('button', { name: 'Save solution', exact: true }).click();
  const response = await result;
  assert.ok(response.ok(), await response.text());
  solution = await response.json();
  if (!solutionIds.includes(solution.id)) solutionIds.push(solution.id);
  await expect(page.getByRole('status').filter({ hasText: 'Solution saved.' })).toBeVisible();
}
async function selectSolution() {
  await page.goto(`${origin}/admin/solutions`);
  await page.getByLabel('Search solutions', { exact: true }).fill(slug);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(`^${labels.en} (DRAFT|PUBLISHED) ·`) }).click();
}
async function noOverflow(label) {
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    label,
  );
}
try {
  await mkdir('artifacts', { recursive: true });
  const beforeServices = await db.service.findMany({
    orderBy: { slug: 'asc' },
    include: { translations: true },
  });
  const seeds = await db.solution.findMany({
    orderBy: { slug: 'asc' },
    include: { translations: true, services: true },
  });
  assert.equal(seeds.length, 10);
  assert.deepEqual(
    seeds.map((s) => s.slug),
    initialSolutionNames.map(categorySlug).sort(),
  );
  assert.ok(
    seeds.every(
      (s) =>
        !s.active &&
        !s.published &&
        !s.featured &&
        s.status === 'DRAFT' &&
        s.translations.length === 1 &&
        !s.translations[0].published &&
        s.services.length === 0,
    ),
  );
  const pathKey = Object.keys(process.env).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
  for (let i = 0; i < 2; i++) {
    execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'db', 'seed'], {
      cwd: resolve('apps/api'),
      stdio: 'pipe',
      env: {
        ...process.env,
        [pathKey]: `${resolve('node_modules/.bin')}${delimiter}${process.env[pathKey]}`,
      },
    });
    assert.deepEqual(
      await db.solution.findMany({
        orderBy: { slug: 'asc' },
        include: { translations: true, services: true },
      }),
      seeds,
    );
  }
  report.seedCount = seeds.length;
  passed(
    '10 exact inactive/unpublished draft seed records; two seed reruns preserve IDs, content and timestamps',
  );
  for (const locale of ['en', 'tr', 'ar'])
    assert.equal((await api(`/solutions?locale=${locale}`, { auth: null })).total, 0);
  await api(`/solutions/${seeds[0].slug}`, { status: 404, auth: null });
  await api('/solutions/INVALID_slug', { status: 404, auth: null });
  await api('/cms/solutions', { status: 401, auth: null });
  const passwordHash = await hashPassword(password),
    tokens = {};
  for (const role of ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'EDITOR', 'VIEWER']) {
    const user = await db.cmsUser.create({
      data: { email: `${role.toLowerCase()}-${run}@example.invalid`, role, passwordHash },
    });
    users.push(user);
    tokens[role] = randomBytes(32).toString('hex');
    await db.cmsSession.create({
      data: {
        tokenHash: digest(tokens[role]),
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    assert.equal((await api('/cms/solutions', { auth: tokens[role] })).total, 10);
  }
  token = tokens.ADMIN;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
  // Pace browser-driven CMS traffic within the unchanged API rate limit.
  await page.route('**/api/cms/**', async (route) => {
    await wait(450);
    await route.continue();
  });
  await page.goto(`${origin}/solutions`);
  await expect(page).toHaveURL(`${origin}/en/solutions`);
  await expect(page.getByRole('status')).toContainText('No solutions');
  assert.equal((await page.goto(`${origin}/en/solutions/not-a-real-solution`)).status(), 404);
  const crossOrigin = await fetch(`${origin}/api/cms/auth/login`, {
    method: 'POST',
    headers: { Origin: 'https://outside.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: users[0].email, password }),
  });
  assert.equal(crossOrigin.status, 403);
  await page.goto(`${origin}/admin/solutions`);
  await page.route('**/api/cms/auth/me', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Temporary verification outage' }) }), { times: 1 });
  await page.reload();
  await expect(page.getByRole('alert')).toHaveText('Temporary verification outage');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(users.find((u) => u.role === 'ADMIN').email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'New solution', exact: true }).click();
  await page.getByLabel('Slug', { exact: true }).fill(slug);
  await page.getByLabel('Solution name', { exact: true }).fill(labels.en);
  await saveUi();
  for (const locale of ['en', 'tr', 'ar']) {
    await page.getByLabel('Translation', { exact: true }).selectOption(locale);
    if (locale !== 'en')
      await page.getByRole('button', { name: 'Add translation', exact: true }).click();
    await page.getByLabel('Solution name', { exact: true }).fill(labels[locale]);
    await page.getByLabel('Short description', { exact: true }).fill(labels[locale]);
    await page.getByLabel('SEO title', { exact: true }).fill(`${labels[locale]} SEO`);
    await page.getByLabel('SEO description', { exact: true }).fill(`${labels[locale]} metadata`);
    await page.getByLabel('Section type', { exact: true }).selectOption('hero');
    await page.getByRole('button', { name: 'Add section', exact: true }).click();
    await page.getByLabel('Block heading', { exact: true }).fill(`${labels[locale]} — hero`);
    await page.getByLabel('Hero description', { exact: true }).fill(labels[locale]);
    if (locale === 'ar') await expect(page.locator('.cms-fields')).toHaveAttribute('dir', 'rtl');
    await saveUi();
  }
  await page.getByLabel('Find services to include', { exact: true }).fill('Cybersecurity');
  await page.getByRole('checkbox', { name: 'Cybersecurity · inactive', exact: true }).check();
  await saveUi();
  assert.equal(solution.serviceIds.length, 1);
  await page.getByRole('button', { name: 'Preview saved solution', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Private solution preview' })).toContainText(
    labels.en,
  );
  await api(`/cms/solutions/${solution.id}/preview`, { auth: null, status: 401 });
  await api(`/solutions/${slug}`, { auth: null, status: 404 });
  passed(
    'Real CMS login/create, EN/TR/AR content and hero/SEO fields, searchable service attachment and authenticated draft preview',
  );
  for (const role of ['EDITOR', 'VIEWER']) {
    await api('/cms/solutions', {
      auth: tokens[role],
      method: 'POST',
      body: writable(solution),
      status: 403,
    });
    await api(`/cms/solutions/${solution.id}`, {
      auth: tokens[role],
      method: 'PUT',
      body: { ...writable(solution), active: true },
      status: 403,
    });
    await api(`/cms/solutions/${solution.id}`, {
      auth: tokens[role],
      method: 'DELETE',
      body: { version: solution.version },
      status: 403,
    });
    await api(`/cms/solutions/${solution.id}/preview`, { auth: tokens[role] });
    const readContext = await browser.newContext();
    await readContext.addCookies([
      {
        name: 'tevoniq_cms_session',
        value: tokens[role],
        url: `${origin}/api/cms`,
        httpOnly: true,
        sameSite: 'Strict',
      },
    ]);
    const readPage = await readContext.newPage();
    await readPage.goto(`${origin}/admin/solutions`);
    await readPage.getByRole('button', { name: new RegExp(labels.en) }).click();
    await expect(readPage.getByLabel('Solution name', { exact: true })).toBeDisabled();
    await expect(readPage.getByLabel('Translation', { exact: true })).toBeEnabled();
    await expect(readPage.getByRole('button', { name: 'New solution', exact: true })).toHaveCount(
      0,
    );
    await readContext.close();
  }
  for (const role of ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']) {
    solution = await api(`/cms/solutions/${solution.id}`, {
      auth: tokens[role],
      method: 'PUT',
      body: writable(solution),
    });
    const other = await api('/cms/solutions', {
      auth: tokens[role],
      method: 'POST',
      body: {
        ...writable(solution),
        slug: `${slug}-${role.toLowerCase().replaceAll('_', '-')}`,
        version: 0,
      },
      status: 201,
    });
    solutionIds.push(other.id);
    await api(`/cms/solutions/${other.id}`, {
      auth: tokens[role],
      method: 'DELETE',
      body: { version: other.version },
    });
  }
  await api('/cms/solutions', {
    method: 'POST',
    body: { ...writable(solution), version: 0 },
    status: 409,
  });
  await api(`/cms/solutions/${solution.id}`, {
    method: 'PUT',
    body: { ...writable(solution), slug: seeds[0].slug },
    status: 409,
  });
  await api(`/cms/solutions/${solution.id}`, {
    method: 'PUT',
    body: { ...writable(solution), version: 0 },
    status: 409,
  });
  const auditBefore = await db.cmsAudit.count({ where: { entityId: solution.id } });
  await api(`/cms/solutions/${solution.id}`, {
    method: 'PUT',
    body: { ...writable(solution), serviceIds: [randomUUID()] },
    status: 400,
  });
  assert.equal(await db.cmsAudit.count({ where: { entityId: solution.id } }), auditBefore);
  assert.equal((await api(`/cms/solutions/${solution.id}`)).version, solution.version);
  passed(
    'All five roles enforced in API/UI; authorized CRUD; safe duplicate/stale conflicts and atomic invalid-link rollback',
  );
  for (const suffix of ['a', 'b']) {
    const service = await api('/cms/services', {
      method: 'POST',
      status: 201,
      body: {
        slug: `development-service-${run}-${suffix}`,
        active: true,
        sortOrder: 0,
        version: 0,
        translations: ['en', 'tr', 'ar'].map((locale) => ({
          locale,
          title: `${labels[locale]} service ${suffix}`,
          summary: labels[locale],
          published: true,
          seoTitle: labels[locale],
          seoDescription: labels[locale],
          blocks: [blocks(locale)[0].content],
        })),
      },
    });
    serviceIds.push(service.id);
  }
  solution = await api(`/cms/solutions/${solution.id}`, {
    method: 'PUT',
    body: {
      ...writable(solution),
      serviceIds: [...solution.serviceIds, ...serviceIds],
      translations: writable(solution).translations.map((t) => ({
        ...t,
        blocks: blocks(t.locale),
      })),
    },
  });
  const other = await api('/cms/solutions', {
    method: 'POST',
    status: 201,
    body: {
      ...writable(solution),
      slug: `${slug}-related`,
      version: 0,
      translations: writable(solution).translations.map((t) => ({
        ...t,
        name: `${t.name} relationship check`,
      })),
    },
  });
  solutionIds.push(other.id);
  await api(`/cms/solutions/${other.id}`, {
    method: 'PUT',
    body: {
      ...writable(other),
      status: 'PUBLISHED',
      published: true,
      featured: true,
      active: false,
      translations: writable(other).translations.map((t) => ({ ...t, published: true })),
    },
  });
  await api(`/solutions/${other.slug}`, { auth: null, status: 404 });
  assert.equal(await db.solutionService.count({ where: { serviceId: serviceIds[0] } }), 2);
  await selectSolution();
  await page
    .locator('.cms-block')
    .nth(2)
    .getByRole('button', { name: 'Move up', exact: true })
    .click();
  await page.getByRole('button', { name: 'Move service 3 up', exact: true }).click();
  await page.getByLabel('Sort order', { exact: true }).fill('2');
  await page.getByLabel('Featured', { exact: true }).check();
  await page.getByLabel('Active', { exact: true }).check();
  await saveUi();
  await api(`/solutions/${slug}`, { auth: null, status: 404 });
  for (const locale of ['en', 'tr', 'ar']) {
    await page.getByLabel('Translation', { exact: true }).selectOption(locale);
    await page.getByLabel('Publish this translation', { exact: true }).check();
    if (locale === 'en') await page.getByLabel('Publish solution', { exact: true }).check();
    await saveUi();
    if (locale === 'en') await api(`/solutions/${slug}?locale=ar`, { auth: null, status: 404 });
  }
  passed(
    'All 12 business sections, M:N Service links, block/service/catalog reorder, feature, activate and localized publication',
  );
  for (const locale of ['en', 'tr', 'ar']) {
    const detail = await api(`/solutions/${slug}?locale=${locale}`, { auth: null });
    assert.deepEqual(
      detail.services.map((s) => s.id),
      [serviceIds[1], serviceIds[0]],
    );
    assert.deepEqual(detail.projects, []);
    assert.deepEqual(detail.industries, []);
    assert.deepEqual(detail.availableLocales.sort(), ['ar', 'en', 'tr']);
    const response = await page.goto(`${origin}/${locale}/solutions/${slug}`);
    assert.equal(response.status(), 200);
    await expect(page).toHaveTitle(`${labels[locale]} SEO`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      `${labels[locale]} metadata`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      `${labels[locale]} SEO`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${origin}/${locale}/solutions/${slug}`,
    );
    for (const lang of ['en', 'tr', 'ar'])
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute(
        'href',
        `${origin}/${lang}/solutions/${slug}`,
      );
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    const structured = await page.locator('script[type="application/ld+json"]').textContent();
    assert.equal(JSON.parse(structured)['@type'], 'BreadcrumbList');
    assert.equal(JSON.parse(structured).itemListElement.length, 3);
    for (const area of Object.keys(solutionAreas).filter(
      (a) => !['industries', 'relatedProjects'].includes(a),
    ))
      await expect(
        page.getByRole('heading', { name: `${labels[locale]} — ${area}`, exact: true }),
      ).toBeVisible();
    await page.getByRole('button', { name: `${labels[locale]}?`, exact: true }).click();
    await noOverflow(`${locale} desktop detail`);
    if (locale === 'en')
      assert.deepEqual(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
        [],
      );
  }
  assert.equal((await api('/solutions?featured=true&limit=1', { auth: null })).total, 1);
  assert.equal((await api('/solutions?featured=false', { auth: null })).total, 0);
  assert.deepEqual((await api('/solutions?page=2&limit=1', { auth: null })).items, []);
  assert.equal(
    (await api(`/solutions?service=development-service-${run}-a`, { auth: null })).total,
    1,
  );
  assert.equal((await api('/solutions?service=cybersecurity', { auth: null })).total, 0);
  passed(
    'Publication-safe linked Services; localized SEO/canonical/hreflang/OpenGraph/breadcrumbs, modular sections, filters and pagination',
  );
  for (const width of [1440, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/en/solutions',
      '/ar/solutions',
      `/ar/solutions/${slug}`,
      '/admin/solutions',
    ]) {
      await wait(1500);
      await page.goto(`${origin}${route}`);
      await noOverflow(`${width} ${route}`);
      if (width !== 320) {
        const name = `${width}-${route.includes('admin') ? 'admin' : route.includes(slug) ? 'detail-ar' : route.includes('/ar/') ? 'listing-ar' : 'listing-en'}`;
        const path = `artifacts/solutions-${name}.png`;
        await page.screenshot({ path, fullPage: false });
        report.screenshots.push(path);
      }
    }
  }
  await selectSolution();
  await page.getByLabel('Translation', { exact: true }).selectOption('ar');
  await noOverflow('Arabic CMS editor at 320px');
  await page.getByLabel('Solution name', { exact: true }).fill(`${labels.ar} — تعديل`);
  await saveUi();
  await page.getByLabel('Featured', { exact: true }).uncheck();
  await saveUi();
  await page.getByLabel('Publish solution', { exact: true }).uncheck();
  await saveUi();
  await api(`/solutions/${slug}`, { auth: null, status: 404 });
  await page.getByLabel('Active', { exact: true }).uncheck();
  await saveUi();
  await page.getByRole('button', { name: 'View audit history', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Audit history' })).toContainText(
    'solution.deactivate',
  );
  // Even an explicitly requested draft preview through the public URL is rejected.
  await api(`/solutions/${slug}?preview=true`, { auth: null, status: 400 });
  const audit = await db.cmsAudit.findMany({ where: { entityId: solution.id } });
  for (const action of [
    'solution.create',
    'solution.update',
    'solution.activate',
    'solution.deactivate',
    'solution.publish',
    'solution.unpublish',
    'solution.feature',
    'solution.unfeature',
    'solution.reorder',
    'solution.reorder.en',
    'solution.services.update',
    'solution.services.reorder',
  ])
    assert.ok(
      audit.some((a) => a.action === action),
      action,
    );
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete solution', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Solution deleted.' })).toBeVisible();
  assert.equal(await db.solutionService.count({ where: { solutionId: solution.id } }), 0);
  assert.equal(await db.service.count({ where: { id: { in: serviceIds } } }), 2);
  assert.equal(
    await db.cmsAudit.count({ where: { entityId: solution.id, action: 'solution.delete' } }),
    1,
  );
  passed(
    'Responsive EN/AR listing/detail/admin, Arabic editing, update/unfeature/unpublish/deactivate/delete and complete audit history',
  );
  await db.solution.deleteMany({ where: { id: { in: solutionIds } } });
  await db.service.deleteMany({ where: { id: { in: serviceIds } } });
  assert.deepEqual(
    await db.service.findMany({ orderBy: { slug: 'asc' }, include: { translations: true } }),
    beforeServices,
  );
  assert.deepEqual(
    await db.solution.findMany({
      orderBy: { slug: 'asc' },
      include: { translations: true, services: true },
    }),
    seeds,
  );
  passed(
    'Temporary records removed; existing Services unchanged; final 10 Solutions remain inactive drafts',
  );
} catch (error) {
  report.error = error.stack;
  await page
    ?.screenshot({ path: 'artifacts/solutions-failure.png', fullPage: true })
    .catch(() => {});
  throw error;
} finally {
  await db.solution.deleteMany({ where: { OR: [{ id: { in: solutionIds } }, { slug }] } });
  await db.service.deleteMany({ where: { id: { in: serviceIds } } });
  await db.cmsUser.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
  await db.loginThrottle.deleteMany({
    where: { key: { in: users.map((u) => digest(`account:${u.email}`)) } },
  });
  await browser?.close();
  await db.$disconnect();
  await writeFile('artifacts/solutions-verification.json', JSON.stringify(report, null, 2));
}
