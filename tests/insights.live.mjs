import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { hashPassword, digest } from '../apps/api/dist/cms/password.js';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const prefix = `insight-test-${randomUUID()}`,
  email = `${prefix}@example.test`,
  password = randomBytes(24).toString('hex');
const origin = 'http://localhost:3410',
  base = 'http://localhost:4410/api/v1';
const children = [],
  accounts = [],
  articleIds = [],
  termIds = [];
let browser, token;
const checks = [];
const pass = (label) => {
  checks.push(label);
  console.log(`PASS ${label}`);
};
function start(args, env) {
  const child = spawn(process.execPath, args, {
    env: { ...process.env, ...env },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (data) => {
    output = (output + data).slice(-12000);
  });
  child.stderr.on('data', (data) => {
    output = (output + data).slice(-12000);
  });
  children.push(child);
  return { child, output: () => output };
}
async function ready(url, process) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (process.child.exitCode !== null) throw new Error(process.output());
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* server starting */
    }
    await setTimeout(250);
  }
  throw new Error(`Server did not start: ${process.output()}`);
}
async function api(path, { method = 'GET', body, auth = token, status = 200 } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(response.status, status, `${method} ${path}: ${await response.clone().text()}`);
  return response.json();
}
const payload = (suffix, categoryId, tagId) => ({
  title: `Development verification ${suffix}`,
  slug: `${prefix}-${suffix}`,
  excerpt: 'Temporary integration fixture, removed after verification.',
  content: [
    { type: 'heading', level: 2, text: 'Structured engineering notes' },
    { type: 'paragraph', text: 'A temporary article used to check the Insights platform.' },
    { type: 'list', ordered: false, items: ['Plan carefully', 'Verify outcomes'] },
    { type: 'quote', text: 'Clarity matters.', attribution: 'Test author' },
    { type: 'code', code: 'const safe = "<script>";', language: 'javascript' },
  ],
  coverImage: '',
  coverImageAlt: '',
  author: 'Development Test Author',
  categoryId,
  tagIds: [tagId],
  publicationDate: new Date(Date.now() - 60000).toISOString(),
  readingTime: 3,
  featured: true,
  status: 'published',
  language: 'en',
  kind: 'blog',
  seoTitle: `Development SEO ${suffix}`,
  seoDescription: 'Temporary search and sharing metadata for integration verification.',
  ogImage: '',
  canonicalUrl: '',
  version: 0,
});
try {
  const apiProcess = start(['apps/api/dist/main.js'], {
    PORT: '4410',
    CORS_ORIGIN: origin,
    LOG_LEVEL: 'error',
  });
  const webProcess = start(
    ['node_modules/next/dist/bin/next', 'start', 'apps/web', '--port', '3410'],
    { NODE_ENV: 'production', API_URL: base, SITE_URL: origin },
  );
  await Promise.all([
    ready(`${base}/health/live`, apiProcess),
    ready(`${origin}/health`, webProcess),
  ]);
  const user = await db.cmsUser.create({
    data: { email, passwordHash: await hashPassword(password), role: 'ADMIN' },
  });
  accounts.push(user.id);
  token = randomBytes(32).toString('hex');
  await db.cmsSession.create({
    data: { tokenHash: digest(token), userId: user.id, expiresAt: new Date(Date.now() + 3600000) },
  });
  await api('/cms/insights', { auth: '', status: 401 });
  const viewer = await db.cmsUser.create({
    data: { email: `viewer-${email}`, passwordHash: 'unused', role: 'VIEWER' },
  });
  accounts.push(viewer.id);
  const viewerToken = randomBytes(32).toString('hex');
  await db.cmsSession.create({
    data: {
      tokenHash: digest(viewerToken),
      userId: viewer.id,
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  await api('/cms/insights', { method: 'POST', body: {}, auth: viewerToken, status: 403 });
  pass('CMS authentication and write permissions');
  const category = await api('/cms/insights/taxonomies', {
    method: 'POST',
    status: 201,
    body: {
      name: 'Development Engineering',
      slug: `${prefix}-category`,
      type: 'category',
      language: 'en',
      version: 0,
    },
  });
  termIds.push(category.id);
  const tag = await api('/cms/insights/taxonomies', {
    method: 'POST',
    status: 201,
    body: {
      name: 'Development Testing',
      slug: `${prefix}-tag`,
      type: 'tag',
      language: 'en',
      version: 0,
    },
  });
  termIds.push(tag.id);
  const wrong = await api('/cms/insights/taxonomies', {
    method: 'POST',
    status: 201,
    body: {
      name: 'Development Turkish',
      slug: `${prefix}-tr`,
      type: 'category',
      language: 'tr',
      version: 0,
    },
  });
  termIds.push(wrong.id);
  await api('/cms/insights', {
    method: 'POST',
    status: 400,
    body: payload('invalid-category', wrong.id, tag.id),
  });
  await api('/cms/insights/taxonomies/' + tag.id, {
    method: 'PUT',
    body: { name: 'Development Quality', slug: tag.slug, type: 'tag', language: 'en', version: 1 },
  });
  pass('Category/tag creation, editing, and language validation');
  const records = {};
  for (const [name, changes] of Object.entries({
    public: {},
    related: {},
    draft: { status: 'draft' },
    archived: { status: 'archived' },
    future: { status: 'scheduled', publicationDate: new Date(Date.now() + 3600000).toISOString() },
    due: { status: 'scheduled' },
    resource: { kind: 'resource' },
    case: { kind: 'case-study' },
  })) {
    const body = { ...payload(name, category.id, tag.id), ...changes };
    records[name] = {
      body,
      row: await api('/cms/insights', { method: 'POST', status: 201, body }),
    };
    articleIds.push(records[name].row.id);
  }
  const list = await api(`/insights?locale=en&q=${prefix}&limit=100`);
  // Titles intentionally do not include the UUID; scope the content via its category.
  assert.equal(list.total, 0);
  const publicList = await api(`/insights?category=${category.slug}&limit=100`);
  assert.equal(publicList.total, 5);
  for (const state of ['draft', 'archived', 'future'])
    await api(`/insights/${records[state].body.slug}`, { status: 404 });
  await api(`/insights/${records.public.body.slug}?locale=tr`, { status: 404 });
  const detail = await api(`/insights/${records.public.body.slug}`);
  assert.equal(detail.related.length, 3);
  assert.ok(
    detail.related.every(
      (a) => !['draft', 'archived', 'future'].some((k) => records[k].row.id === a.id),
    ),
  );
  assert.equal((await api(`/insights?category=${category.slug}&limit=2&page=2`)).items.length, 2);
  assert.equal((await api(`/insights?category=${category.slug}&kind=resource`)).total, 1);
  await api(`/cms/insights/${records.public.row.id}`, {
    method: 'PUT',
    status: 409,
    body: records.public.body,
  });
  pass('Publication states, due scheduling, related posts, filters, pagination, and conflicts');
  for (const route of [
    '/insights',
    '/insights/blog',
    '/insights/resources',
    '/insights/case-studies',
    `/insights/blog/${records.public.body.slug}`,
  ]) {
    const response = await fetch(`${origin}${route}`);
    assert.equal(response.status, 200);
    assert.ok(response.url.includes('/en/insights'));
  }
  const html = await (
    await fetch(`${origin}/en/insights/blog/${records.public.body.slug}`, {
      headers: { 'User-Agent': 'Googlebot' },
    })
  ).text();
  assert.match(html, /og:type[^>]+article/);
  assert.match(html, /twitter:card/);
  assert.match(html, /index, follow/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"Article"/);
  const feed = await (await fetch(`${origin}/insights/rss.xml`)).text(),
    sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  assert.ok(feed.includes(records.public.body.slug));
  assert.ok(sitemap.includes(records.public.body.slug));
  for (const state of ['draft', 'archived', 'future']) {
    assert.ok(!feed.includes(records[state].body.slug));
    assert.ok(!sitemap.includes(records[state].body.slug));
  }
  pass('Routes, Article JSON-LD, social metadata, RSS, and sitemap');
  browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}/en/insights?category=${category.slug}`);
  await page.getByRole('heading', { name: records.public.body.title, exact: true }).waitFor();
  await mkdir('artifacts/insights', { recursive: true });
  await page.screenshot({ path: 'artifacts/insights/catalog-desktop.png', fullPage: true });
  const axe = await new AxeBuilder({ page }).include('#main-content').analyze();
  assert.deepEqual(
    axe.violations.map((v) => v.id),
    [],
  );
  await page.goto(`${origin}/en/insights/blog/${records.public.body.slug}`);
  await page.getByRole('heading', { name: 'Structured engineering notes' }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: 'artifacts/insights/article-mobile.png', fullPage: true });
  await page.goto(`${origin}/ar/insights`);
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  pass('Desktop/mobile rendering, Arabic RTL, and catalog accessibility');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/admin/insights`);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'New article', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Development UI draft');
  await page.getByLabel('Slug', { exact: true }).fill(`${prefix}-ui`);
  await page.getByLabel('Add content block', { exact: true }).selectOption('paragraph');
  await page.getByLabel('Text', { exact: true }).fill('Saved through the structured editor.');
  await page.getByRole('button', { name: 'Save article', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Article saved.' }).waitFor();
  const ui = await db.insightArticle.findUniqueOrThrow({
    where: { slug_language: { slug: `${prefix}-ui`, language: 'en' } },
  });
  articleIds.push(ui.id);
  assert.equal(ui.content[0].text, 'Saved through the structured editor.');
  await page.getByRole('button', { name: 'Toggle preview', exact: true }).click();
  await page.screenshot({ path: 'artifacts/insights/cms-desktop.png', fullPage: true });
  await api(`/insights/${prefix}-ui`, { status: 404 });
  assert.deepEqual(errors, []);
  pass('CMS browser login, structured editing, persistent save, preview, and draft privacy');
  await api(`/cms/insights/${records.public.row.id}`, {
    method: 'PUT',
    body: { ...records.public.body, version: 1, status: 'archived' },
  });
  await api(`/insights/${records.public.body.slug}`, { status: 404 });
  assert.ok(
    !(await (await fetch(`${origin}/insights/rss.xml`)).text()).includes(records.public.body.slug),
  );
  assert.ok(
    !(await (await fetch(`${origin}/sitemap.xml`)).text()).includes(records.public.body.slug),
  );
  pass('Archiving immediately removes content from detail, RSS, and sitemap');
  console.log(`${checks.length} integration groups passed.`);
} finally {
  if (browser) await browser.close();
  await db.insightArticle.deleteMany({ where: { slug: { startsWith: prefix } } });
  await db.insightTaxonomy.deleteMany({ where: { id: { in: termIds } } });
  await db.cmsAudit.deleteMany({ where: { actorId: { in: accounts } } });
  await db.cmsUser.deleteMany({ where: { id: { in: accounts } } });
  await db.$disconnect();
  for (const child of children) child.kill();
}
