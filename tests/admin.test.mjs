import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { adminWriteSchema, adminBulkSchema } from '../packages/validation/dist/index.js';
import { authorizeModule, AdminController } from '../apps/api/dist/admin/admin.controller.js';
import { archiveCatalog } from '../apps/api/dist/admin/catalog-archive.js';
test('Admin validates module-specific workflows, URLs, email, and explicit bulk confirmation', () => {
  const data = {
    title: 'Lead',
    language: 'en',
    status: 'new',
    data: { email: 'person@example.test' },
    referenceIds: [],
    version: 0,
  };
  assert.equal(adminWriteSchema('leads').safeParse(data).success, true);
  assert.equal(
    adminWriteSchema('leads').safeParse({ ...data, status: 'published' }).success,
    false,
  );
  assert.equal(
    adminWriteSchema('leads').safeParse({ ...data, data: { email: 'invalid' } }).success,
    false,
  );
  assert.equal(
    adminWriteSchema('media').safeParse({
      ...data,
      status: 'draft',
      data: { url: 'javascript:alert(1)', alt: 'image' },
    }).success,
    false,
  );
  const action = { action: 'archive', records: [{ id: randomUUID(), version: 1 }] };
  assert.equal(adminBulkSchema.safeParse(action).success, false);
  assert.equal(adminBulkSchema.safeParse({ ...action, confirmation: 'CONFIRM' }).success, true);
});
test('Business records stay private while editors may update page drafts', () => {
  for (const role of ['EDITOR', 'VIEWER', 'CONTENT_MANAGER']) {
    assert.throws(() => authorizeModule({ cmsUser: { role } }, 'leads'), { status: 403 });
  }
  assert.doesNotThrow(() => authorizeModule({ cmsUser: { role: 'EDITOR' } }, 'pages', true));
  assert.throws(() => authorizeModule({ cmsUser: { role: 'VIEWER' } }, 'pages', true), {
    status: 403,
  });
  assert.doesNotThrow(() =>
    authorizeModule({ cmsUser: { role: 'CONTENT_MANAGER' } }, 'pages', true),
  );
});
test('Catalog archive rejects references before changing the record', async () => {
  const tx = {
    solutionService: { count: async () => 1 },
    industryService: { count: async () => 0 },
    projectService: { count: async () => 0 },
    service: { updateMany: () => assert.fail('Must preserve referenced record') },
  };
  await assert.rejects(archiveCatalog(tx, 'service', randomUUID(), 0, randomUUID()), {
    status: 409,
  });
});
test('Catalog archive preserves data, records actor, and disables public visibility', async () => {
  let update, audit;
  const tx = {
    pageCatalogReference: { count: async () => 0 },
    solutionProject: { count: async () => 0 },
    industryProject: { count: async () => 0 },
    project: {
      updateMany: async (value) => {
        update = value;
        return { count: 1 };
      },
    },
    cmsAudit: {
      create: async (value) => {
        audit = value;
      },
    },
  };
  await archiveCatalog(tx, 'project', randomUUID(), 3, 'actor');
  assert.equal(update.data.published, false);
  assert.ok(update.data.deletedAt instanceof Date);
  assert.equal(update.data.updatedById, 'actor');
  assert.equal(audit.data.action, 'project.archive');
});
test('Only super admins can manage access and self-disable is rejected', async () => {
  const controller = new AdminController({});
  await assert.rejects(
    controller.createUser({}, { cmsUser: { role: 'ADMIN', id: randomUUID() } }),
    { status: 403 },
  );
  const id = randomUUID();
  await assert.rejects(
    controller.updateUser(
      id,
      {
        email: 'admin@example.test',
        role: 'SUPER_ADMIN',
        disabled: true,
        version: 0,
        confirmation: 'CONFIRM',
      },
      { cmsUser: { role: 'SUPER_ADMIN', id } },
    ),
    { status: 409 },
  );
});
