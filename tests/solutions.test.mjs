import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  solutionWriteSchema,
  solutionQuerySchema,
  solutionAreas,
} from '../packages/validation/dist/index.js';
import {
  SolutionsController,
  CmsSolutionsController,
  publicSolutionWhere,
} from '../apps/api/dist/solutions/solutions.controller.js';
import { CmsAdminGuard } from '../apps/api/dist/cms/cms.guard.js';
import { reordered, publicServiceWhere } from '../apps/api/dist/cms/content-policy.js';
import { initialSolutionNames } from '../apps/api/prisma/solution-catalog.ts';
import { categorySlug } from '../apps/api/prisma/service-catalog.ts';
const draft = () => ({
  slug: 'development-only-solution',
  status: 'DRAFT',
  published: false,
  active: false,
  featured: false,
  sortOrder: 0,
  version: 0,
  serviceIds: [],
  industryIds: [],
  projectIds: [],
  translations: [
    {
      locale: 'en',
      name: 'Development test only',
      shortDescription: '',
      published: false,
      seoTitle: '',
      seoDescription: '',
      blocks: [],
    },
  ],
});
test('Solutions catalog has exactly the ten distinct CMS draft names', () => {
  assert.equal(initialSolutionNames.length, 10);
  assert.equal(new Set(initialSolutionNames.map(categorySlug)).size, 10);
  assert.equal(Object.keys(solutionAreas).length, 12);
});
test('Solutions validate independent activation, consistent publication status and complete translations', () => {
  const value = draft();
  value.active = true;
  assert.equal(solutionWriteSchema.safeParse(value).success, true);
  value.published = true;
  assert.equal(solutionWriteSchema.safeParse(value).success, false);
  value.status = 'PUBLISHED';
  assert.equal(solutionWriteSchema.safeParse(value).success, false);
  Object.assign(value.translations[0], {
    published: true,
    shortDescription: 'Test',
    seoTitle: 'Test',
    seoDescription: 'Test',
    blocks: [
      {
        area: 'hero',
        content: {
          id: randomUUID(),
          type: 'hero',
          title: 'Test',
          description: '',
          assetKey: 'none',
        },
      },
    ],
  });
  assert.equal(solutionWriteSchema.safeParse(value).success, true);
  value.translations.push({ ...value.translations[0] });
  assert.equal(solutionWriteSchema.safeParse(value).success, false);
});
test('Solution relations are unique UUID references, not copied service payloads', () => {
  const value = draft(),
    id = randomUUID();
  value.serviceIds = [id, id];
  assert.equal(solutionWriteSchema.safeParse(value).success, false);
  value.serviceIds = [id];
  assert.equal(solutionWriteSchema.safeParse(value).success, true);
  value.translations[0].blocks = [
    {
      area: 'includedServices',
      content: { id: randomUUID(), type: 'related-services', title: 'Test', ids: [id] },
    },
  ];
  assert.equal(solutionWriteSchema.safeParse(value).success, false);
  value.translations[0].blocks[0].content.ids = [];
  assert.equal(solutionWriteSchema.safeParse(value).success, true);
});
test('Solution section semantics, safe CTA and unique section IDs are validated', () => {
  const value = draft();
  const block = {
    area: 'businessChallenge',
    content: { id: randomUUID(), type: 'overview', title: 'Test', body: 'Test' },
  };
  value.translations[0].blocks = [block];
  assert.equal(solutionWriteSchema.safeParse(value).success, true);
  value.translations[0].blocks.push(block);
  assert.equal(solutionWriteSchema.safeParse(value).success, false);
  value.translations[0].blocks = [
    {
      area: 'cta',
      content: {
        id: randomUUID(),
        type: 'cta',
        title: 'Test',
        body: '',
        label: 'Test',
        href: '//outside.example',
      },
    },
  ];
  assert.equal(solutionWriteSchema.safeParse(value).success, false);
  value.translations[0].blocks = [{ ...block, area: 'hero' }];
  assert.equal(solutionWriteSchema.safeParse(value).success, false);
});
test('All eight CMS roles enforce catalog update permissions', () => {
  for (const role of [
    'SUPER_ADMIN',
    'ADMIN',
    'CONTENT_MANAGER',
    'EDITOR',
    'MARKETING',
    'SALES',
    'HR',
    'VIEWER',
  ]) {
    const ctx = {
      getClass: () => ({ name: 'CmsSolutionsController' }),
      getHandler: () => ({ name: 'update' }),
      switchToHttp: () => ({ getRequest: () => ({ cmsUser: { role }, method: 'PUT' }) }),
    };
    if (!['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'].includes(role))
      assert.throws(
        () => new CmsAdminGuard().canActivate(ctx),
        (e) => e.getStatus() === 403,
      );
    else assert.equal(new CmsAdminGuard().canActivate(ctx), true);
  }
});
test('Public Solutions filter every publication flag, locale, feature and linked Service eligibility', async () => {
  const db = {
    solution: {
      findMany: async ({ where, skip }) => {
        assert.equal(where.active, true);
        assert.equal(where.published, true);
        assert.equal(where.status, 'PUBLISHED');
        assert.equal(where.translations.some.locale, 'ar');
        assert.equal(where.translations.some.published, true);
        assert.equal(where.featured, true);
        assert.equal(skip, 12);
        assert.deepEqual(where.services.some.service, {
          ...publicServiceWhere('ar'),
          slug: 'cloud-solutions',
        });
        return [];
      },
      count: async () => 0,
    },
    $transaction: async (promises) => Promise.all(promises),
  };
  await new SolutionsController(db).list({
    locale: 'ar',
    page: 2,
    featured: 'true',
    service: 'cloud-solutions',
  });
  assert.equal(solutionQuerySchema.safeParse({ published: 'false' }).success, false);
  assert.equal(solutionQuerySchema.safeParse({ page: 0 }).success, false);
  assert.equal(publicSolutionWhere('tr').translations.some.locale, 'tr');
});
test('Unknown and malformed Solution slugs return 404; preview is not a public query option', async () => {
  const controller = new SolutionsController({ solution: { findFirst: async () => null } });
  for (const slug of ['missing', 'INVALID_slug'])
    await assert.rejects(
      () => controller.detail(slug, {}),
      (e) => e.getStatus() === 404,
    );
  await assert.rejects(
    () => controller.detail('missing', { preview: 'true' }),
    (e) => e.getStatus() === 400,
  );
});
test('Stale Solution updates fail atomically before relationships or audit writes', async () => {
  const db = {
    $transaction: async (fn) =>
      fn({ solution: { findUnique: async () => null, updateMany: async () => ({ count: 0 }) } }),
  };
  await assert.rejects(
    () =>
      new CmsSolutionsController(db).update(randomUUID(), draft(), {
        cmsUser: { id: randomUUID() },
      }),
    (e) => e.getStatus() === 409,
  );
  assert.equal(reordered(['a', 'b'], ['b', 'a']), true);
  assert.equal(reordered(['a', 'b'], ['a', 'c', 'b']), false);
});
