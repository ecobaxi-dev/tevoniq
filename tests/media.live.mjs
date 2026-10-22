import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { digest, hashPassword } from '../apps/api/dist/cms/password.js';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const root = resolve('.data/media-live');
await mkdir(root, { recursive: true });
const directory = await mkdtemp(root + sep);
const prefix = 'media-' + randomUUID(),
  base = 'http://localhost:4450/api/v1',
  origin = 'http://localhost:3450',
  users = [],
  children = [],
  token = randomBytes(32).toString('hex'),
  viewer = randomBytes(32).toString('hex');
let browser, pageId;
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
      /* Retry while the local server starts. */
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
      ...(auth ? { Authorization: 'Bearer ' + auth } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(response.status, status, await response.clone().text());
  return response.json();
}
async function upload(bytes, mime, name = 'fixture.png', options = {}) {
  const form = new FormData();
  form.set('file', new Blob([bytes], { type: mime }), name);
  form.set('collection', prefix);
  form.set('protected', String(options.protected || false));
  const response = await fetch(base + '/cms/media-library/upload', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + (options.auth || token) },
    body: form,
  });
  assert.equal(response.status, options.status || 201, await response.clone().text());
  return response.json();
}
try {
  const a = start(['apps/api/dist/main.js'], {
    PORT: '4450',
    CORS_ORIGIN: origin,
    MEDIA_STORAGE: 'local',
    MEDIA_LOCAL_ROOT: directory,
    MEDIA_MAX_FILE_BYTES: '65536',
    LOG_LEVEL: 'error',
    EMAIL_TRANSPORT: 'disabled',
  });
  const w = start(['node_modules/next/dist/bin/next', 'start', 'apps/web', '--port', '3450'], {
    NODE_ENV: 'production',
    API_URL: base,
    SITE_URL: origin,
  });
  await Promise.all([ready(base + '/health/live', a), ready(origin + '/health', w)]);
  for (const [role, sessionToken] of [
    ['ADMIN', token],
    ['VIEWER', viewer],
  ]) {
    const user = await db.cmsUser.create({
      data: {
        email: role.toLowerCase() + '-' + prefix + '@example.test',
        role,
        passwordHash: await hashPassword(randomBytes(20).toString('hex')),
      },
    });
    users.push(user.id);
    await db.cmsSession.create({
      data: {
        userId: user.id,
        tokenHash: digest(sessionToken),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
  }
  await api('/cms/media-library', { auth: null, status: 401 });
  const png = await sharp({
    create: { width: 1000, height: 500, channels: 3, background: '#2563ff' },
  })
    .png()
    .toBuffer();
  await upload(png, 'image/png', 'fixture.png', { auth: viewer, status: 403 });
  const asset = await upload(png, 'image/png');
  assert.equal(asset.width, 1000);
  assert.equal(asset.files.length, 4);
  const original = await fetch(origin + asset.files[0].url);
  assert.deepEqual(Buffer.from(await original.arrayBuffer()), png);
  assert.equal(original.headers.get('x-content-type-options'), 'nosniff');
  await upload(png, 'image/jpeg', 'spoof.jpg', { status: 400 });
  await upload(Buffer.alloc(70000), 'image/png', 'large.png', { status: 400 });
  await upload(
    Buffer.from('<svg viewBox="0 0 10 10"><script>alert(1)</script></svg>'),
    'image/svg+xml',
    'unsafe.svg',
    { status: 400 },
  );
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#2563ff"/></svg>',
  );
  const protectedAsset = await upload(svg, 'image/svg+xml', 'protected.svg', { protected: true });
  assert.equal(protectedAsset.files.length, 1);
  await api('/cms/media-library/' + protectedAsset.id + '/state', {
    method: 'POST',
    body: { action: 'archive', version: 1, confirmation: 'CONFIRM' },
    status: 409,
  });
  const svgResponse = await fetch(origin + protectedAsset.files[0].url);
  assert.match(svgResponse.headers.get('content-security-policy'), /sandbox/);
  assert.deepEqual(Buffer.from(await svgResponse.arrayBuffer()), svg);
  const first = await api(
    '/cms/media-library?' + new URLSearchParams({ collection: prefix, limit: '1', page: '1' }),
  );
  const second = await api(
    '/cms/media-library?' + new URLSearchParams({ collection: prefix, limit: '1', page: '2' }),
  );
  assert.equal(first.total, 2);
  assert.notEqual(first.items[0].id, second.items[0].id);
  const edited = await api('/cms/media-library/' + asset.id, {
    method: 'PUT',
    body: {
      title: 'Library verification',
      alt: 'Blue image used for local verification',
      caption: 'A local test image',
      collection: prefix,
      version: 1,
    },
  });
  await api('/cms/media-library/' + asset.id, {
    method: 'PUT',
    body: { title: 'Stale update', alt: '', caption: '', collection: prefix, version: 1 },
    status: 409,
  });
  const page = await db.cmsPage.create({
    data: {
      path: '/' + prefix,
      draft: { image: asset.files[1].url },
      createdById: users[0],
      updatedById: users[0],
    },
  });
  pageId = page.id;
  const detail = await api('/cms/media-library/' + asset.id);
  assert.equal(detail.usage.length, 1);
  await api('/cms/media-library/' + asset.id + '/state', {
    method: 'POST',
    body: { action: 'archive', version: edited.version, confirmation: 'CONFIRM' },
    status: 409,
  });
  console.log(
    'PASS MIME and SVG validation, byte limits, immutable originals, derivatives, authorization, pagination, optimistic updates and reference protection',
  );
  browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addCookies([
    { name: 'tevoniq_cms_session', value: token, url: origin + '/api/cms', sameSite: 'Strict' },
  ]);
  const tab = await context.newPage();
  await tab.goto(origin + '/admin/media');
  await expect(tab.getByRole('heading', { name: 'Media Library', exact: true })).toBeVisible();
  await tab.getByLabel('Collection for uploads').fill(prefix);
  await tab.getByLabel('Choose files', { exact: true }).setInputFiles([
    { name: 'browser-one.png', mimeType: 'image/png', buffer: png },
    { name: 'browser-two.png', mimeType: 'image/png', buffer: png },
  ]);
  await expect(tab.getByRole('status')).toHaveText('2 files uploaded.', { timeout: 30000 });
  await tab.getByLabel('Collection', { exact: true }).selectOption(prefix);
  await expect(tab.locator('.media-tile')).toHaveCount(4);
  await tab.getByLabel('Search media').fill('browser-one');
  await expect(tab.locator('.media-tile')).toHaveCount(1);
  await tab.locator('.media-tile').click();
  await tab.getByLabel('Alt text', { exact: true }).fill('Browser verified blue image');
  await tab.getByLabel('Caption', { exact: true }).fill('Saved from the media library');
  await tab.getByRole('button', { name: 'Save metadata', exact: true }).click();
  await expect(tab.getByRole('status')).toHaveText('Media metadata saved.');
  const stored = await db.mediaAsset.findFirst({
    where: { collection: prefix, originalName: 'browser-one.png' },
  });
  assert.equal(stored.alt, 'Browser verified blue image');
  await tab.screenshot({ path: 'artifacts/media-library-desktop.png' });
  const axe = await new AxeBuilder({ page: tab }).analyze();
  assert.deepEqual(
    axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
  );
  await tab.getByRole('button', { name: 'Archive asset', exact: true }).click();
  const dialog = tab.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Confirm action' })).toBeDisabled();
  await dialog.getByLabel('Type CONFIRM to continue').fill('CONFIRM');
  await dialog.getByRole('button', { name: 'Confirm action' }).click();
  await expect(dialog).not.toBeVisible();
  assert.ok((await db.mediaAsset.findUnique({ where: { id: stored.id } })).deletedAt);
  await tab.getByRole('button', { name: 'Restore asset', exact: true }).click();
  await tab.getByRole('dialog').getByLabel('Type CONFIRM to continue').fill('CONFIRM');
  await tab.getByRole('dialog').getByRole('button', { name: 'Confirm action' }).click();
  await expect(tab.getByRole('dialog')).not.toBeVisible();
  await tab.setViewportSize({ width: 390, height: 844 });
  assert.equal(await tab.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await tab.screenshot({ path: 'artifacts/media-library-mobile.png' });
  await db.cmsPage.delete({ where: { id: pageId } });
  pageId = null;
  await api('/cms/media-library/' + asset.id + '/state', {
    method: 'POST',
    body: { action: 'archive', version: edited.version, confirmation: 'CONFIRM' },
    status: 201,
  });
  assert.equal((await fetch(origin + asset.files[0].url)).status, 200);
  console.log(
    'PASS browser multiple upload, collection/search, metadata persistence, preview, accessibility, responsive layout, confirmed archive/restore and retained URLs',
  );
} finally {
  if (browser) await browser.close();
  for (const child of children) child.kill();
  if (pageId) await db.cmsPage.delete({ where: { id: pageId } });
  await db.mediaAsset.deleteMany({ where: { createdById: { in: users } } });
  await db.cmsAudit.deleteMany({ where: { actorId: { in: users } } });
  await db.cmsUser.deleteMany({ where: { id: { in: users } } });
  await db.$disconnect();
  assert.ok(directory.startsWith(root + sep));
  await rm(directory, { recursive: true, force: true });
}
