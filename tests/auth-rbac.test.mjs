import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MODULE_METADATA, METHOD_METADATA } from '@nestjs/common/constants.js';
import { CmsGuard, CmsAdminGuard } from '../apps/api/dist/cms/cms.guard.js';
import { CmsAuthController } from '../apps/api/dist/cms/auth.controller.js';
import { RecoveryService } from '../apps/api/dist/cms/recovery.service.js';
import { throttleAuth } from '../apps/api/dist/cms/auth-throttle.js';
import { digest, hashPassword, verifyPassword } from '../apps/api/dist/cms/password.js';
import {
  enforceEndpoint,
  endpointPermissions,
  publicEndpoints,
} from '../apps/api/dist/cms/permissions.js';
import {
  cmsRoles,
  allPermissions,
  permissionsForRole,
  hasPermission,
  accountEmailSchema,
} from '../packages/validation/dist/index.js';

// Module metadata imports validate configuration but do not connect to a database.
process.env.DATABASE_URL ??= 'postgresql://unit:unit@localhost:5432/unit';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
const { AppModule } = await import('../apps/api/dist/app.module.js');

function context(req, controller = 'PageBuilderController', handler = 'list') {
  return {
    getClass: () => ({ name: controller }),
    getHandler: () => ({ name: handler }),
    switchToHttp: () => ({ getRequest: () => req }),
  };
}
const request = (role, body = {}, method = 'POST', params = {}) => ({
  cmsUser: { id: randomUUID(), role },
  body,
  method,
  params,
});

test('Every registered HTTP endpoint has exactly one public or protected policy and the global guard is installed', () => {
  const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AppModule);
  let routes = 0;
  const seen = new Set();
  for (const controller of controllers) {
    for (const method of Object.getOwnPropertyNames(controller.prototype)) {
      const fn = controller.prototype[method];
      if (Reflect.getMetadata(METHOD_METADATA, fn) === undefined) continue;
      routes++;
      seen.add(`${controller.name}.${method}`);
      const publicRoute = publicEndpoints[controller.name]?.includes(method) ?? false;
      const protectedRoute = !!endpointPermissions[controller.name]?.[method];
      assert.notEqual(
        publicRoute,
        protectedRoute,
        `${controller.name}.${method} must have exactly one policy`,
      );
    }
  }
  assert.ok(routes > 70, `Expected the full API, found ${routes} routes`);
  for (const [name, handlers] of Object.entries(endpointPermissions))
    for (const handler of Object.keys(handlers))
      // Shared CRUD policy maps intentionally contain unused conventional operations.
      if (!['detail', 'remove', 'preview', 'audit'].includes(handler))
        assert.ok(seen.has(`${name}.${handler}`), `Stale policy: ${name}.${handler}`);
  assert.ok(
    Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule).some(
      (p) => p.useExisting === CmsGuard && String(p.provide).startsWith('APP_GUARD'),
    ),
  );
});

test('All eight roles have explicit granular grants; unknown roles and permissions fail closed', () => {
  assert.equal(cmsRoles.length, 8);
  assert.equal(new Set(allPermissions).size, allPermissions.length);
  assert.deepEqual(permissionsForRole('SUPER_ADMIN'), allPermissions);
  for (const role of cmsRoles) {
    assert.ok(hasPermission(role, 'account.manage'));
    assert.equal(hasPermission(role, 'users.update'), role === 'SUPER_ADMIN');
    assert.equal(
      hasPermission(role, 'pages.publish'),
      ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'].includes(role),
    );
    assert.equal(
      hasPermission(role, 'leads.read'),
      ['SUPER_ADMIN', 'ADMIN', 'SALES'].includes(role),
    );
    assert.equal(
      hasPermission(role, 'careers.applications.read'),
      ['SUPER_ADMIN', 'ADMIN', 'HR'].includes(role),
    );
    assert.equal(hasPermission(role, 'settings.update'), ['SUPER_ADMIN', 'ADMIN'].includes(role));
    assert.equal(
      hasPermission(role, 'blog.publish'),
      ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'MARKETING'].includes(role),
    );
    assert.equal(hasPermission(role, 'pages.*'), false);
  }
  for (const role of ['owner', '__proto__', 'constructor', ''])
    assert.deepEqual(permissionsForRole(role), []);
  assert.equal(hasPermission('SUPER_ADMIN', 'unknown.read'), false);
  assert.equal(accountEmailSchema.parse(' Person@Example.test '), 'person@example.test');
});

