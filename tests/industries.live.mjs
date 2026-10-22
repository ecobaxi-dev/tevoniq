import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { digest } from '../apps/api/dist/cms/password.js';
import {
  industryAreas,
  industryWriteSchema,
  solutionWriteSchema,
} from '../packages/validation/dist/index.js';
import { initialIndustryNames } from '../apps/api/prisma/industry-catalog.ts';
import { categorySlug } from '../apps/api/prisma/service-catalog.ts';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const base = process.env.INDUSTRIES_TEST_API_URL ?? 'http://localhost:4100/api/v1';
const origin = process.env.INDUSTRIES_TEST_WEB_URL ?? 'http://localhost:3300';
for (const url of [base, origin])
  assert.ok(['localhost', '127.0.0.1'].includes(new URL(url).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const run = randomUUID(),
  prefix = `development-industry-${run}`;
const accounts = [],
  industryIds = [],
  serviceIds = [],
  solutionIds = [],
  projectIds = [];
const report = { checks: [], screenshots: [] };
let token, browser;
const pass = (s) => {
  report.checks.push(s);
  console.log(`PASS ${s}`);
};
async function api(path, { method = 'GET', body, auth = token, status = 200 } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 800));
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
const blocks = (locale) =>
  Object.entries(industryAreas).map(([area, type]) => ({
    area,
    content: {
      id: randomUUID(),
      type,
      title: locale === 'ar' ? `اختبار تطوير — ${area}` : `Development ${area}`,
      ...(type === 'hero'
        ? { description: 'Development verification only', assetKey: 'none' }
        : type === 'overview'
          ? { body: 'Development verification only' }
          : type === 'cta'
            ? { body: '', label: 'Contact', href: '/contact' }
            : type.startsWith('related-')
              ? { ids: [] }
              : type === 'faq'
                ? { items: [{ question: 'Development question?', answer: 'Development answer.' }] }
                : {
                    items: [
                      {
                        title: 'Development example',
                        description: 'Development verification only',
                      },
                    ],
                  }),
    },
  }));
const translation = (locale) => ({
  locale,
  name: `Development industry ${locale}`,
  shortDescription: 'Development verification only',
  published: true,
  seoTitle: `Development industry ${locale} | TEVONIQ`,
  seoDescription: 'Development verification only',
  blocks: blocks(locale),
});
const writable = (r) =>
  industryWriteSchema.parse(
    Object.fromEntries(
      [
        'slug',
        'status',
        'active',
        'published',
        'featured',
        'sortOrder',
        'version',
        'serviceIds',
        'solutionIds',
        'projectIds',
        'translations',
      ].map((key) => [
        key,
        key === 'translations'
          ? r.translations.map((t) =>
              Object.fromEntries(
                [
                  'locale',
                  'name',
                  'shortDescription',
                  'published',
                  'seoTitle',
                  'seoDescription',
                  'blocks',
                ].map((k) => [k, t[k]]),
              ),
            )
          : r[key],
      ]),
    ),
  );
const solutionWritable = (r) =>
  solutionWriteSchema.parse(
    Object.fromEntries(
      [
        'slug',
        'status',
        'active',
        'published',
        'featured',
        'sortOrder',
        'version',
        'serviceIds',
        'industryIds',
        'projectIds',
        'translations',
      ].map((key) => [
        key,
        key === 'translations'
          ? r.translations.map((t) =>
              Object.fromEntries(
                [
                  'locale',
                  'name',
                  'shortDescription',
                  'published',
                  'seoTitle',
                  'seoDescription',
                  'blocks',
                ].map((k) => [k, t[k]]),
              ),
            )
          : r[key],
      ]),
    ),
  );
try {
  const seeds = await db.industry.findMany({
    where: { slug: { in: initialIndustryNames.map(categorySlug) } },
    include: { translations: true },
  });
  assert.equal(seeds.length, 11);
  assert.ok(
    seeds.every(
      (s) =>
        !s.active &&
        !s.published &&
        s.status === 'DRAFT' &&
        s.translations.every((t) => !t.published),
    ),
  );
  pass('Eleven CMS seeds exist and remain inactive, unpublished drafts');
  const seedSnapshot = JSON.stringify(seeds.sort((a, b) => a.id.localeCompare(b.id)));
  for (let i = 0; i < 2; i++)
    execFileSync(process.execPath, ['--import', 'tsx', 'prisma/seed.ts'], {
      cwd: 'apps/api',
      stdio: 'pipe',
    });
  const afterSeed = await db.industry.findMany({
    where: { id: { in: seeds.map((s) => s.id) } },
    include: { translations: true },
  });
  assert.equal(JSON.stringify(afterSeed.sort((a, b) => a.id.localeCompare(b.id))), seedSnapshot);
  pass('Two seed reruns preserve existing industry IDs, editorial content and timestamps');
  for (const role of ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'EDITOR', 'VIEWER']) {
    const account = await db.cmsUser.create({
      data: {
        email: `${prefix}-${role}@example.invalid`,
        passwordHash: 'unused-test-session',
        role,
      },
    });
    const session = randomBytes(32).toString('hex');
    await db.cmsSession.create({
      data: {
        userId: account.id,
        tokenHash: digest(session),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    accounts.push({ ...account, token: session });
  }
  token = accounts[0].token;
  await api('/cms/industries', { auth: null, status: 401 });
  for (const account of accounts) {
    await api('/cms/industries', { auth: account.token });
    if (['EDITOR', 'VIEWER'].includes(account.role))
      await api('/cms/industries', { method: 'POST', body: {}, auth: account.token, status: 403 });
  }
  pass('Authenticated reads and backend role restrictions');
  for (let i = 0; i < 2; i++) {
    const service = await db.service.create({
      data: {
        slug: `${prefix}-service-${i}`,
        active: true,
        translations: {
          create: ['en', 'ar'].map((locale) => ({
            locale,
            title: `Development service ${i}`,
            summary: 'Development verification only',
            published: true,
          })),
        },
      },
    });
    serviceIds.push(service.id);
    const solution = await db.solution.create({
      data: {
        slug: `${prefix}-solution-${i}`,
        active: true,
        published: true,
        status: 'PUBLISHED',
        translations: {
          create: ['en', 'ar'].map((locale) => ({
            ...translation(locale),
            name: `Development solution ${i}`,
            blocks: [translation(locale).blocks[0]],
          })),
        },
      },
    });
    solutionIds.push(solution.id);
  }
  const project = await db.project.create({
    data: {
      slug: `${prefix}-project`,
      published: true,
      verified: true,
      translations: {
        create: ['en', 'ar'].map((locale) => ({
          locale,
          title: 'Development project',
          seoTitle: 'Development project',
          seoDescription: 'Development verification only',
          challenge: 'Development fixture',
          solution: 'Development fixture',
          summary: 'Development verification only',
          published: true,
        })),
      },
    },
  });
  projectIds.push(project.id);
  let record = await api('/cms/industries', {
    method: 'POST',
    status: 201,
    body: {
      slug: prefix,
      active: false,
      published: false,
      status: 'DRAFT',
      featured: false,
      sortOrder: 0,
      version: 0,
      serviceIds,
      solutionIds,
      projectIds,
      translations: ['en', 'ar'].map(translation),
    },
  });
  industryIds.push(record.id);
  await api(`/industries/${prefix}`, { status: 404 });
  const preview = await api(`/cms/industries/${record.id}/preview?locale=ar`);
  assert.equal(preview.blocks.length, 9);
  assert.equal(preview.services.length, 2);
  assert.equal(preview.solutions.length, 2);
  assert.equal(preview.projects.length, 1);
  await api(`/cms/industries/${record.id}/preview`, { auth: null, status: 401 });
  await api('/cms/industries', {
    method: 'POST',
    body: { ...writable(record), version: 0 },
    status: 409,
  });
  await api(`/cms/industries/${record.id}`, {
    method: 'PUT',
    body: { ...writable(record), serviceIds: [randomUUID()] },
    status: 400,
  });
  assert.deepEqual((await api(`/cms/industries/${record.id}`)).serviceIds, serviceIds);
  record = await api(`/cms/industries/${record.id}`, {
    method: 'PUT',
    body: { ...writable(record), active: true, published: true, status: 'PUBLISHED' },
  });
  await api(`/cms/industries/${record.id}`, {
    method: 'PUT',
    body: { ...writable(record), version: 0 },
    status: 409,
  });
  for (const locale of ['en', 'ar']) {
    const detail = await api(`/industries/${prefix}?locale=${locale}`);
    assert.equal(detail.blocks.length, 9);
    assert.deepEqual(
      detail.services.map((s) => s.id),
      serviceIds,
    );
    assert.equal(detail.solutions.length, 2);
  }
  await api(`/industries/${prefix}?locale=tr`, { status: 404 });
  pass(
    'CMS create, preview, publication, translations, duplicate/stale conflicts and invalid-link rollback',
  );
  const other = await api('/cms/industries', {
    method: 'POST',
    status: 201,
    body: {
      ...writable(record),
      slug: `${prefix}-other`,
      version: 0,
      active: false,
      published: false,
      status: 'DRAFT',
    },
  });
  industryIds.push(other.id);
  assert.equal(await db.industryService.count({ where: { serviceId: serviceIds[0] } }), 2);
  assert.equal(await db.solutionIndustry.count({ where: { solutionId: solutionIds[0] } }), 2);
  assert.equal(await db.industryProject.count({ where: { projectId: project.id } }), 2);
  record = await api(`/cms/industries/${record.id}`, {
    method: 'PUT',
    body: { ...writable(record), solutionIds: [...solutionIds].reverse() },
  });
  let linkedSolution = await api(`/cms/solutions/${solutionIds[0]}`);
  assert.ok(linkedSolution.industryIds.includes(record.id));
  await api(`/cms/solutions/${linkedSolution.id}`, {
    method: 'PUT',
    body: {
      ...solutionWritable(linkedSolution),
      industryIds: [...linkedSolution.industryIds].reverse(),
    },
  });
  assert.deepEqual(
    (await api(`/cms/industries/${record.id}`)).solutionIds,
    [...solutionIds].reverse(),
  );
  linkedSolution = await api(`/cms/solutions/${solutionIds[0]}`);
  await api(`/cms/solutions/${linkedSolution.id}`, {
    method: 'PUT',
    body: {
      ...solutionWritable(linkedSolution),
      industryIds: linkedSolution.industryIds.filter((id) => id !== record.id),
    },
  });
  await api(`/cms/industries/${record.id}`, { method: 'PUT', body: writable(record), status: 409 });
  record = await api(`/cms/industries/${record.id}`);
  assert.deepEqual(record.solutionIds, [solutionIds[1]]);
  record = await api(`/cms/industries/${record.id}`, {
    method: 'PUT',
    body: { ...writable(record), solutionIds },
  });
  pass(
    'Real many-to-many links, two-sided editing, independent ordering and cross-module stale-save rejection',
  );
  await db.service.update({ where: { id: serviceIds[0] }, data: { active: false } });
  await db.solution.update({ where: { id: solutionIds[0] }, data: { published: false } });
  await db.project.update({ where: { id: project.id }, data: { verified: false } });
  let detail = await api(`/industries/${prefix}`);
  assert.equal(detail.services.length, 1);
  assert.equal(detail.solutions.length, 1);
  assert.equal(detail.projects.length, 0);
  await db.service.update({ where: { id: serviceIds[0] }, data: { active: true } });
  await db.solution.update({ where: { id: solutionIds[0] }, data: { published: true } });
  await db.project.update({ where: { id: project.id }, data: { verified: true } });
  pass('Public pages exclude inactive services, unpublished solutions and unverified projects');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies([{ name: 'tevoniq_cms_session', value: token, url: origin }]);
  const page = await context.newPage();
  await mkdir('artifacts', { recursive: true });
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 960 });
    for (const locale of ['en', 'ar']) {
      await page.goto(`${origin}/${locale}/industries/${prefix}`);
      await expect(
        page.getByRole('heading', {
          name: locale === 'ar' ? 'اختبار تطوير — hero' : 'Development hero',
          exact: true,
        }),
      ).toBeVisible();
      assert.equal(await page.locator('html').getAttribute('dir'), locale === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('main h2')).toHaveCount(8);
      assert.ok((await page.title()).includes(`Development industry ${locale}`));
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute('href'),
        `${origin}/${locale}/industries/${prefix}`,
      );
      assert.equal(await page.locator('link[hreflang="tr"]').count(), 0);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      );
      assert.equal((await new AxeBuilder({ page }).include('main').analyze()).violations.length, 0);
      const screenshot = `artifacts/industries-${width}-detail-${locale}.png`;
      await page.screenshot({ path: screenshot, fullPage: true });
      report.screenshots.push(screenshot);
    }
    await page.goto(`${origin}/en/industries?q=Development%20industry%20en`);
    await expect(
      page.getByRole('heading', { name: 'Development industry en', exact: true }),
    ).toBeVisible();
    await page.goto(`${origin}/admin/industries`);
    await expect(page.getByLabel('Search industries', { exact: true })).toBeVisible();
    await page.getByLabel('Search industries', { exact: true }).fill(prefix);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('button', { name: /Development industry en.*PUBLISHED/ }).click();
    await expect(page.getByLabel('Industry name', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Available solutions', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Available projects', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Available projects', exact: true }).getByRole('checkbox'),
    ).toHaveCount(1);
    await expect(page.getByText('Loading solutions…', { exact: true })).toHaveCount(0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    const screenshot = `artifacts/industries-${width}-admin.png`;
    await page.screenshot({ path: screenshot, fullPage: true });
    report.screenshots.push(screenshot);
  }
  await page
    .getByLabel('Short description', { exact: true })
    .fill('Development CMS save verification');
  await page.getByRole('button', { name: 'Save industry', exact: true }).click();
  await expect(page.getByText('Industry saved.', { exact: true })).toBeVisible();
  record = await api(`/cms/industries/${record.id}`);
  assert.equal(
    record.translations.find((t) => t.locale === 'en').shortDescription,
    'Development CMS save verification',
  );
  assert.equal((await fetch(`${origin}/industries`, { redirect: 'manual' })).status, 307);
  assert.equal((await fetch(`${origin}/en/industries/not-a-real-industry`)).status, 404);
  pass(
    'Desktop/mobile and Arabic pages, all sections, SEO, accessibility, CMS relationship selectors and browser save',
  );
  record = await api(`/cms/industries/${record.id}`, {
    method: 'PUT',
    body: { ...writable(record), active: false },
  });
  await api(`/industries/${prefix}`, { status: 404 });
  assert.equal((await api(`/solutions/${prefix}-solution-0`)).industries.length, 0);
  const audit = await api(`/cms/industries/${record.id}/audit?limit=40`);
  assert.ok(audit.items.some((a) => a.action === 'industry.publish'));
  await api(`/cms/industries/${record.id}`, {
    method: 'DELETE',
    body: { version: record.version },
  });
  assert.equal(await db.industryService.count({ where: { industryId: record.id } }), 0);
  assert.equal(await db.service.count({ where: { id: { in: serviceIds } } }), 2);
  assert.equal(await db.solution.count({ where: { id: { in: solutionIds } } }), 2);
  assert.equal(await db.project.count({ where: { id: project.id } }), 1);
  pass(
    'Unpublication/deactivation takes effect in related Solutions; audited deletion preserves linked records',
  );
} catch (error) {
  report.error = String(error.stack ?? error);
  throw error;
} finally {
  await browser?.close();
  await db.industry.deleteMany({ where: { id: { in: industryIds } } });
  await db.solution.deleteMany({ where: { id: { in: solutionIds } } });
  await db.service.deleteMany({ where: { id: { in: serviceIds } } });
  await db.project.deleteMany({ where: { id: { in: projectIds } } });
  await db.cmsUser.deleteMany({ where: { id: { in: accounts.map((a) => a.id) } } });
  await db.$disconnect();
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/industries-verification.json', JSON.stringify(report, null, 2));
}
