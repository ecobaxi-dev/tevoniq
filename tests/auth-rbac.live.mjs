// Run after building the API and applying migrations. Uses only isolated local fixtures.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { once } from 'node:events';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { cmsRoles } from '../packages/validation/dist/index.js';
import { hashPassword, digest, verifyPassword } from '../apps/api/dist/cms/password.js';
import { makeDocument, makeSection } from './page-builder.fixtures.mjs';

config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const prefix = `auth-test-${randomUUID()}`;
const password = randomBytes(24).toString('base64url');
const users = cmsRoles.map((role) => ({
  id: randomUUID(),
  role,
  email: `${prefix}-${role.toLowerCase()}@example.test`,
}));
const tokens = {};
const pageIds = [];
let child;
let base;
let checks = 0;
async function api(
  path,
  { role, token = role ? tokens[role] : undefined, method = 'GET', body, status = 200 } = {},
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(10000),
  });
  const value = await response.json();
  assert.equal(
    response.status,
    status,
    `${method} ${path}: ${response.status} ${value.message ?? ''}`,
  );
  checks++;
  return value;
}
const account = (role) => users.find((user) => user.role === role);
async function login(role, secret = password, status = 201) {
  const result = await api('/cms/auth/login', {
    method: 'POST',
    body: { email: account(role).email, password: secret },
    status,
  });
  return result.token;
}