test('Every static backend permission policy enforces its grants for all roles', () => {
  for (const [controller, handlers] of Object.entries(endpointPermissions)) {
    for (const [handler, policy] of Object.entries(handlers)) {
      if (typeof policy === 'function') continue;
      for (const role of cmsRoles) {
        const call = () => enforceEndpoint(controller, handler, request(role));
        if (policy.every((permission) => hasPermission(role, permission)))
          assert.doesNotThrow(call);
        else assert.throws(call, { status: 403 });
      }
    }
  }
});

test('Publication, archive, dynamic modules and direct live edits have separate permissions', () => {
  assert.throws(
    () =>
      enforceEndpoint('CmsInsightsController', 'update', request('EDITOR', { status: 'archived' })),
    { status: 403 },
  );
  assert.doesNotThrow(() =>
    enforceEndpoint(
      'CmsInsightsController',
      'update',
      request('MARKETING', { status: 'archived' }),
    ),
  );
  assert.doesNotThrow(() =>
    enforceEndpoint('PageBuilderController', 'update', request('EDITOR', { action: 'save' })),
  );
  for (const action of ['publish', 'unpublish'])
    assert.throws(
      () => enforceEndpoint('PageBuilderController', 'update', request('EDITOR', { action })),
      { status: 403 },
    );
  assert.throws(
    () =>
      enforceEndpoint('PageBuilderController', 'state', request('EDITOR', { action: 'archive' })),
    { status: 403 },
  );
  assert.throws(
    () => enforceEndpoint('CmsCompanyController', 'save', request('EDITOR', { published: false })),
    { status: 403 },
  );
  assert.throws(
    () =>
      enforceEndpoint(
        'CmsInsightsController',
        'update',
        request('EDITOR', { status: 'scheduled' }),
      ),
    { status: 403 },
  );
  assert.throws(
    () => enforceEndpoint('CmsInsightsController', 'updateTaxonomy', request('EDITOR')),
    { status: 403 },
  );
  assert.doesNotThrow(() =>
    enforceEndpoint(
      'AdminController',
      'update',
      request('HR', {}, 'PUT', { module: 'job-applications' }),
    ),
  );
  assert.throws(
    () =>
      enforceEndpoint(
        'AdminController',
        'list',
        request('SALES', {}, 'GET', { module: 'job-applications' }),
      ),
    { status: 403 },
  );
  assert.throws(
    () =>
      enforceEndpoint(
        'AdminController',
        'list',
        request('SUPER_ADMIN', {}, 'GET', { module: '__proto__' }),
      ),
    { status: 403 },
  );
  assert.throws(() => enforceEndpoint('NewController', 'create', request('SUPER_ADMIN')), {
    status: 403,
  });
  assert.throws(
    () => enforceEndpoint('PageBuilderController', 'constructor', request('SUPER_ADMIN')),
    { status: 403 },
  );
});

