// Opt-in integration verification against the local development database and running apps.
// Run: node tests/services.live.mjs
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, delimiter } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { hashPassword, digest } from '../apps/api/dist/cms/password.js';
import { initialServiceNames, categorySlug } from '../apps/api/prisma/service-catalog.ts';
import { chromium } from '@playwright/test';
import { expect } from '@playwright/test';
config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development', 'Only run against development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const origin = process.env.SERVICES_TEST_WEB_URL ?? 'http://localhost:3200';
const apiBase = 'http://localhost:4000/api/v1';
const runId = randomUUID();
const slug = `development-verification-${runId}`;
const password = randomBytes(32).toString('hex');
const users = [];
const report = { checks: [], roles: {}, screenshots: [] };
let service;
let browser;
let page;
function passed(name) {
  report.checks.push(name);
  console.log(`PASS ${name}`);
}
async function request(path, { method = 'GET', token, body, status = 200 } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(response.status, status, `${method} ${path}: ${await response.clone().text()}`);
  return response.json();
}
const writeValue = (row) => ({
  slug: row.slug,
  active: row.active,
  sortOrder: row.sortOrder,
  version: row.version,
  translations: row.translations.map(
    ({ locale, title, summary, published, seoTitle, seoDescription, blocks }) => ({
      locale,
      title,
      summary,
      published,
      seoTitle,
      seoDescription,
      blocks,
    }),
  ),
});
const text = {
  en: 'Development verification only',
  tr: 'Yalnızca geliştirme doğrulaması',
  ar: 'للتحقق في بيئة التطوير فقط',
};
const blocks = (locale) => {
  const base = (type) => ({ id: randomUUID(), type, title: `${text[locale]} — ${type}` });
  return [
    { ...base('hero'), description: text[locale], assetKey: 'none' },
    { ...base('overview'), body: text[locale] },
    ...['benefits', 'capabilities', 'features', 'use-cases', 'industries', 'technology-stack'].map(
      (type) => ({ ...base(type), items: [{ title: text[locale], description: text[locale] }] }),
    ),
    { ...base('faq'), items: [{ question: `${text[locale]}?`, answer: text[locale] }] },
    { ...base('related-projects'), ids: [randomUUID()] },
    { ...base('related-services'), ids: [randomUUID()] },
    { ...base('cta'), body: text[locale], label: text[locale], href: '/contact' },
  ];
};
async function saveUi() {
  const response = page.waitForResponse(
    (r) => r.url().includes('/api/cms/services') && ['PUT', 'POST'].includes(r.request().method()),
  );
  await page.getByRole('button', { name: 'Save service', exact: true }).click();
  const saved = await response;
  assert.ok(saved.ok(), await saved.text());
  service = await saved.json();
  await expect(page.getByRole('status')).toHaveText('Service saved.');
}
async function noOverflow(label) {
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(dimensions.scroll <= dimensions.width + 1, `${label}: ${JSON.stringify(dimensions)}`);
}
try {
  await mkdir('artifacts', { recursive: true });
  assert.equal((await db.$queryRaw`SELECT 1 AS connected`)[0].connected, 1);
  const migrations =
    await db.$queryRaw`SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY migration_name`;
  assert.deepEqual(
    migrations.map((m) => m.migration_name),
    (await readdir('apps/api/prisma/migrations', { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort(),
  );
  assert.ok(migrations.every((m) => m.finished_at && !m.rolled_back_at));
  report.migrations = migrations.map((m) => m.migration_name);
  passed('PostgreSQL connectivity and all repository migrations completed');
  const seeded = await db.service.findMany({
    include: { translations: true },
    orderBy: { slug: 'asc' },
  });
  assert.equal(seeded.length, 35);
  assert.deepEqual(seeded.map((s) => s.slug).sort(), initialServiceNames.map(categorySlug).sort());
  for (const row of seeded) {
    assert.equal(row.active, false);
    assert.equal(row.translations.length, 1);
    assert.equal(row.translations[0].locale, 'en');
    assert.equal(row.translations[0].published, false);
    assert.equal(
      row.translations[0].title,
      initialServiceNames.find((name) => categorySlug(name) === row.slug),
    );
    assert.deepEqual(row.translations[0].blocks, []);
  }
  report.seedCount = seeded.length;
  const seedSnapshot = JSON.stringify(seeded);
  for (let run = 0; run < 2; run++) {
    const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') ?? 'PATH';
    execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'db', 'seed'], {
      cwd: resolve('apps/api'),
      stdio: 'pipe',
      env: {
        ...process.env,
        [pathKey]: `${resolve('node_modules/.bin')}${delimiter}${process.env[pathKey]}`,
      },
    });
    assert.equal(
      JSON.stringify(
        await db.service.findMany({ include: { translations: true }, orderBy: { slug: 'asc' } }),
      ),
      seedSnapshot,
    );
  }
  passed(
    'Two consecutive db:seed executions preserve all 35 records, IDs, timestamps and draft states',
  );
  passed(
    'Exactly 35 requested inactive, unpublished English seed records with no invented content',
  );
  const indexes =
    await db.$queryRaw`SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename IN ('Service','ServiceTranslation','CmsAudit')`;
  report.indexes = indexes;
  for (const name of [
    'Service_slug_key',
    'Service_active_sortOrder_slug_idx',
    'ServiceTranslation_serviceId_locale_key',
    'ServiceTranslation_locale_published_idx',
    'CmsAudit_entityId_createdAt_idx',
  ])
    assert.ok(indexes.some((i) => i.indexname === name));
  const constraints =
    await db.$queryRaw`SELECT conname FROM pg_constraint WHERE contype='f' AND conrelid IN ('"Service"'::regclass,'"ServiceTranslation"'::regclass)`;
  assert.equal(constraints.length, 3);
  passed('Database uniqueness, publication/sorting/audit indexes and service foreign keys');
  for (const locale of ['en', 'tr', 'ar'])
    assert.equal((await request(`/services?locale=${locale}`)).total, 0);
  await request(`/services/${seeded[0].slug}`, { status: 404 });
  await request('/services/INVALID_slug', { status: 404 });
  await request('/services/missing-development-service', { status: 404 });
  await request('/cms/services', { status: 401 });
  passed(
    'Empty public catalogs; drafts and invalid/missing slugs return 404; anonymous CMS returns 401',
  );
  const passwordHash = await hashPassword(password);
  const tokens = {};
  for (const role of ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'EDITOR', 'VIEWER']) {
    const user = await db.cmsUser.create({
      data: { email: `${role.toLowerCase()}-${runId}@example.invalid`, role, passwordHash },
    });
    users.push(user);
    const token = randomBytes(32).toString('hex');
    await db.cmsSession.create({
      data: {
        tokenHash: digest(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    tokens[role] = token;
    assert.equal((await request('/cms/auth/me', { token })).role, role);
    assert.equal((await request('/cms/services', { token })).total, 35);
    report.roles[role] = ['authenticated', 'read'];
  }
  const admin = tokens.ADMIN;
  const proxyDenied = await fetch(`${origin}/api/cms/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://outside.example' },
    body: JSON.stringify({ email: users[0].email, password }),
  });
  assert.equal(proxyDenied.status, 403);
  const pages = await Promise.all(
    [1, 2, 3, 4].map((p) => request(`/cms/services?page=${p}&limit=12`, { token: admin })),
  );
  assert.deepEqual(
    pages.map((p) => p.items.length),
    [12, 12, 11, 0],
  );
  assert.equal(new Set(pages.flatMap((p) => p.items.map((s) => s.id))).size, 35);
  await request('/cms/services?limit=1000', { token: admin, status: 400 });
  passed('Admin pagination: 12/12/11/0 records, no overlaps, bounded queries');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
  await page.goto(`${origin}/services`);
  await expect(page).toHaveURL(`${origin}/en/services`);
  await page.goto(`${origin}/admin/services`);
  await page.getByLabel('Email', { exact: true }).fill(users.find((u) => u.role === 'ADMIN').email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'New service', exact: true }).click();
  await page.getByLabel('Slug', { exact: true }).fill(slug);
  await page.getByLabel('Service title', { exact: true }).fill(text.en);
  await saveUi();
  assert.equal(service.active, false);
  for (const locale of ['en', 'tr', 'ar']) {
    await page.getByLabel('Translation', { exact: true }).selectOption(locale);
    if (locale !== 'en')
      await page.getByRole('button', { name: 'Add translation', exact: true }).click();
    await page.getByLabel('Service title', { exact: true }).fill(text[locale]);
    await page.getByLabel('Catalog summary', { exact: true }).fill(text[locale]);
    await page.getByLabel('SEO title', { exact: true }).fill(`${text[locale]} SEO`);
    await page.getByLabel('SEO description', { exact: true }).fill(`${text[locale]} metadata`);
    await page.getByLabel('Block type', { exact: true }).selectOption('hero');
    await page.getByRole('button', { name: 'Add block', exact: true }).click();
    await page.getByLabel('Block heading', { exact: true }).fill(`${text[locale]} — hero`);
    await page.getByLabel('Hero description', { exact: true }).fill(text[locale]);
    if (locale === 'ar') await expect(page.locator('.cms-fields')).toHaveAttribute('dir', 'rtl');
    await saveUi();
  }
  const cookie = (await context.cookies(`${origin}/api/cms`)).find(
    (c) => c.name === 'tevoniq_cms_session',
  );
  assert.ok(cookie.httpOnly);
  assert.equal(cookie.sameSite, 'Strict');
  passed(
    'Real browser login, create, EN/TR/AR content, blocks, SEO and draft saves; RTL editor; HttpOnly cookie',
  );
  service = await request(`/cms/services/${service.id}`, { token: admin });
  assert.equal(service.createdById, users.find((u) => u.role === 'ADMIN').id);
  for (const role of ['EDITOR', 'VIEWER']) {
    const token = tokens[role];
    await request('/cms/services', {
      token,
      method: 'POST',
      body: writeValue(service),
      status: 403,
    });
    await request(`/cms/services/${service.id}`, {
      token,
      method: 'PUT',
      body: { ...writeValue(service), active: true },
      status: 403,
    });
    await request(`/cms/services/${service.id}`, {
      token,
      method: 'DELETE',
      body: { version: service.version },
      status: 403,
    });
    report.roles[role].push('create/update/publish/activate/delete denied by backend');
  }
  for (const role of ['SUPER_ADMIN', 'CONTENT_MANAGER']) {
    const token = tokens[role];
    service = await request(`/cms/services/${service.id}`, {
      token,
      method: 'PUT',
      body: writeValue(service),
    });
    // The validated duplicate demonstrates create authorization without adding extra records.
    await request('/cms/services', {
      token,
      method: 'POST',
      body: { ...writeValue(service), version: 0 },
      status: 409,
    });
    report.roles[role].push('update allowed; create passes guard and hits duplicate constraint');
  }
  for (const role of ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']) {
    await request(`/cms/services/${service.id}`, {
      token: tokens[role],
      method: 'DELETE',
      body: { version: 999999 },
      status: 409,
    });
    report.roles[role].push('delete authorized; stale deletion safely rejected');
  }
  await request('/cms/services', {
    token: admin,
    method: 'POST',
    body: { ...writeValue(service), version: 0 },
    status: 409,
  });
  await request(`/cms/services/${service.id}`, {
    token: admin,
    method: 'PUT',
    body: { ...writeValue(service), slug: seeded[0].slug },
    status: 409,
  });
  await request(`/cms/services/${service.id}`, {
    token: admin,
    method: 'PUT',
    body: { ...writeValue(service), version: 0 },
    status: 409,
  });
  passed(
    'Five real database roles; direct backend mutation denial; safe duplicate and stale-version conflicts',
  );
  service = await request(`/cms/services/${service.id}`, {
    token: admin,
    method: 'PUT',
    body: {
      ...writeValue(service),
      translations: writeValue(service).translations.map((t) => ({
        ...t,
        blocks: blocks(t.locale),
      })),
    },
  });
  await page.reload();
  await page.getByLabel('Search services', { exact: true }).fill(slug);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(text.en) }).click();
  await page
    .locator('.cms-block')
    .nth(2)
    .getByRole('button', { name: 'Move up', exact: true })
    .click();
  await page.getByLabel('Sort order', { exact: true }).fill('1');
  await saveUi();
  await page.getByLabel('Active — commercially offered', { exact: true }).check();
  await saveUi();
  await request(`/services/${slug}`, { status: 404 });
  assert.equal((await request('/services')).total, 0);
  passed('All 12 block types saved; UI block/sort reordering; activation alone remains private');
  for (const locale of ['en', 'tr', 'ar']) {
    await page.getByLabel('Translation', { exact: true }).selectOption(locale);
    await page.getByLabel('Publish this translation', { exact: true }).check();
    await saveUi();
  }
  report.roles.ADMIN.push('create/update/reorder/activate/publish allowed');
  for (const locale of ['en', 'tr', 'ar']) {
    const publicService = await request(`/services/${slug}?locale=${locale}`);
    assert.equal(publicService.blocks.length, 12);
    assert.deepEqual(publicService.relatedProjects, []);
    assert.deepEqual(publicService.relatedServices, []);
    const p1 = await request(`/services?locale=${locale}&limit=1&page=1`);
    const p2 = await request(`/services?locale=${locale}&limit=1&page=2`);
    assert.equal(p1.total, 1);
    assert.equal(p1.items[0].slug, slug);
    assert.deepEqual(p2.items, []);
    await page.goto(`${origin}/${locale}/services/${slug}`);
    await expect(page).toHaveTitle(`${text[locale]} SEO`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      `${text[locale]} metadata`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      `${text[locale]} SEO`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${origin}/${locale}/services/${slug}`,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    for (const type of [
      'hero',
      'overview',
      'benefits',
      'capabilities',
      'features',
      'use-cases',
      'industries',
      'technology-stack',
      'faq',
      'cta',
    ])
      await expect(
        page.getByRole('heading', { name: `${text[locale]} — ${type}`, exact: true }),
      ).toBeVisible();
    await page.getByRole('button', { name: `${text[locale]}?`, exact: true }).click();
    await expect(page.locator('[data-state="open"]')).not.toHaveCount(0);
    await noOverflow(`${locale} desktop detail`);
  }
  passed(
    'Published EN/TR/AR pages, titles/descriptions/OpenGraph/canonicals, language/direction, all blocks and public pagination',
  );
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 812 });
    for (const route of [
      '/services',
      '/ar/services',
      `/en/services/${slug}`,
      `/ar/services/${slug}`,
      '/admin/services',
    ]) {
      await page.goto(`${origin}${route}`);
      await noOverflow(`${width} ${route}`);
      if (width === 375) {
        const path = `artifacts/services-live-${route.includes('admin') ? 'admin' : route.includes(slug) ? 'detail' : 'listing'}-${route.includes('/ar/') ? 'ar' : 'en'}.png`;
        await page.screenshot({ path, fullPage: false });
        report.screenshots.push(path);
      }
    }
  }
  await page.getByLabel('Search services', { exact: true }).fill(slug);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(text.en) }).click();
  await page.getByLabel('Translation', { exact: true }).selectOption('ar');
  await noOverflow('320 Arabic admin editor');
  await page.locator('.cms-fields').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/services-live-editor-ar.png', fullPage: false });
  passed('320px/375px mobile listing, public detail and admin including Arabic editor');
  await page.getByLabel('Service title', { exact: true }).fill(`${text.ar} — تعديل`);
  await saveUi();
  for (const locale of ['en', 'tr', 'ar']) {
    await page.getByLabel('Translation', { exact: true }).selectOption(locale);
    await page.getByLabel('Publish this translation', { exact: true }).uncheck();
    await saveUi();
    await request(`/services/${slug}?locale=${locale}`, { status: 404 });
  }
  assert.equal(service.active, true);
  await page.getByLabel('Active — commercially offered', { exact: true }).uncheck();
  await saveUi();
  // A published translation on an inactive service must remain hidden too.
  service = await request(`/cms/services/${service.id}`, {
    token: tokens.CONTENT_MANAGER,
    method: 'PUT',
    body: {
      ...writeValue(service),
      translations: writeValue(service).translations.map((t) => ({
        ...t,
        published: t.locale === 'en',
      })),
    },
  });
  await request(`/services/${slug}`, { status: 404 });
  assert.equal((await request('/services')).total, 0);
  assert.equal((await page.goto(`${origin}/en/services/${slug}`)).status(), 404);
  await expect(page.getByRole('heading', { name: /404/ })).toBeVisible();
  passed('Edit, unpublish before deactivate, and direct slug/API publication bypass protection');
  await request(`/cms/services/${service.id}`, {
    token: tokens.SUPER_ADMIN,
    method: 'DELETE',
    body: { version: service.version },
  });
  report.roles.SUPER_ADMIN.push('delete allowed');
  const audits = await db.cmsAudit.findMany({
    where: { entityId: service.id },
    orderBy: { createdAt: 'asc' },
  });
  const actions = audits.map((a) => a.action);
  for (const action of [
    'service.create',
    'service.update',
    'service.activate',
    'service.deactivate',
    'service.reorder',
    'service.reorder.en',
    'service.delete',
    ...['en', 'tr', 'ar'].flatMap((l) => [`service.publish.${l}`, `service.unpublish.${l}`]),
  ])
    assert.ok(actions.includes(action), action);
  report.auditActions = [...new Set(actions)];
  assert.equal(await db.serviceTranslation.count({ where: { serviceId: service.id } }), 0);
  service = null;
  assert.equal(
    JSON.stringify(
      await db.service.findMany({ include: { translations: true }, orderBy: { slug: 'asc' } }),
    ),
    seedSnapshot,
  );
  passed(
    'Transactional audit history survives delete; translations cascade; original seed records unchanged',
  );
} catch (error) {
  report.error = error.stack;
  if (page)
    await page
      .screenshot({ path: 'artifacts/services-live-failure.png', fullPage: true })
      .catch(() => {});
  throw error;
} finally {
  if (service) await db.service.deleteMany({ where: { id: service.id, slug } });
  // Also cover interruption immediately after a browser save.
  await db.service.deleteMany({ where: { slug } });
  await db.cmsUser.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
  await db.loginThrottle.deleteMany({
    where: { key: { in: users.map((u) => digest(`account:${u.email}`)) } },
  });
  await browser?.close();
  await db.$disconnect();
  await writeFile('artifacts/services-verification.json', JSON.stringify(report, null, 2));
}
