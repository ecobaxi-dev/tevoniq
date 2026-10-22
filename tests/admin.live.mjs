import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { hashPassword, digest } from '../apps/api/dist/cms/password.js';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const run = randomUUID(),
  prefix = `admin-test-${run}`,
  password = randomBytes(20).toString('hex'),
  email = `${prefix}@example.test`;
const origin = 'http://localhost:3420',
  base = 'http://localhost:4420/api/v1',
  children = [],
  users = [],
  recordIds = [],
  catalogIds = [];
let token, browser;
const pass = (label) => console.log(`PASS ${label}`);
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
  for (let i = 0; i < 120; i++) {
    if (server.child.exitCode !== null) throw new Error(server.output());
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* starting */
    }
    await setTimeout(250);
  }
  throw new Error(server.output());
}
async function api(path, { method = 'GET', body, auth = token, status = 200 } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(response.status, status, `${path}: ${await response.clone().text()}`);
  return response.json();
}
const value = (name, data = {}, references = []) => ({
  title: `${prefix} ${name}`,
  language: 'en',
  status: 'draft',
  data,
  referenceIds: references,
  version: 0,
});
async function create(module, body) {
  const record = await api(`/cms/admin/records/${module}`, { method: 'POST', body, status: 201 });
  recordIds.push(record.id);
  return record;
}
const bulk = (module, records, action = 'archive', status = 201) =>
  api(`/cms/admin/records/${module}/bulk`, {
    method: 'POST',
    status,
    body: {
      records: records.map((r) => ({ id: r.id, version: r.version })),
      action,
      confirmation: 'CONFIRM',
    },
  });