test('Guard rejects forged request identity, bad tokens, expiry, idle timeout, disabled users and revoked versions', async () => {
  let stored = null;
  const db = {
    cmsSession: { findUnique: async () => stored, updateMany: async () => ({ count: 1 }) },
  };
  const guard = new CmsGuard(db, {
    read: async () => ({ settings: { security: { sessionIdleMinutes: 30 } } }),
  });
  await assert.rejects(
    guard.canActivate(context({ headers: {}, cmsUser: { role: 'SUPER_ADMIN' } })),
    { status: 401 },
  );
  for (const value of ['', 'Bearer bad', 'Bearer ' + 'b'.repeat(64)]) {
    await assert.rejects(guard.canActivate(context({ headers: { authorization: value } })), {
      status: 401,
    });
  }
  const valid = {
    id: randomUUID(),
    authVersion: 2,
    expiresAt: new Date(Date.now() + 60000),
    lastSeenAt: new Date(),
    user: { id: randomUUID(), role: 'VIEWER', disabled: false, authVersion: 2 },
  };
  for (const patch of [
    { expiresAt: new Date(0) },
    { lastSeenAt: new Date(Date.now() - 31 * 60000) },
    { user: { ...valid.user, disabled: true } },
    { authVersion: 1 },
  ]) {
    stored = { ...valid, ...patch };
    await assert.rejects(
      guard.canActivate(context({ headers: { authorization: 'Bearer ' + 'b'.repeat(64) } })),
      { status: 401 },
    );
  }
  stored = valid;
  const req = { headers: { authorization: 'Bearer ' + 'b'.repeat(64) }, method: 'GET' };
  assert.equal(await guard.canActivate(context(req)), true);
  assert.equal(req.cmsSessionId, valid.id);
  assert.ok(req.cmsUser.permissions.includes('pages.read'));
  assert.equal('passwordHash' in req.cmsUser, false);
  assert.throws(
    () => new CmsAdminGuard().canActivate(context(req, 'PageBuilderController', 'update')),
    { status: 403 },
  );
  db.cmsSession.updateMany = async () => ({ count: 0 });
  await assert.rejects(guard.canActivate(context({ headers: req.headers, method: 'GET' })), {
    status: 401,
  });
});

test('Login creates a random hashed session, records last login, and returns generic failures', async () => {
  const password = 'Unit test passphrase 2026!';
  const user = {
    id: randomUUID(),
    email: 'unit@example.test',
    role: 'EDITOR',
    passwordHash: await hashPassword(password),
    disabled: false,
    authVersion: 0,
  };
  let created, updated;
  const db = {
    $queryRaw: async () => [{ attempts: 1 }],
    cmsUser: {
      findUnique: async () => user,
      updateMany: async (v) => {
        updated = v;
        return { count: 1 };
      },
    },
    cmsSession: {
      deleteMany: async () => {},
      create: async (v) => {
        created = v.data;
      },
    },
    cmsAudit: { create: async () => {} },
    $transaction: async (fn) => fn(db),
  };
  const controller = new CmsAuthController(db);
  const token = (
    await controller.login({ email: user.email, password }, { headers: {}, ip: 'unit' })
  ).token;
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(created.tokenHash, digest(token));
  assert.equal(JSON.stringify(created).includes(token), false);
  assert.equal(created.authVersion, 0);
  assert.ok(updated.data.lastLoginAt instanceof Date);
  assert.ok(created.expiresAt.getTime() > Date.now() + 7 * 3600000);
  user.disabled = true;
  await assert.rejects(
    controller.login({ email: user.email, password }, { headers: {}, ip: 'unit' }),
    { status: 401, message: 'Invalid credentials' },
  );
  db.cmsUser.findUnique = async () => null;
  await assert.rejects(
    controller.login({ email: user.email, password }, { headers: {}, ip: 'unit' }),
    { status: 401, message: 'Invalid credentials' },
  );
});

test('Logout is scoped to the current user and session; logout-all invalidates sessions and reset links', async () => {
  const id = randomUUID(),
    sessionId = randomUUID();
  const deletes = [],
    updates = [];
  const db = {
    cmsUser: {
      updateMany: async (v) => {
        updates.push(v);
      },
    },
    cmsSession: {
      deleteMany: async (v) => {
        deletes.push(v.where);
      },
    },
    cmsPasswordReset: {
      deleteMany: async (v) => {
        deletes.push(v.where);
      },
    },
    cmsAudit: { create: async () => {} },
    $transaction: async (fn) => fn(db),
  };
  const controller = new CmsAuthController(db);
  const req = { cmsUser: { id }, cmsSessionId: sessionId };
  await controller.logout(req);
  assert.deepEqual(deletes[0], { id: sessionId, userId: id });
  await assert.rejects(controller.logout({ cmsUser: { id } }), { status: 401 });
  await controller.revokeSession(randomUUID(), req);
  assert.equal(deletes[1].userId, id);
  await controller.logoutAll(req);
  assert.deepEqual(updates[0], { where: { id }, data: { authVersion: { increment: 1 } } });
  assert.deepEqual(deletes.slice(2), [{ userId: id }, { userId: id }]);
});