try {
  const passwordHash = await hashPassword(password);
  await db.cmsUser.createMany({ data: users.map((user) => ({ ...user, passwordHash })) });
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  base = `http://127.0.0.1:${port}/api/v1`;
  child = spawn(process.execPath, ['apps/api/dist/main.js'], {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PORT: String(port),
      EMAIL_TRANSPORT: 'disabled',
      TURNSTILE_MODE: 'disabled',
      LOG_LEVEL: 'silent',
    },
  });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output = (output + chunk).slice(-4000);
  });
  child.stderr.on('data', (chunk) => {
    output = (output + chunk).slice(-4000);
  });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw Error(`Test API exited: ${output}`);
    try {
      if ((await fetch(base + '/health/live')).ok) {
        ready = true;
        break;
      }
    } catch {
      /* starting */
    }
    await delay(250);
  }
  assert.ok(ready, 'Test API did not start');
  await api('/cms/page-builder', { status: 401 });
  for (const role of cmsRoles) {
    tokens[role] = await login(role);
    const me = await api('/cms/auth/me', { role });
    assert.equal(me.role, role);
    assert.ok(me.lastLoginAt);
    assert.equal('passwordHash' in me, false);
    const stored = await db.cmsSession.findUnique({ where: { tokenHash: digest(tokens[role]) } });
    assert.equal(stored.userId, account(role).id);
  }

  await api('/cms/admin/users', { role: 'EDITOR', status: 403 });
  await api('/cms/admin/users', { role: 'ADMIN' });
  await api('/cms/admin/users', { role: 'ADMIN', method: 'POST', body: {}, status: 403 });
  await api('/cms/leads', { role: 'SALES' });
  await api('/cms/leads', { role: 'EDITOR', status: 403 });
  await api('/cms/leads/settings', { role: 'SALES', status: 403 });
  await api('/cms/admin/records/job-applications', { role: 'HR' });
  await api('/cms/admin/records/job-applications', { role: 'SALES', status: 403 });
  await api('/cms/company/about', {
    role: 'EDITOR',
    method: 'PUT',
    body: { published: false },
    status: 403,
  });
  await api('/cms/page-builder', { role: 'VIEWER', method: 'POST', body: {}, status: 403 });
  const document = makeDocument(`/${prefix}`);
  document.sections = [makeSection('Hero', 0)];
  const page = await api('/cms/page-builder', {
    role: 'EDITOR',
    method: 'POST',
    body: { document, version: 0, action: 'save' },
    status: 201,
  });
  pageIds.push(page.id);
  await api(`/cms/page-builder/${page.id}`, {
    role: 'EDITOR',
    method: 'PUT',
    body: { document, version: page.version, action: 'publish' },
    status: 403,
  });
  assert.equal((await db.cmsPage.findUnique({ where: { id: page.id } })).publishedAt, null);
  await api(`/cms/page-builder/${page.id}`, {
    role: 'CONTENT_MANAGER',
    method: 'PUT',
    body: { document, version: page.version, action: 'publish' },
  });
  await api(`/cms/page-builder/${page.id}/state`, {
    role: 'EDITOR',
    method: 'POST',
    body: { version: 2, action: 'archive', confirmation: 'CONFIRM' },
    status: 403,
  });
  console.log('HTTP role boundaries and draft/publish separation passed.');

  const viewerSessions = await api('/cms/auth/sessions', { role: 'VIEWER' });
  const viewerSession = viewerSessions.items.find((s) => s.current);
  assert.ok(viewerSession);
  await api(`/cms/auth/sessions/${viewerSession.id}/revoke`, {
    role: 'EDITOR',
    method: 'POST',
    body: {},
    status: 201,
  });
  await api('/cms/auth/me', { role: 'VIEWER' });
  await api(`/cms/auth/sessions/${viewerSession.id}/revoke`, {
    role: 'VIEWER',
    method: 'POST',
    body: {},
    status: 201,
  });
  await api('/cms/auth/me', { role: 'VIEWER', status: 401 });
  tokens.VIEWER = await login('VIEWER');
  await db.cmsSession.update({
    where: { tokenHash: digest(tokens.VIEWER) },
    data: { lastSeenAt: new Date(Date.now() - 31 * 60000) },
  });
  await api('/cms/auth/me', { role: 'VIEWER', status: 401 });
  tokens.VIEWER = await login('VIEWER');
  await db.cmsSession.update({
    where: { tokenHash: digest(tokens.VIEWER) },
    data: { expiresAt: new Date(0) },
  });
  await api('/cms/auth/me', { role: 'VIEWER', status: 401 });
  await api('/cms/auth/logout', { role: 'EDITOR', method: 'POST', body: {}, status: 201 });
  await api('/cms/auth/me', { role: 'EDITOR', status: 401 });
  tokens.EDITOR = await login('EDITOR');
  const secondEditor = await login('EDITOR');
  await api('/cms/auth/logout-all', { role: 'EDITOR', method: 'POST', body: {}, status: 201 });
  await api('/cms/auth/me', { role: 'EDITOR', status: 401 });
  await api('/cms/auth/me', { token: secondEditor, status: 401 });
  console.log('Session ownership, expiry, idle timeout, logout and logout-all passed.');

  const sales = account('SALES');
  await api(`/cms/admin/users/${sales.id}`, {
    role: 'SUPER_ADMIN',
    method: 'PUT',
    body: {
      email: sales.email,
      role: 'SALES',
      disabled: true,
      version: 0,
      confirmation: 'CONFIRM',
    },
  });
  await api('/cms/auth/me', { role: 'SALES', status: 401 });
  await login('SALES', password, 401);
  const superAdmin = account('SUPER_ADMIN');
  await api(`/cms/admin/users/${superAdmin.id}`, {
    role: 'SUPER_ADMIN',
    method: 'PUT',
    body: {
      email: superAdmin.email,
      role: 'ADMIN',
      disabled: false,
      version: 0,
      confirmation: 'CONFIRM',
    },
    status: 409,
  });

  const hr = account('HR');
  const resetToken = randomBytes(32).toString('hex');
  await db.cmsPasswordReset.create({
    data: {
      userId: hr.id,
      tokenHash: digest(resetToken),
      authVersion: 0,
      expiresAt: new Date(Date.now() + 60000),
    },
  });
  const nextPassword = randomBytes(24).toString('base64url');
  const resetBody = { token: resetToken, password: nextPassword, confirmation: nextPassword };
  const responses = await Promise.all(
    [0, 1].map(() =>
      fetch(base + '/cms/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetBody),
      }),
    ),
  );
  assert.deepEqual(
    responses.map((r) => r.status).sort(),
    [201, 400],
    'Exactly one concurrent reset may succeed',
  );
  checks += 2;
  await api('/cms/auth/me', { role: 'HR', status: 401 });
  await login('HR', password, 401);
  tokens.HR = await login('HR', nextPassword);
  assert.equal(
    await verifyPassword(
      nextPassword,
      (await db.cmsUser.findUnique({ where: { id: hr.id } })).passwordHash,
    ),
    true,
  );
  await api('/cms/auth/reset-password', { method: 'POST', body: resetBody, status: 400 });
  console.log(
    'Account status, self-demotion protection, concurrent one-time reset and session revocation passed.',
  );

  const missing = `${prefix}-missing@example.test`;
  const recovery = await api('/cms/auth/forgot-password', {
    method: 'POST',
    body: { email: missing },
    status: 201,
  });
  const known = await api('/cms/auth/forgot-password', {
    method: 'POST',
    body: { email: hr.email },
    status: 201,
  });
  assert.deepEqual(recovery, known);
  const key = digest(`login:account:${account('MARKETING').email}`);
  await db.loginThrottle.upsert({
    where: { key },
    create: { key, attempts: 10, resetAt: new Date(Date.now() + 60000) },
    update: { attempts: 10, resetAt: new Date(Date.now() + 60000) },
  });
  await login('MARKETING', password, 429);
  console.log(`Passed ${checks} HTTP checks against PostgreSQL.`);
} finally {
  if (child && child.exitCode === null) {
    const stopped = once(child, 'exit');
    child.kill();
    await stopped;
  }
  const ids = users.map((u) => u.id);
  await db.cmsPage.deleteMany({ where: { id: { in: pageIds } } });
  await db.cmsAudit.deleteMany({
    where: { OR: [{ actorId: { in: ids } }, { entityId: { in: [...ids, ...pageIds] } }] },
  });
  await db.cmsSession.deleteMany({ where: { userId: { in: ids } } });
  await db.cmsPasswordReset.deleteMany({ where: { userId: { in: ids } } });
  await db.cmsRecoveryJob.deleteMany({ where: { email: { startsWith: prefix } } });
  await db.loginThrottle.deleteMany({
    where: {
      key: {
        in: users.flatMap((u) =>
          ['login', 'recovery'].map((scope) => digest(`${scope}:account:${u.email}`)),
        ),
      },
    },
  });
  await db.cmsUser.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
}