try {
  const a = start(['apps/api/dist/main.js'], {
    PORT: '4420',
    CORS_ORIGIN: origin,
    LOG_LEVEL: 'error',
  });
  const w = start(['node_modules/next/dist/bin/next', 'start', 'apps/web', '--port', '3420'], {
    NODE_ENV: 'production',
    API_URL: base,
    SITE_URL: origin,
  });
  await Promise.all([ready(`${base}/health/live`, a), ready(`${origin}/health`, w)]);
  const admin = await db.cmsUser.create({
    data: { email, passwordHash: await hashPassword(password), role: 'SUPER_ADMIN' },
  });
  users.push(admin.id);
  token = randomBytes(32).toString('hex');
  await db.cmsSession.create({
    data: { tokenHash: digest(token), userId: admin.id, expiresAt: new Date(Date.now() + 3600000) },
  });
  await api('/cms/admin/dashboard', { auth: '', status: 401 });
  const viewer = await db.cmsUser.create({
    data: { email: `viewer-${email}`, passwordHash: 'unused', role: 'VIEWER' },
  });
  users.push(viewer.id);
  const viewToken = randomBytes(32).toString('hex');
  await db.cmsSession.create({
    data: {
      tokenHash: digest(viewToken),
      userId: viewer.id,
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  await api('/cms/admin/records/job-applications', { auth: viewToken, status: 403 });
  await api('/cms/admin/users', { auth: viewToken, status: 403 });
  assert.equal((await api('/cms/admin/dashboard', { auth: viewToken })).cards[0].value, null);
  pass('Authentication, business privacy, and restricted dashboard counts');
  const before = await api('/cms/admin/dashboard');
  const lead = await create('job-applications', {
    ...value('lead', { email: 'fixture@example.test' }),
    status: 'new',
  });
  const after = await api('/cms/admin/dashboard');
  assert.equal(after.cards[3].value, before.cards[3].value + 1);
  const listed = await api(`/cms/admin/records/job-applications?q=${prefix}`);
  assert.equal(listed.items[0].createdBy, email);
  assert.equal(listed.items[0].updatedBy, email);
  await api(`/cms/admin/records/job-applications/${lead.id}`, {
    method: 'PUT',
    body: { ...value('application', { email: 'fixture@example.test' }), status: 'new', version: 0 },
    status: 409,
  });
  await api('/cms/admin/records/job-applications/bulk', {
    method: 'POST',
    body: { action: 'archive', records: [{ id: lead.id, version: lead.version }] },
    status: 400,
  });
  pass('Live metrics, attribution, stale edit protection, and mandatory confirmation');
  const media = await create(
    'media',
    value('asset', { url: 'https://example.test/fixture.png', alt: 'Fixture' }),
  );
  await create('team', value('profile', { role: 'Development fixture' }, [media.id]));
  const free = await create(
    'media',
    value('unused asset', { url: 'https://example.test/unused.png', alt: 'Unused fixture' }),
  );
  await bulk('media', [free, media], 'archive', 409);
  assert.equal((await db.adminRecord.findUnique({ where: { id: free.id } })).deletedAt, null);
  await bulk('job-applications', [lead]);
  assert.ok((await db.adminRecord.findUnique({ where: { id: lead.id } })).deletedAt);
  await bulk('job-applications', [{ ...lead, version: 2 }], 'restore');
  assert.equal((await db.adminRecord.findUnique({ where: { id: lead.id } })).deletedAt, null);
  pass('Atomic bulk actions, reference protection, soft archive and restore');
  const service = await db.service.create({
    data: {
      slug: `${prefix}-service`,
      active: true,
      translations: { create: { locale: 'en', title: 'Development service', published: true } },
    },
  });
  catalogIds.push(service.id);
  const project = await db.project.create({
    data: { slug: `${prefix}-project`, services: { create: { serviceId: service.id } } },
  });
  catalogIds.push(project.id);
  await api(`/cms/services/${service.id}`, { method: 'DELETE', body: { version: 0 }, status: 409 });
  await db.projectService.deleteMany({ where: { projectId: project.id } });
  await api(`/cms/services/${service.id}`, { method: 'DELETE', body: { version: 0 } });
  const archived = await db.service.findUnique({
    where: { id: service.id },
    include: { translations: true },
  });
  assert.ok(archived.deletedAt);
  assert.equal(archived.translations.length, 1);
  assert.equal(archived.active, false);
  await api(`/cms/admin/restore/service/${service.id}`, {
    method: 'POST',
    status: 201,
    body: { version: 1, confirmation: 'CONFIRM' },
  });
  assert.equal((await db.service.findUnique({ where: { id: service.id } })).active, false);
  pass('Existing catalogs preserve translations and block referenced archives');
  const createdUser = await api('/cms/admin/users', {
    method: 'POST',
    status: 201,
    body: {
      email: `managed-${email}`,
      role: 'VIEWER',
      password,
      disabled: false,
      version: 0,
      confirmation: 'CONFIRM',
    },
  });
  users.push(createdUser.id);
  assert.equal(createdUser.passwordHash, undefined);
  await api(`/cms/admin/users/${createdUser.id}`, {
    method: 'PUT',
    body: {
      email: createdUser.email,
      role: 'VIEWER',
      disabled: true,
      version: 0,
      confirmation: 'CONFIRM',
    },
  });
  await api(`/cms/admin/users/${admin.id}`, {
    method: 'PUT',
    status: 409,
    body: { email, role: 'SUPER_ADMIN', disabled: true, version: 0, confirmation: 'CONFIRM' },
  });
  assert.ok((await api(`/cms/admin/audit?q=${lead.id}`)).total >= 3);
  pass('User administration, self-protection, and immutable audit history');
  browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${origin}/admin`);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor();
  await expect(page.locator('.admin-metric')).toHaveCount(8);
  await expect(
    page.getByRole('navigation', { name: 'Admin sections' }).getByRole('link'),
  ).toHaveCount(23);
  await mkdir('artifacts/admin', { recursive: true });
  await page.screenshot({ path: 'artifacts/admin/dashboard-desktop.png', fullPage: true });
  const audit = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    audit.violations.map((v) => v.id),
    [],
  );
  await page.goto(`${origin}/admin/job-applications`);
  await page.getByRole('button', { name: 'New record', exact: true }).click();
  await page.getByLabel('Title / name', { exact: true }).fill(`${prefix} UI applicant`);
  await page.getByLabel('Email', { exact: true }).fill('ui@example.test');
  await page.getByRole('button', { name: 'Save record', exact: true }).click();
  await expect(page.getByText(`${prefix} UI applicant`, { exact: true })).toBeVisible();
  const uiLead = await db.adminRecord.findFirstOrThrow({
    where: { title: `${prefix} UI applicant` },
  });
  recordIds.push(uiLead.id);
  await page.getByRole('checkbox', { name: `Select ${prefix} UI applicant`, exact: true }).check();
  await page.getByRole('button', { name: 'Archive selected', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Confirm action', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).last().click();
  assert.equal((await db.adminRecord.findUnique({ where: { id: uiLead.id } })).deletedAt, null);
  await page.getByRole('button', { name: 'Archive selected', exact: true }).click();
  await dialog.getByLabel('Type CONFIRM to continue', { exact: true }).fill('CONFIRM');
  await dialog.getByRole('button', { name: 'Confirm action', exact: true }).click();
  await expect(page.getByText(`${prefix} UI applicant`, { exact: true })).toHaveCount(0);
  await page.getByLabel('Record visibility', { exact: true }).selectOption('deleted');
  await expect(page.getByText(`${prefix} UI applicant`, { exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/admin/job-applications-desktop.png', fullPage: true });
  await page.goto(`${origin}/admin/blog`);
  await page.getByRole('heading', { name: 'Insights CMS', exact: true }).waitFor();
  await page.goto(`${origin}/admin/resources`);
  await page.getByRole('button', { name: 'New article', exact: true }).click();
  await expect(page.getByLabel('Collection', { exact: true })).toHaveValue('resource');
  await page.goto(`${origin}/admin`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Toggle sidebar', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Admin sections' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/admin/dashboard-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  pass(
    'Admin browser workflows, confirmation/cancel safety, Insights integration, responsive sidebar, and accessibility',
  );
} finally {
  if (browser) await browser.close();
  const fixtureRecords = await db.adminRecord.findMany({
    where: { title: { startsWith: prefix } },
    select: { id: true },
  });
  const ids = fixtureRecords.map((r) => r.id);
  await db.adminReference.deleteMany({
    where: { OR: [{ sourceId: { in: ids } }, { targetId: { in: ids } }] },
  });
  await db.adminRecord.deleteMany({ where: { id: { in: ids } } });
  await db.project.deleteMany({ where: { slug: { startsWith: prefix } } });
  await db.service.deleteMany({ where: { slug: { startsWith: prefix } } });
  await db.cmsAudit.deleteMany({
    where: {
      OR: [{ actorId: { in: users } }, { entityId: { in: [...catalogIds, ...recordIds] } }],
    },
  });
  await db.cmsUser.deleteMany({ where: { id: { in: users } } });
  await db.$disconnect();
  for (const child of children) child.kill();
}