test('Recovery sends a short-lived token only through email and stores its hash', async () => {
  let stored, sent;
  const user = {
    id: randomUUID(),
    email: 'recovery@example.test',
    authVersion: 3,
    disabled: false,
  };
  const db = {
    cmsRecoveryJob: {
      deleteMany: async () => {},
      findFirst: async () => ({
        id: randomUUID(),
        email: user.email,
        attempts: 0,
        claimedAt: null,
      }),
      updateMany: async () => ({ count: 1 }),
    },
    cmsUser: { findUnique: async () => user },
    cmsPasswordReset: {
      deleteMany: async () => {},
      upsert: async (v) => {
        stored = v.create;
      },
    },
    loginThrottle: { deleteMany: async () => {} },
  };
  const service = new RecoveryService(
    db,
    {
      enabled: true,
      send: async (v) => {
        sent = v;
      },
    },
    { getOrThrow: () => 'https://example.test' },
  );
  await service.process();
  const token = sent.text.match(/#reset=([a-f0-9]{64})/)[1];
  assert.equal(stored.tokenHash, digest(token));
  assert.equal(stored.authVersion, 3);
  assert.ok(stored.expiresAt > new Date());
  assert.ok(stored.expiresAt <= new Date(Date.now() + 30 * 60000));
  assert.equal(JSON.stringify(stored).includes(token), false);
  sent = null;
  user.disabled = true;
  await service.process();
  assert.equal(sent, null);
});

test('Reset consumes the token, hashes the new password, revokes sessions and rejects expired links', async () => {
  const token = 'c'.repeat(64),
    id = randomUUID();
  let updated, consumed, revoked;
  let reset = { userId: id, authVersion: 3, expiresAt: new Date(Date.now() + 60000) };
  const db = {
    $queryRaw: async () => [{ attempts: 1 }],
    cmsPasswordReset: {
      findUnique: async ({ where }) => {
        assert.equal(where.tokenHash, digest(token));
        return reset;
      },
      deleteMany: async (v) => {
        consumed = v;
        reset = null;
        return { count: 1 };
      },
    },
    cmsUser: {
      updateMany: async (v) => {
        updated = v;
        return { count: 1 };
      },
    },
    cmsSession: {
      deleteMany: async (v) => {
        revoked = v;
      },
    },
    cmsAudit: { create: async () => {} },
    $transaction: async (fn) => fn(db),
  };
  const controller = new CmsAuthController(db);
  const body = {
    token,
    password: 'New unit test passphrase!',
    confirmation: 'New unit test passphrase!',
  };
  await controller.resetPassword(body, { ip: 'unit' });
  assert.deepEqual(updated.where, { id, disabled: false, authVersion: 3 });
  assert.equal(await verifyPassword(body.password, updated.data.passwordHash), true);
  assert.equal(consumed.where.tokenHash, digest(token));
  assert.deepEqual(revoked.where, { userId: id });
  await assert.rejects(controller.resetPassword(body, { ip: 'unit' }), { status: 400 });
  reset = { userId: id, authVersion: 3, expiresAt: new Date(0) };
  await assert.rejects(controller.resetPassword(body, { ip: 'unit' }), { status: 400 });
});

test('Persistent login throttles hash account/IP keys and enforce bounded attempt limits', async () => {
  const keys = [];
  const db = {
    $queryRaw: async (_strings, key) => {
      keys.push(key);
      return [{ attempts: 11 }];
    },
  };
  await assert.rejects(throttleAuth(db, 'login', '192.0.2.1', 'private@example.test'), {
    status: 429,
  });
  assert.deepEqual(keys, [
    digest('login:ip:192.0.2.1'),
    digest('login:account:private@example.test'),
  ]);
  const recovery = { $queryRaw: async () => [{ attempts: 4 }] };
  await assert.rejects(throttleAuth(recovery, 'recovery', '192.0.2.1', 'private@example.test'), {
    status: 429,
  });
});
