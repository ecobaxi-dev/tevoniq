import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HomeController, CmsHomeController } from '../apps/api/dist/company/home.controller.js';
import { enforceEndpoint } from '../apps/api/dist/cms/permissions.js';
import { homeContentSchema } from '../packages/validation/dist/index.js';
import { homeCopy } from '../apps/web/src/content/home.ts';
import { referenceHeroCopy } from '../apps/web/src/content/reference-hero.ts';
const content = homeContentSchema.parse({ copy: homeCopy.en, hero: referenceHeroCopy.en });
const req = { cmsUser: { id: 'test-owner', role: 'SUPER_ADMIN' } };
function database() {
  let row = null;
  const db = {
    adminRecord: {
      findFirst: async () => row,
      findMany: async () => [],
      create: async ({ data }) => (row = { ...structuredClone(data), id: 'homepage', version: 1 }),
      update: async ({ data }) =>
        (row = { ...row, ...structuredClone(data), version: row.version + 1 }),
    },
    cmsAudit: { create: async () => ({}) },
  };
  db.$transaction = async (work) => work(db);
  return db;
}
test('homepage saves drafts without changing publication, rejects stale updates, and unpublishes without restoring defaults', async () => {
  const db = database(),
    editor = new CmsHomeController(db),
    publicApi = new HomeController(db);
  let saved = await editor.save('en', { content, version: 0, action: 'publish' }, req);
  assert.equal((await publicApi.get('en')).content.copy.headline, content.copy.headline);
  const revised = structuredClone(content);
  revised.copy.headline = 'Edited headline';
  saved = await editor.save(
    'en',
    { content: revised, version: saved.version, action: 'save' },
    req,
  );
  assert.equal(saved.draft.copy.headline, 'Edited headline');
  assert.equal((await publicApi.get('en')).content.copy.headline, content.copy.headline);
  await assert.rejects(
    editor.save('en', { content: revised, version: 1, action: 'publish' }, req),
    { status: 409 },
  );
  saved = await editor.save(
    'en',
    { content: revised, version: saved.version, action: 'publish' },
    req,
  );
  assert.equal((await publicApi.get('en')).content.copy.headline, 'Edited headline');
  await editor.save('en', { content: revised, version: saved.version, action: 'unpublish' }, req);
  assert.equal((await publicApi.get('en')).content, null);
});
test('homepage publication requires publish permission and public partners query requires explicit verification', async () => {
  const request = { cmsUser: { role: 'EDITOR' }, body: { action: 'save' } };
  assert.doesNotThrow(() => enforceEndpoint('CmsHomeController', 'save', request));
  request.body.action = 'publish';
  assert.throws(() => enforceEndpoint('CmsHomeController', 'save', request), { status: 403 });
  const db = database();
  let query;
  db.adminRecord.findMany = async (args) => {
    query = args;
    return [];
  };
  await new HomeController(db).get('ar');
  assert.deepEqual(query.where, {
    module: 'partners',
    language: 'ar',
    status: 'published',
    deletedAt: null,
    data: { path: ['verified'], equals: 'true' },
  });
});
