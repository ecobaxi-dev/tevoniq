import assert from 'node:assert/strict';
import { randomUUID, randomBytes, createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { digest, hashPassword } from '../apps/api/dist/cms/password.js';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { makeDocument, makeSection } from './page-builder.fixtures.mjs';
config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const prefix = `builder-test-${randomUUID()}`,
  base = 'http://localhost:4440/api/v1',
  origin = 'http://localhost:3440',
  email = `${prefix}@example.test`,
  children = [],
  users = [],
  catalog = {},
  pageIds = [];
let token, browser;
const proxySecret = randomBytes(32).toString('hex');
const testIp = `2001:db8::${randomBytes(2).toString('hex')}:${randomBytes(2).toString('hex')}`;
function start(args, env) {
  const child = spawn(process.execPath, args, {
    env: { ...process.env, ...env },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (d) => {
    output = (output + d).slice(-8000);
  });
  child.stderr.on('data', (d) => {
    output = (output + d).slice(-8000);
  });
  children.push(child);
  return { child, output: () => output };
}
async function ready(url, server) {
  for (let i = 0; i < 140; i++) {
    if (server.child.exitCode !== null) throw Error(server.output());
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* waiting for server */
    }
    await setTimeout(250);
  }
  throw Error(server.output());
}
async function api(path, { method = 'GET', body, status = 200, auth = token } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      'x-lead-client-ip': testIp,
      'x-lead-ip-signature': createHmac('sha256', proxySecret).update(testIp).digest('hex'),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(response.status, status, `${path}: ${await response.clone().text()}`);
  return response.json();
}
const pass = (message) => console.log(`PASS ${message}`);
try {
  const a = start(['apps/api/dist/main.js'], {
      PORT: '4440',
      CORS_ORIGIN: origin,
      EMAIL_TRANSPORT: 'disabled',
      TURNSTILE_MODE: 'disabled',
      LOG_LEVEL: 'error',
      LEAD_PROXY_SECRET: proxySecret,
    }),
    w = start(['node_modules/next/dist/bin/next', 'start', 'apps/web', '--port', '3440'], {
      NODE_ENV: 'production',
      API_URL: base,
      SITE_URL: origin,
      LEAD_PROXY_SECRET: proxySecret,
      LEAD_CLIENT_IP_HEADER: 'x-test-ingress-ip',
    });
  await Promise.all([ready(`${base}/health/live`, a), ready(`${origin}/health`, w)]);
  for (const role of ['ADMIN', 'VIEWER']) {
    const user = await db.cmsUser.create({
      data: {
        email: `${role.toLowerCase()}-${email}`,
        passwordHash: await hashPassword(randomBytes(20).toString('hex')),
        role,
      },
    });
    users.push(user.id);
  }
  token = randomBytes(32).toString('hex');
  const viewerToken = randomBytes(32).toString('hex');
  await db.cmsSession.createMany({
    data: [
      { userId: users[0], tokenHash: digest(token), expiresAt: new Date(Date.now() + 3600000) },
      {
        userId: users[1],
        tokenHash: digest(viewerToken),
        expiresAt: new Date(Date.now() + 3600000),
      },
    ],
  });
  catalog.service = (
    await db.service.create({
      data: {
        slug: `${prefix}-service`,
        active: true,
        translations: {
          create: {
            locale: 'en',
            title: 'Fixture service',
            summary: 'Published service copy.',
            published: true,
          },
        },
      },
    })
  ).id;
  catalog.solution = (
    await db.solution.create({
      data: {
        slug: `${prefix}-solution`,
        active: true,
        published: true,
        status: 'PUBLISHED',
        translations: {
          create: {
            locale: 'en',
            name: 'Fixture solution',
            shortDescription: 'Published solution copy.',
            published: true,
          },
        },
      },
    })
  ).id;
  catalog.industry = (
    await db.industry.create({
      data: {
        slug: `${prefix}-industry`,
        active: true,
        published: true,
        status: 'PUBLISHED',
        translations: {
          create: {
            locale: 'en',
            name: 'Fixture industry',
            shortDescription: 'Published industry copy.',
            published: true,
          },
        },
      },
    })
  ).id;
  catalog.project = (
    await db.project.create({
      data: {
        slug: `${prefix}-project`,
        published: true,
        verified: true,
        clientName: 'Private fixture client',
        clientVisibility: 'PRIVATE',
        translations: {
          create: {
            locale: 'en',
            title: 'Fixture project',
            summary: 'Published project copy.',
            challenge: 'Challenge',
            solution: 'Solution',
            seoTitle: 'Project',
            seoDescription: 'Project description',
            published: true,
          },
        },
      },
    })
  ).id;
  const document = makeDocument(`/${prefix}`, catalog);
  document.translations.ar = {
    title: 'صفحة تجريبية',
    seoTitle: 'صفحة تجريبية',
    seoDescription: 'وصف تجريبي',
    ogImage: '',
  };
  document.sections[0].content.ar = {
    ...document.sections[0].content.en,
    heading: 'محتوى عربي من نظام الإدارة',
    text: 'معاينة الأقسام المرنة',
    eyebrow: 'مثال',
    actions: [],
  };
  const hidden = { ...makeSection('CustomHeading', 20), visible: false };
  hidden.content.en.heading = 'Hidden internal heading';
  document.sections.push(hidden);
  await api('/cms/page-builder', { auth: null, status: 401 });
  await api('/cms/page-builder', {
    method: 'POST',
    body: { document, version: 0, action: 'save' },
    auth: viewerToken,
    status: 403,
  });
  let page = await api('/cms/page-builder', {
    method: 'POST',
    body: { document, version: 0, action: 'save' },
    status: 201,
  });
  pageIds.push(page.id);
  await api(`/pages/resolve?path=${document.path}&locale=en`, { status: 404, auth: null });
  const preview = await api('/cms/page-builder/preview', {
    method: 'POST',
    body: { document, locale: 'en' },
    status: 201,
    auth: viewerToken,
  });
  assert.equal(preview.document.sections.length, 20);
  assert.equal(JSON.stringify(preview).includes('Hidden internal heading'), false);
  assert.equal(JSON.stringify(preview).includes('Private fixture client'), false);
  page = await api(`/cms/page-builder/${page.id}`, {
    method: 'PUT',
    body: { document, version: page.version, action: 'publish' },
  });
  const live = await api(`/pages/resolve?path=${document.path}&locale=en`, { auth: null });
  assert.equal(live.document.sections.length, 20);
  assert.equal(Object.keys(live.cards).length, 4);
  assert.deepEqual(Object.keys(live.document.translations), ['en']);
  assert.equal(live.draft, undefined);
  assert.equal(JSON.stringify(live).includes('Hidden internal heading'), false);
  const ar = await api(`/pages/resolve?path=${document.path}&locale=ar`, { auth: null });
  assert.equal(ar.document.sections.length, 1);
  assert.equal(ar.document.sections[0].content.en, undefined);
  await api(`/pages/resolve?path=${document.path}&locale=tr`, { status: 404, auth: null });
  assert.ok(
    (await api('/pages/sitemap', { auth: null })).items.some((p) => p.path === document.path),
  );
  pass(
    'Typed persistence, all 20 section resolvers, preview authorization, localized publication and hidden-content privacy',
  );
  const changed = structuredClone(document);
  changed.sections[0].content.en.heading = 'Unpublished revision';
  page = await api(`/cms/page-builder/${page.id}`, {
    method: 'PUT',
    body: { document: changed, version: page.version, action: 'save' },
  });
  assert.equal(
    (await api(`/pages/resolve?path=${document.path}&locale=en`)).document.sections[0].content.en
      .heading,
    'Hero fixture',
  );
  await api(`/cms/page-builder/${page.id}`, {
    method: 'PUT',
    body: { document: changed, version: 1, action: 'publish' },
    status: 409,
  });
  await api(`/cms/page-builder/${page.id}`, {
    method: 'PUT',
    body: {
      document: { ...changed, path: `/${prefix}-changed` },
      version: page.version,
      action: 'save',
    },
    status: 409,
  });
  await api(`/cms/services/${catalog.service}`, {
    method: 'DELETE',
    body: { version: 0 },
    status: 409,
  });
  await assert.rejects(
    db.service.delete({ where: { id: catalog.service } }),
    (e) => e.code === 'P2003',
  );
  await db.service.update({ where: { id: catalog.service }, data: { active: false } });
  assert.equal(
    (await api(`/pages/resolve?path=${document.path}&locale=en`)).cards[
      document.sections.find((s) => s.type === 'ServiceGrid').id
    ].length,
    0,
  );
  await api(`/cms/page-builder/${page.id}`, {
    method: 'PUT',
    body: { document: changed, version: page.version, action: 'publish' },
    status: 400,
  });
  await db.service.update({ where: { id: catalog.service }, data: { active: true } });
  assert.ok(
    (await api(`/cms/admin/search?q=${prefix}`)).items.some(
      (r) => r.href === `/admin/pages?id=${page.id}`,
    ),
  );
  pass(
    'Draft isolation, stale-save protection, reserved paths, catalog publication gates and database reference protection',
  );
  browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    extraHTTPHeaders: { 'x-test-ingress-ip': testIp },
  });
  await context.route('https://www.youtube-nocookie.com/**', (r) =>
    r.fulfill({
      contentType: 'text/html',
      body: '<html><title>Fixture video</title><body>Fixture video</body></html>',
    }),
  );
  const tab = await context.newPage(),
    errors = [];
  tab.on('pageerror', (e) => errors.push(e.message));
  await mkdir('artifacts/page-builder', { recursive: true });
  await tab.goto(`${origin}/en${document.path}`);
  await expect(tab.locator('.pb-section')).toHaveCount(20);
  await expect(tab.locator('.pb-Hero h2')).toHaveText('Hero fixture');
  await expect(tab.locator('.pb-ServiceGrid')).toContainText('Fixture service');
  await expect(tab.locator('.pb-RichText')).toContainText('<script>literal text</script>');
  assert.equal(await tab.locator('.pb-RichText script').count(), 0);
  await tab.locator('.pb-FAQ summary').click();
  await expect(tab.locator('.pb-FAQ details')).toHaveAttribute('open', '');
  assert.equal(
    await tab.locator('iframe').getAttribute('src'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  );
  await tab.evaluate(() => scrollTo(0, 0));
  await tab.screenshot({ path: 'artifacts/page-builder/public-desktop.png' });
  const axe = await new AxeBuilder({ page: tab }).disableRules(['frame-tested']).analyze();
  assert.deepEqual(
    axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
  );
  await tab.locator('.pb-Newsletter input[type=email]').fill(email);
  await tab.locator('.pb-Newsletter input[type=checkbox]').check();
  await tab.locator('.pb-Newsletter button[type=submit]').click();
  await expect(tab.locator('.pb-Newsletter [role=status]')).toHaveText(
    'Thank you for subscribing.',
  );
  let signup = await db.adminRecord.findFirstOrThrow({
    where: { module: 'newsletter', title: email },
  });
  assert.equal(signup.status, 'subscribed');
  assert.ok(signup.data.consent.includes(document.path));
  await db.adminRecord.update({ where: { id: signup.id }, data: { status: 'unsubscribed' } });
  await api('/pages/newsletter', {
    method: 'POST',
    status: 201,
    auth: null,
    body: {
      pageId: page.id,
      sectionId: document.sections.find((s) => s.type === 'Newsletter').id,
      locale: 'en',
      email,
      consent: true,
      website: '',
      turnstileToken: '',
    },
  });
  signup = await db.adminRecord.findUniqueOrThrow({ where: { id: signup.id } });
  assert.equal(signup.status, 'unsubscribed');
  assert.equal(await db.adminRecord.count({ where: { module: 'newsletter', title: email } }), 1);
  await tab.setViewportSize({ width: 390, height: 844 });
  await tab.goto(`${origin}/ar${document.path}`);
  await expect(tab.locator('.pb-section')).toHaveCount(1);
  await expect(tab.locator('.pb-Hero h2')).toHaveText('محتوى عربي من نظام الإدارة');
  assert.equal(await tab.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await tab.screenshot({ path: 'artifacts/page-builder/public-ar-mobile.png', fullPage: true });
  pass(
    'Frontend renderers, escaped content, FAQ interaction, allowlisted video, newsletter consent/deduplication, accessibility and Arabic mobile layout',
  );
  await tab.setViewportSize({ width: 1440, height: 1000 });
  await context.addCookies([
    {
      name: 'tevoniq_cms_session',
      value: token,
      domain: 'localhost',
      path: '/api/cms',
      httpOnly: true,
      sameSite: 'Strict',
    },
  ]);
  await tab.goto(`${origin}/admin/pages?id=${page.id}`);
  await expect(tab.getByLabel('Page path', { exact: true })).toHaveValue(document.path);
  await expect(tab.locator('.pb-preview-panel .pb-Hero h2')).toHaveText('Unpublished revision');
  await expect(tab.locator('.pb-preview-panel .pb-Newsletter input[type=email]')).toBeDisabled();
  assert.equal(await tab.locator('[contenteditable=true]').count(), 0);
  await tab.getByLabel('Section heading', { exact: true }).fill('Live editor change');
  await expect(tab.locator('.pb-preview-panel .pb-Hero h2')).toHaveText('Live editor change');
  await tab.getByLabel('Theme', { exact: true }).selectOption('DARK');
  await expect(tab.locator('.pb-preview-panel .pb-Hero')).toHaveAttribute('data-theme', 'DARK');
  await tab.getByLabel('Background style').selectOption('GRID');
  await tab.getByLabel('Spacing', { exact: true }).selectOption('COMPACT');
  await tab.getByLabel('Section type').selectOption('CustomHeading');
  await tab.getByRole('button', { name: 'Add section', exact: true }).click();
  await tab.getByLabel('Section heading', { exact: true }).fill('Added from the builder');
  await tab.getByRole('button', { name: 'Move section up', exact: true }).click();
  await tab.getByRole('button', { name: 'Duplicate section', exact: true }).click();
  await tab.getByLabel('Section heading', { exact: true }).fill('Duplicate section');
  await tab.getByLabel('Section visible', { exact: true }).uncheck();
  await expect(
    tab.locator('.pb-preview-panel').getByText('Duplicate section', { exact: true }),
  ).toHaveCount(0);
  await tab.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(tab.getByRole('status')).toContainText('Draft saved.');
  await expect
    .poll(async () => (await api(`/cms/page-builder/${page.id}`)).draft.sections.length)
    .toBe(23);
  assert.equal(
    (await api(`/pages/resolve?path=${document.path}&locale=en`)).document.sections[0].content.en
      .heading,
    'Hero fixture',
  );
  await tab.getByRole('button', { name: 'Publish page', exact: true }).click();
  await expect(tab.getByRole('status')).toHaveText('Page published.');
  await expect
    .poll(
      async () =>
        (await api(`/pages/resolve?path=${document.path}&locale=en`)).document.sections[0].content
          .en.heading,
    )
    .toBe('Live editor change');
  await tab.getByRole('button', { name: 'Mobile width', exact: true }).click();
  await expect(tab.locator('.pb-preview-surface')).toHaveAttribute('data-mobile', 'true');
  await tab.evaluate(() => scrollTo(0, 0));
  await tab.screenshot({ path: 'artifacts/page-builder/admin-editor.png' });
  const adminAxe = await new AxeBuilder({ page: tab }).analyze();
  assert.deepEqual(
    adminAxe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
  );
  await tab.getByRole('button', { name: 'Archive page', exact: true }).click();
  const dialog = tab.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Confirm action' })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).last().click();
  assert.deepEqual(errors, []);
  page = await api(`/cms/page-builder/${page.id}`);
  await api(`/cms/page-builder/${page.id}/state`, {
    method: 'POST',
    body: { version: page.version, action: 'archive', confirmation: 'CONFIRM' },
    status: 201,
  });
  await api(`/pages/resolve?path=${document.path}&locale=en`, { status: 404 });
  page = await api(`/cms/page-builder/${page.id}`);
  assert.ok(page.deletedAt);
  assert.ok(page.draft.sections.length);
  await api(`/cms/page-builder/${page.id}/state`, {
    method: 'POST',
    body: { version: page.version, action: 'restore', confirmation: 'CONFIRM' },
    status: 201,
  });
  await api(`/pages/resolve?path=${document.path}&locale=en`, { status: 404 });
  assert.equal((await fetch(`${origin}/en${document.path}`)).status, 404);
  pass(
    'Live editor changes, section ordering/duplication/visibility, draft/publish isolation, mobile preview, confirmation safety and soft restore',
  );
} finally {
  if (browser) await browser.close();
  for (const child of children) child.kill();
  await db.pageCatalogReference.deleteMany({ where: { pageId: { in: pageIds } } });
  await db.cmsPage.deleteMany({ where: { id: { in: pageIds } } });
  await db.newsletterSignup.deleteMany({ where: { email } });
  const subscribers = await db.adminRecord.findMany({
    where: { module: 'newsletter', title: email },
    select: { id: true },
  });
  await db.cmsAudit.deleteMany({
    where: { entityId: { in: subscribers.map((record) => record.id) } },
  });
  await db.adminRecord.deleteMany({ where: { module: 'newsletter', title: email } });
  for (const kind of ['service', 'solution', 'industry', 'project'])
    if (catalog[kind]) await db[kind].delete({ where: { id: catalog[kind] } });
  await db.cmsAudit.deleteMany({
    where: { OR: [{ actorId: { in: users } }, { entityId: { in: pageIds } }] },
  });
  await db.cmsUser.deleteMany({ where: { id: { in: users } } });
  await db.$disconnect();
}
