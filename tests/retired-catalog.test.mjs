import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { of, firstValueFrom } from 'rxjs';
import {
  retiredServiceSlugs,
  isRetiredPublicPath,
  pruneRetiredCatalog,
} from '../packages/types/dist/index.js';
import { RetiredCatalogInterceptor } from '../apps/api/dist/cms/retired-catalog.interceptor.js';
import { ServicesController } from '../apps/api/dist/services/services.controller.js';

test('retired offerings cannot return through localized, encoded or builder URLs; SME services remain', async () => {
  for (const slug of retiredServiceSlugs)
    for (const locale of ['en', 'tr', 'ar']) {
      assert.equal(isRetiredPublicPath(`/${locale}/services/${slug}?source=test#overview`), true);
      assert.equal(isRetiredPublicPath(`/api/v1/services/${slug}`), true);
    }
  assert.equal(isRetiredPublicPath('/ar/services/%63loud-migration/'), true);
  assert.equal(isRetiredPublicPath('/ar/solutions/resilient-hybrid-cloud'), true);
  for (const path of [
    '/ar/services/business-automation',
    '/en/services/network-infrastructure',
    '/ar/services/ui-ux-design',
    '/ar/pesto',
    '/ar/advocas',
    '/admin/services',
  ])
    assert.equal(isRetiredPublicPath(path), false);
  const catalog = JSON.parse(
    await readFile(new URL('../content/service-expansion.json', import.meta.url)),
  );
  assert.equal(catalog.groups.flatMap((g) => g.services).length, 23);
  assert.equal(pruneRetiredCatalog(catalog).groups.flatMap((g) => g.services).length, 16);
  assert.ok(catalog.groups.every((g) => !['cloud', 'data', 'games'].includes(g.id)));
});

test('publication cleanup removes renamed links, nested related cards and retired rich-text links without mutating content', () => {
  assert.deepEqual(pruneRetiredCatalog({ query: 'SAP', groups: [] }), { query: 'SAP', groups: [] });
  assert.deepEqual(pruneRetiredCatalog([{ type: 'paragraph', text: 'SAP' }]), []);
  assert.equal(
    pruneRetiredCatalog({ body: 'تحتاج اختبارات الاختراق والمراقبة المستمرة إلى نطاق مستقل.' })
      .body,
    'تحتاج المراقبة المستمرة إلى نطاق مستقل.',
  );
  const date = new Date();
  const input = {
    updatedAt: date,
    items: [
      { title: 'Custom CMS label', href: '/ar/services/devsecops' },
      { title: 'SAP' },
      {
        title: 'Work management',
        href: '/ar/services/custom-software-development',
        children: [
          { title: 'old', href: '/services/data-governance' },
          { title: 'Keep', href: '/contact' },
        ],
      },
    ],
    blocks: [{ type: 'capabilities', items: [{ title: 'اختبار الاختراق' }] }],
    technologies: ['البنية التحتية للبيانات', 'الأتمتة'],
    body: 'Text [old](/ar/services/team-extension) <a href="/en/services/cloud-solutions">old</a> end',
  };
  const before = structuredClone(input),
    result = pruneRetiredCatalog(input);
  assert.deepEqual(input, before);
  assert.equal(result.updatedAt, date);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].children.length, 1);
  assert.deepEqual(result.blocks, []);
  assert.deepEqual(result.technologies, ['الأتمتة']);
  assert.equal(result.body, 'Text   end');
});

test('API retirement boundary returns 404 publicly and preserves private CMS records', async () => {
  const interceptor = new RetiredCatalogInterceptor();
  const context = (path) => ({
    switchToHttp: () => ({ getRequest: () => ({ method: 'GET', path }) }),
  });
  let called = false;
  assert.throws(
    () =>
      interceptor.intercept(context('/api/v1/services/cloud-migration'), {
        handle: () => {
          called = true;
          return of({});
        },
      }),
    { status: 404 },
  );
  assert.equal(called, false);
  const records = {
    items: [
      { slug: 'sap-services', title: 'Custom title' },
      { slug: 'custom-software-development', title: 'Custom software' },
    ],
  };
  const publicResult = await firstValueFrom(
    interceptor.intercept(context('/api/v1/services'), { handle: () => of(records) }),
  );
  assert.equal(publicResult.items.length, 1);
  const privateResult = await firstValueFrom(
    interceptor.intercept(context('/api/v1/cms/services'), { handle: () => of(records) }),
  );
  assert.equal(privateResult, records);
});

test('retired service detail fails before a database call and catalog counts use the same exclusion as rows', async () => {
  let reads = 0;
  const queries = [];
  const db = {
    $transaction: (work) => Promise.all(work),
    service: {
      findFirst: async () => {
        reads++;
        return null;
      },
      findMany: async ({ where }) => {
        queries.push(where);
        return [];
      },
      count: async ({ where }) => {
        queries.push(where);
        return 0;
      },
    },
  };
  const controller = new ServicesController(db);
  await assert.rejects(controller.detail('sap-services', { locale: 'ar' }), { status: 404 });
  assert.equal(reads, 0);
  await controller.list({ locale: 'ar' });
  assert.deepEqual(queries[0], queries[1]);
  assert.ok(queries[0].slug.notIn.includes('cloud-solutions'));
});

test('owner-selected seven services stay archived while every public alias is hidden', async () => {
  const requested = [
    'managed-it-services',
    'api-integration',
    'business-continuity',
    'computer-vision',
    'ai-agent-development',
    'generative-ai',
    'rag-development',
  ];
  const catalog = JSON.parse(
    await readFile(new URL('../content/service-expansion.json', import.meta.url)),
  );
  const stored = catalog.groups
    .flatMap((group) => group.services)
    .filter((item) => requested.includes(item.slug));
  assert.equal(stored.length, 7);
  const before = structuredClone(stored);
  assert.deepEqual(pruneRetiredCatalog(stored), []);
  assert.deepEqual(
    pruneRetiredCatalog([
      'Managed IT Services',
      'خدمات تقنية المعلومات المُدارة',
      'Yönetilen BT Hizmetleri',
      'System Integration',
      'تكامل الأنظمة',
      'Sistem Entegrasyonu',
      'Automation',
    ]),
    ['Automation'],
  );
  assert.deepEqual(stored, before);
  for (const slug of requested) {
    assert.ok(retiredServiceSlugs.includes(slug));
    for (const locale of ['ar', 'en', 'tr'])
      for (const kind of ['services', 'solutions'])
        assert.equal(isRetiredPublicPath(`/${locale}/${kind}/${slug}`), true);
  }
});
