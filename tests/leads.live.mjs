import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes, createHmac } from 'node:crypto';
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
const prefix = `lead-test-${randomUUID()}`,
  origin = 'http://localhost:3430',
  base = 'http://localhost:4430/api/v1',
  secret = randomBytes(32).toString('hex'),
  password = randomBytes(20).toString('hex'),
  email = `${prefix}@example.test`,
  children = [],
  users = [],
  throttleKeys = new Set();
let token,
  browser,
  settingsBefore,
  settingsTouched = false,
  ipCounter = 1;
function start(args, env) {
  const child = spawn(process.execPath, args, {
    env: { ...process.env, ...env },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (d) => {
    output = (output + d).slice(-6000);
  });
  child.stderr.on('data', (d) => {
    output = (output + d).slice(-6000);
  });
  children.push(child);
  return { child, output: () => output };
}
async function ready(url, server) {
  for (let i = 0; i < 160; i++) {
    if (server.child.exitCode !== null) throw Error(server.output());
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* server is starting */
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
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(response.status, status, `${path}: ${await response.clone().text()}`);
  return response.json();
}
function track(key, window) {
  const bucket = Math.floor(Date.now() / window);
  for (const offset of [-1, 0, 1]) throttleKeys.add(digest(`${key}:${bucket + offset}`));
}
function value(patch = {}) {
  return {
    submissionId: randomUUID(),
    type: 'contact',
    language: 'en',
    name: prefix,
    company: 'Fixture company',
    email: `${prefix}-${randomUUID()}@example.test`,
    phone: '',
    country: 'Türkiye',
    subject: 'Workflow fixture',
    message: '<b>A project question</b>',
    sourcePage: '/en/contact',
    utm: { source: 'integration', campaign: prefix },
    ...patch,
  };
}
async function submit(
  payload,
  { files = [], status = 202, ip = `203.0.113.${ipCounter++}`, originHeader = origin } = {},
) {
  track(`ip:${ip}`, 900000);
  track(`email:${payload.email}`, 3600000);
  const form = new FormData();
  form.set('payload', JSON.stringify(payload));
  for (const file of files) form.append('attachments', file.blob, file.name);
  const response = await fetch(`${base}/leads/submit`, {
    method: 'POST',
    headers: {
      Origin: originHeader,
      'x-lead-client-ip': ip,
      'x-lead-ip-signature': createHmac('sha256', secret).update(ip).digest('hex'),
    },
    body: form,
  });
  assert.equal(response.status, status, await response.clone().text());
  return response.json();
}
const pass = (label) => console.log(`PASS ${label}`);
try {
  settingsBefore = await db.leadSettings.findUnique({ where: { id: 'default' } });
  const a = start(['apps/api/dist/main.js'], {
    PORT: '4430',
    CORS_ORIGIN: origin,
    LOG_LEVEL: 'error',
    EMAIL_TRANSPORT: 'disabled',
    TURNSTILE_MODE: 'disabled',
    LEAD_PROXY_SECRET: secret,
  });
  const w = start(['node_modules/next/dist/bin/next', 'start', 'apps/web', '--port', '3430'], {
    NODE_ENV: 'production',
    API_URL: base,
    SITE_URL: origin,
    LEAD_PROXY_SECRET: secret,
    LEAD_CLIENT_IP_HEADER: 'x-test-ingress-ip',
  });
  await Promise.all([ready(`${base}/health/live`, a), ready(`${origin}/health`, w)]);
  for (const role of ['ADMIN', 'VIEWER']) {
    const user = await db.cmsUser.create({
      data: {
        email: `${role.toLowerCase()}-${email}`,
        passwordHash: await hashPassword(password),
        role,
      },
    });
    users.push(user.id);
  }
  token = randomBytes(32).toString('hex');
  const viewToken = randomBytes(32).toString('hex');
  await db.cmsSession.createMany({
    data: [
      { userId: users[0], tokenHash: digest(token), expiresAt: new Date(Date.now() + 3600000) },
      { userId: users[1], tokenHash: digest(viewToken), expiresAt: new Date(Date.now() + 3600000) },
    ],
  });
  await api('/cms/leads', { auth: null, status: 401 });
  await api('/cms/leads', { auth: viewToken, status: 403 });
  await api('/cms/leads/settings', { auth: viewToken, status: 403 });
  let settings = await api('/cms/leads/settings');
  settingsTouched = true;
  settings = await api('/cms/leads/settings', {
    method: 'PUT',
    body: {
      version: settings.version,
      notificationRecipients: [],
      budgetRanges: [],
      attachmentsEnabled: true,
    },
  });
  assert.deepEqual((await api('/leads/options')).budgetRanges, []);
  const before = await api('/cms/admin/dashboard');
  const first = value(),
    saved = await submit(first);
  assert.equal((await submit(first)).reference, saved.reference);
  const stored = await db.lead.findUniqueOrThrow({
    where: { id: saved.reference },
    include: { emails: true, activities: true },
  });
  assert.equal(stored.message, 'A project question');
  assert.equal(stored.status, 'NEW');
  assert.equal(stored.sourcePage, '/en/contact');
  assert.equal(stored.utm.campaign, prefix);
  assert.equal(stored.emails.length, 2);
  assert.ok(stored.createdAt);
  assert.equal(stored.activities.length, 1);
  await submit({ ...first, message: 'changed' }, { status: 409 });
  assert.equal((await api('/cms/admin/dashboard')).cards[0].value, before.cards[0].value + 1);
  await submit(value({ email: 'invalid' }), { status: 400 });
  await submit(value({ website: 'spam' }), { status: 400 });
  await submit(value(), { status: 403, originHeader: 'https://evil.test' });
  pass(
    'PostgreSQL persistence, atomic email queue, UTM attribution, sanitization, duplicate protection, privacy, and live dashboard',
  );
  const quote = value({
    type: 'quote',
    phone: '+90 555 555 5555',
    industry: 'Technology',
    projectType: 'Portal',
    timeline: 'Next quarter',
    projectDescription: 'Build a useful portal',
    consent: true,
    sourcePage: '/en/request-quote',
    budgetRange: 'custom',
  });
  await submit(quote, { status: 400 });
  await api('/cms/leads/settings', {
    method: 'PUT',
    body: {
      ...settings,
      notificationRecipients: ['sink@example.test'],
      budgetRanges: [{ value: 'custom', label: 'Configured fixture budget' }],
    },
  });
  const pdf = {
    blob: new Blob(['%PDF-1.4\nfixture'], { type: 'application/pdf' }),
    name: 'brief.pdf',
  };
  const quoteSaved = await submit(quote, { files: [pdf] });
  await submit(
    { ...quote, submissionId: randomUUID(), email: `three-files-${email}` },
    { files: [pdf, pdf, pdf] },
  );
  const detail = await api(`/cms/leads/${quoteSaved.reference}`);
  assert.equal(detail.budgetLabel, 'Configured fixture budget');
  assert.ok(detail.consentAt);
  assert.equal(detail.attachments.length, 1);
  assert.equal(detail.attachments[0].bytes, undefined);
  assert.equal(detail.submissionHash, undefined);
  await api(`/cms/leads/${detail.id}/attachments/${detail.attachments[0].id}`, {
    auth: viewToken,
    status: 403,
  });
  const download = await fetch(
    `${base}/cms/leads/${detail.id}/attachments/${detail.attachments[0].id}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  assert.equal(download.status, 200);
  assert.match(download.headers.get('content-disposition'), /attachment/);
  assert.equal(await download.text(), '%PDF-1.4\nfixture');
  await submit(value({ ...quote, submissionId: randomUUID(), email: `invalid-file-${email}` }), {
    files: [
      { blob: new Blob(['<script>bad</script>'], { type: 'application/pdf' }), name: 'bad.pdf' },
    ],
    status: 400,
  });
  await submit(value(), { files: [pdf], status: 400 });
  pass(
    'Admin-configured budgets, consent evidence, private file storage and authorized download, invalid attachment rejection',
  );
  let current = await api(`/cms/leads/${saved.reference}`);
  await api(`/cms/leads/${current.id}`, {
    method: 'PUT',
    body: { version: current.version, status: 'QUALIFIED' },
  });
  await api(`/cms/leads/${current.id}`, {
    method: 'PUT',
    body: { version: current.version, status: 'WON' },
    status: 409,
  });
  current = await api(`/cms/leads/${current.id}`);
  await api(`/cms/leads/${current.id}/notes`, {
    method: 'POST',
    body: { version: current.version, note: '<b>Useful</b> internal note' },
    status: 201,
  });
  const activity = await api(`/cms/leads/${current.id}/activity`);
  assert.ok(activity.items.some((a) => a.note === 'Useful internal note'));
  assert.ok(activity.items.some((a) => a.fromStatus === 'NEW' && a.toStatus === 'QUALIFIED'));
  const list = await api(`/cms/leads?q=${prefix}&status=QUALIFIED&sort=name&direction=asc&limit=1`);
  assert.equal(list.total, 1);
  assert.equal(list.items.length, 1);
  const search = await api(`/cms/admin/search?q=${prefix}`);
  assert.ok(search.items.some((i) => i.href === `/admin/leads?lead=${current.id}`));
  current = await api(`/cms/leads/${current.id}`);
  await api(`/cms/leads/${current.id}/archive`, {
    method: 'POST',
    body: { version: current.version, archived: true },
    status: 400,
  });
  await api(`/cms/leads/${current.id}/archive`, {
    method: 'POST',
    body: { version: current.version, archived: true, confirmation: 'CONFIRM' },
    status: 201,
  });
  current = await api(`/cms/leads/${current.id}`);
  assert.ok(current.deletedAt);
  assert.ok(current.emails.every((e) => e.status === 'cancelled'));
  await api(`/cms/leads/${current.id}/archive`, {
    method: 'POST',
    body: { version: current.version, archived: false, confirmation: 'CONFIRM' },
    status: 201,
  });
  await assert.rejects(db.lead.delete({ where: { id: current.id } }), (e) => e.code === 'P2003');
  current = await api(`/cms/leads/${current.id}`);
  const bulkRecords = [
    { id: current.id, version: current.version },
    { id: detail.id, version: detail.version },
  ];
  await api('/cms/leads/bulk', {
    method: 'POST',
    body: { records: bulkRecords, action: 'status', status: 'CONTACTED' },
    status: 400,
  });
  await api('/cms/leads/bulk', {
    method: 'POST',
    body: {
      records: [bulkRecords[0], { ...bulkRecords[1], version: 999 }],
      action: 'status',
      status: 'CONTACTED',
      confirmation: 'CONFIRM',
    },
    status: 409,
  });
  assert.equal((await api(`/cms/leads/${current.id}`)).version, current.version);
  await api('/cms/leads/bulk', {
    method: 'POST',
    body: { records: bulkRecords, action: 'status', status: 'CONTACTED', confirmation: 'CONFIRM' },
    status: 201,
  });
  assert.equal((await api(`/cms/leads/${detail.id}`)).status, 'CONTACTED');
  pass(
    'Admin status changes, notes, audit history, sorting/filtering, optimistic concurrency, confirmation, and reference-safe soft archive',
  );
  const rateEmail = `rate-${email}`;
  for (let i = 0; i < 3; i++) await submit(value({ email: rateEmail }));
  await submit(value({ email: rateEmail }), { status: 429 });
  const rateIp = '198.51.100.33';
  for (let i = 0; i < 10; i++)
    await submit(value({ website: 'trap' }), { ip: rateIp, status: 400 });
  await submit(value({ website: 'trap' }), { ip: rateIp, status: 429 });
  pass('Persistent email and client-IP rate limits');
  browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
  const browserIp = '192.0.2.88';
  track(`ip:${browserIp}`, 900000);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    extraHTTPHeaders: { 'x-test-ingress-ip': browserIp },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await mkdir('artifacts/leads', { recursive: true });
  await page.goto(`${origin}/contact?utm_source=browser&utm_campaign=${prefix}`);
  await expect(page).toHaveURL(/\/en\/contact\?utm_source=browser/);
  await page.getByLabel('Name', { exact: true }).fill(prefix + ' Browser');
  await page.getByLabel('Email', { exact: true }).fill(`browser-${email}`);
  track(`email:browser-${email}`, 3600000);
  await page.getByLabel('Country', { exact: true }).fill('Türkiye');
  await page.getByLabel('Subject', { exact: true }).fill('Browser enquiry');
  await page.getByLabel('Message', { exact: true }).fill('A browser workflow fixture');
  await page.screenshot({ path: 'artifacts/leads/contact-desktop.png', fullPage: true });
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations.map((v) => v.id),
    [],
  );
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Thank you. Your enquiry has been received.' }),
  ).toBeVisible();
  assert.equal(
    (await db.lead.findFirstOrThrow({ where: { email: `browser-${email}` } })).utm.source,
    'browser',
  );
  await page.goto(`${origin}/request-quote`);
  await expect(page.getByLabel('Budget range')).toBeVisible();
  await page.getByLabel('Name', { exact: true }).fill(prefix + ' Browser Quote');
  await page.getByLabel('Email', { exact: true }).fill(`browser-quote-${email}`);
  track(`email:browser-quote-${email}`, 3600000);
  await page.getByLabel('Phone', { exact: true }).fill('+90 555 555 5555');
  await page.getByLabel('Country', { exact: true }).fill('Türkiye');
  await page.getByLabel('Industry', { exact: true }).fill('Software');
  await page.getByLabel('Project type', { exact: true }).fill('Portal');
  await page.getByLabel('Timeline', { exact: true }).fill('This year');
  await page
    .getByLabel('Project description', { exact: true })
    .fill('An accessible customer portal');
  await page.getByLabel('Budget range').selectOption('custom');
  await page.getByLabel('Attachments', { exact: true }).setInputFiles({
    name: 'brief.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\nfixture'),
  });
  await page
    .locator('.lead-form')
    .getByRole('checkbox', { name: /I agree/ })
    .check();
  await page.screenshot({ path: 'artifacts/leads/quote-desktop.png', fullPage: true });
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations.map((v) => v.id),
    [],
  );
  await page.getByRole('button', { name: 'Request a quote', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Thank you. Your enquiry has been received.' }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/ar/request-quote`);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: 'artifacts/leads/quote-ar-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
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
  await page.goto(`${origin}/admin/leads?lead=${quoteSaved.reference}`);
  await expect(page.getByRole('region', { name: 'Lead details' })).toBeVisible();
  await page.getByLabel('Add internal note').fill('Browser-reviewed attachment');
  await page.getByRole('button', { name: 'Save note', exact: true }).click();
  await expect(page.getByText('Browser-reviewed attachment', { exact: true })).toBeVisible();
  await page.getByLabel('Lead status', { exact: true }).selectOption('PROPOSAL');
  await page.getByRole('button', { name: 'Update status', exact: true }).click();
  await expect(page.getByLabel('Lead status', { exact: true })).toHaveValue('PROPOSAL');
  await expect
    .poll(async () => (await db.lead.findUnique({ where: { id: quoteSaved.reference } })).status)
    .toBe('PROPOSAL');
  const [downloadEvent] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'brief.pdf', exact: true }).click(),
  ]);
  assert.equal(downloadEvent.suggestedFilename(), 'brief.pdf');
  const fileResponse = await context.request.get(
    `${origin}/api/cms/leads/${detail.id}/attachments/${detail.attachments[0].id}`,
  );
  assert.equal(fileResponse.status(), 200);
  assert.equal(fileResponse.headers()['content-type'], 'application/octet-stream');
  assert.equal(await fileResponse.text(), '%PDF-1.4\nfixture');
  await page.getByRole('button', { name: 'Archive lead', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Confirm action' })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).last().click();
  await page.screenshot({ path: 'artifacts/leads/admin-detail.png', fullPage: true });
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations.map((v) => v.id),
    [],
  );
  await page.goto(`${origin}/admin/lead-settings`);
  await page.getByLabel('Notification recipients').fill('sink@example.test');
  await page.getByRole('button', { name: 'Remove option 1' }).click();
  await page.getByRole('button', { name: 'Save settings', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Settings saved.');
  await page.goto(`${origin}/en/request-quote`);
  await expect(page.getByLabel('Budget range')).toHaveCount(0);
  assert.deepEqual(errors, []);
  pass(
    'Browser contact and quote submission, UTM redirects, private proxy download, admin notes/settings, hidden budgets, accessibility, and Arabic mobile layout',
  );
} finally {
  if (browser) await browser.close();
  for (const child of children) child.kill();
  const leads = await db.lead.findMany({
    where: { name: { startsWith: prefix } },
    select: { id: true },
  });
  const ids = leads.map((l) => l.id);
  await db.leadEmail.deleteMany({ where: { leadId: { in: ids } } });
  await db.leadActivity.deleteMany({ where: { leadId: { in: ids } } });
  await db.leadAttachment.deleteMany({ where: { leadId: { in: ids } } });
  await db.lead.deleteMany({ where: { id: { in: ids } } });
  await db.leadThrottle.deleteMany({ where: { key: { in: [...throttleKeys] } } });
  if (settingsTouched) {
    if (settingsBefore)
      await db.leadSettings.update({
        where: { id: 'default' },
        data: {
          value: settingsBefore.value,
          version: settingsBefore.version,
          updatedById: settingsBefore.updatedById,
          updatedAt: settingsBefore.updatedAt,
        },
      });
    else await db.leadSettings.delete({ where: { id: 'default' } });
  }
  await db.cmsAudit.deleteMany({ where: { actorId: { in: users } } });
  await db.cmsUser.deleteMany({ where: { id: { in: users } } });
  await db.$disconnect();
}
