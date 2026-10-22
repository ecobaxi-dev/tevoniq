import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { digest } from '../apps/api/dist/cms/password.js';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const base = process.env.PROJECTS_TEST_API_URL ?? 'http://localhost:4100/api/v1',
  origin = process.env.PROJECTS_TEST_WEB_URL ?? 'http://localhost:3300';
for (const url of [base, origin])
  assert.ok(['localhost', '127.0.0.1'].includes(new URL(url).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const run = randomUUID(),
  slug = `development-case-${run}`,
  secret = `Confidential Development Client ${run}`,
  author = `Private Person ${run}`;
const projectIds = [],
  userIds = [],
  serviceIds = [],
  industryIds = [],
  solutionIds = [];
let token, browser;
const report = { checks: [], screenshots: [] };
const pass = (s) => {
  report.checks.push(s);
  console.log(`PASS ${s}`);
};
async function api(path, { method = 'GET', body, auth = token, status = 200 } = {}) {
  await new Promise((r) => setTimeout(r, 750));
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
const hero = () => ({
  id: randomUUID(),
  type: 'hero',
  title: 'Development fixture',
  description: 'Development verification only',
  assetKey: 'none',
});
const content = (locale) => ({
  locale,
  title: locale === 'ar' ? 'دراسة حالة للتطوير' : 'Development connected workplace',
  summary: 'Development verification only; not a client claim.',
  published: true,
  anonymousClientName: locale === 'ar' ? 'شركة ضيافة إقليمية' : 'Regional Hospitality Company',
  heroImage: {
    url: '/brand/icon.png',
    alt: 'Development image fixture',
    caption: 'Development verification only',
  },
  gallery: [
    {
      url: '/brand/icon.png',
      alt: 'Development gallery fixture',
      caption: 'Development verification only',
    },
  ],
  challenge: 'Development challenge.',
  approach: 'Development approach.',
  solution: 'Development solution.',
  implementation: 'Development implementation.',
  technologies: ['Development technology'],
  results: [{ value: '3', label: 'Development phases' }],
  testimonial: 'Development testimonial, not a client quote.',
  testimonialAuthor: author,
  seoTitle: locale === 'ar' ? 'دراسة حالة للتطوير' : 'Development case study | TEVONIQ',
  seoDescription: 'Development verification only.',
});
const body = (record) =>
  Object.fromEntries(
    [
      'slug',
      'clientName',
      'clientVisibility',
      'country',
      'city',
      'projectDate',
      'featured',
      'published',
      'verified',
      'version',
      'sortOrder',
      'industryIds',
      'serviceIds',
      'solutionIds',
      'translations',
    ].map((k) => [
      k,
      k === 'translations'
        ? record.translations.map((t) =>
            Object.fromEntries(Object.keys(content(t.locale)).map((key) => [key, t[key]])),
          )
        : record[k],
    ]),
  );
try {
  for (const role of ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'EDITOR', 'VIEWER']) {
    const user = await db.cmsUser.create({
      data: { email: `${slug}-${role}@example.invalid`, passwordHash: 'unused-test-session', role },
    });
    userIds.push(user.id);
    const session = randomBytes(32).toString('hex');
    await db.cmsSession.create({
      data: {
        userId: user.id,
        tokenHash: digest(session),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    if (role === 'SUPER_ADMIN') token = session;
    await api('/cms/projects', { auth: session });
    if (['EDITOR', 'VIEWER'].includes(role))
      await api('/cms/projects', { method: 'POST', auth: session, body: {}, status: 403 });
  }
  await api('/cms/projects', { auth: null, status: 401 });
  const service = await db.service.create({
    data: {
      slug: `${slug}-service`,
      active: true,
      translations: {
        create: ['en', 'ar'].map((locale) => ({
          locale,
          title: 'Development service',
          summary: 'Development fixture',
          published: true,
          seoTitle: 'Development service',
          seoDescription: 'Development fixture',
          blocks: [hero()],
        })),
      },
    },
  });
  serviceIds.push(service.id);
  const industry = await db.industry.create({
    data: {
      slug: `${slug}-industry`,
      active: true,
      published: true,
      status: 'PUBLISHED',
      translations: {
        create: ['en', 'ar'].map((locale) => ({
          locale,
          name: 'Development industry',
          shortDescription: 'Development fixture',
          published: true,
          seoTitle: 'Development industry',
          seoDescription: 'Development fixture',
          blocks: [{ area: 'hero', content: hero() }],
        })),
      },
    },
  });
  industryIds.push(industry.id);
  const solution = await db.solution.create({
    data: {
      slug: `${slug}-solution`,
      active: true,
      published: true,
      status: 'PUBLISHED',
      translations: {
        create: ['en', 'ar'].map((locale) => ({
          locale,
          name: 'Development solution',
          shortDescription: 'Development fixture',
          published: true,
          seoTitle: 'Development solution',
          seoDescription: 'Development fixture',
          blocks: [{ area: 'hero', content: hero() }],
        })),
      },
    },
  });
  solutionIds.push(solution.id);
  let project = await api('/cms/projects', {
    method: 'POST',
    status: 201,
    body: {
      slug,
      clientName: secret,
      country: 'Türkiye',
      city: 'Istanbul',
      projectDate: '2026-01-15',
      published: false,
      verified: false,
      featured: true,
      version: 0,
      industryIds,
      serviceIds,
      solutionIds,
      translations: ['en', 'ar'].map(content),
    },
  });
  projectIds.push(project.id);
  assert.equal(project.clientVisibility, 'PRIVATE');
  await api(`/projects/${slug}`, { status: 404 });
  await api(`/cms/projects/${project.id}`, {
    method: 'PUT',
    body: { ...body(project), published: true },
    status: 400,
  });
  project = await api(`/cms/projects/${project.id}`, {
    method: 'PUT',
    body: { ...body(project), verified: true, published: true },
  });
  let dto = await api(`/projects/${slug}`);
  assert.equal(dto.clientLabel, null);
  assert.equal(dto.testimonialAttribution, null);
  assert.ok(!JSON.stringify(dto).includes(secret));
  assert.ok(!JSON.stringify(dto).includes(author));
  await api(`/cms/projects/${project.id}/preview`, { auth: null, status: 401 });
  const preview = await api(`/cms/projects/${project.id}/preview?locale=ar`);
  assert.ok(!JSON.stringify(preview).includes(secret));
  await api('/cms/projects', {
    method: 'POST',
    body: { ...body(project), version: 0 },
    status: 409,
  });
  await api(`/cms/projects/${project.id}`, {
    method: 'PUT',
    body: { ...body(project), version: 0 },
    status: 409,
  });
  await api(`/cms/projects/${project.id}`, {
    method: 'PUT',
    body: { ...body(project), serviceIds: [randomUUID()] },
    status: 400,
  });
  assert.deepEqual((await api(`/cms/projects/${project.id}`)).serviceIds, serviceIds);
  pass(
    'Private defaults, role enforcement, reviewed publication, safe preview, duplicate/stale conflicts and atomic relationship validation',
  );
  for (const key of ['industry', 'service', 'solution']) {
    const filter =
      key === 'industry' ? industry.slug : key === 'service' ? service.slug : solution.slug;
    assert.equal((await api(`/projects?${key}=${filter}`)).total, 1);
    assert.equal((await api(`/projects?${key}=does-not-exist`)).total, 0);
  }
  assert.equal(
    (
      await api(
        `/projects?industry=${industry.slug}&service=${service.slug}&solution=${solution.slug}`,
      )
    ).total,
    1,
  );
  assert.ok((await api(`/cms/industries/${industry.id}`)).projectIds.includes(project.id));
  assert.ok((await api(`/cms/solutions/${solution.id}`)).projectIds.includes(project.id));
  project = await api(`/cms/projects/${project.id}`, {
    method: 'PUT',
    body: { ...body(project), clientVisibility: 'ANONYMOUS' },
  });
  dto = await api(`/projects/${slug}`);
  assert.equal(dto.clientLabel, 'Regional Hospitality Company');
  assert.equal(dto.testimonialAttribution, dto.clientLabel);
  for (const key of ['title', 'seoTitle', 'testimonial'])
    await api(`/cms/projects/${project.id}`, {
      method: 'PUT',
      body: {
        ...body(project),
        translations: project.translations.map((t) => ({ ...content(t.locale), [key]: secret })),
      },
      status: 400,
    });
  await db.projectTranslation.update({
    where: { projectId_locale: { projectId: project.id, locale: 'en' } },
    data: { seoTitle: secret },
  });
  await api(`/projects/${slug}`, { status: 404 });
  assert.equal(
    (await api(`/projects?q=Development`)).items.some((p) => p.id === project.id),
    false,
  );
  assert.equal((await api(`/industries/${industry.slug}`)).projects.length, 0);
  assert.equal((await api(`/solutions/${solution.slug}`)).projects.length, 0);
  await db.projectTranslation.update({
    where: { projectId_locale: { projectId: project.id, locale: 'en' } },
    data: { seoTitle: content('en').seoTitle },
  });
  pass(
    'Industry/service/solution filters, reciprocal relations and fail-closed privacy across project and related-module APIs',
  );
  const publicProject = await api('/cms/projects', {
    method: 'POST',
    status: 201,
    body: {
      ...body(project),
      slug: `${slug}-public`,
      version: 0,
      clientVisibility: 'PUBLIC',
      featured: false,
    },
  });
  projectIds.push(publicProject.id);
  assert.equal((await api(`/projects/${publicProject.slug}`)).clientLabel, secret);
  const privateProject = await api('/cms/projects', {
    method: 'POST',
    status: 201,
    body: {
      ...body(project),
      slug: `${slug}-private`,
      version: 0,
      clientVisibility: 'PRIVATE',
      featured: false,
    },
  });
  projectIds.push(privateProject.id);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies([{ name: 'tevoniq_cms_session', value: token, url: origin }]);
  const page = await context.newPage();
  await mkdir('artifacts', { recursive: true });
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 960 });
    for (const locale of ['en', 'ar']) {
      await page.goto(`${origin}/${locale}/projects/${slug}`);
      await expect(
        page.getByRole('heading', { level: 1, name: content(locale).title }),
      ).toBeVisible();
      const html = await page.content();
      assert.ok(!html.includes(secret));
      assert.ok(!html.includes(author));
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute('href'),
        `${origin}/${locale}/projects/${slug}`,
      );
      assert.equal(await page.locator('html').getAttribute('dir'), locale === 'ar' ? 'rtl' : 'ltr');
      assert.equal(await page.locator('link[hreflang="tr"]').count(), 0);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      );
      const accessibility = await new AxeBuilder({ page }).include('main').analyze();
      assert.deepEqual(
        accessibility.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
        [],
      );
      const file = `artifacts/projects-${width}-detail-${locale}.png`;
      await page.screenshot({ path: file, fullPage: true });
      report.screenshots.push(file);
    }
    await page.goto(`${origin}/en/projects?industry=${industry.slug}&featured=true`);
    await expect(page.locator('.project-card')).toHaveCount(1);
    assert.ok(!(await page.content()).includes(secret));
    await page.getByRole('combobox', { name: 'Service', exact: true }).selectOption(service.slug);
    await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
    await expect(page.locator('.project-card')).toHaveCount(1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    const file = `artifacts/projects-${width}-listing.png`;
    await page.screenshot({ path: file, fullPage: true });
    report.screenshots.push(file);
  }
  await page.goto(`${origin}/en/projects/${privateProject.slug}`);
  assert.ok(!(await page.content()).includes(secret));
  assert.equal(await page.getByText('Regional Hospitality Company', { exact: true }).count(), 0);
  await page.goto(`${origin}/en/projects/${publicProject.slug}`);
  await expect(page.getByText(secret, { exact: true })).toBeVisible();
  await page.goto(`${origin}/admin/projects`);
  await page.getByLabel('Search projects', { exact: true }).fill(slug);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: /Development connected workplace.*ANONYMOUS/ }).click();
  await expect(page.getByLabel('Client name (internal)', { exact: true })).toHaveValue(secret);
  await expect(page.getByLabel('Client visibility', { exact: true })).toHaveValue('ANONYMOUS');
  await page.getByLabel('Summary', { exact: true }).fill('Development CMS edit verification.');
  await page.getByRole('button', { name: 'Save project', exact: true }).click();
  await expect(page.getByText('Project saved.', { exact: true })).toBeVisible();
  project = await api(`/cms/projects/${project.id}`);
  assert.equal(
    project.translations.find((t) => t.locale === 'en').summary,
    'Development CMS edit verification.',
  );
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await expect(page.getByLabel('Client visibility', { exact: true })).toHaveValue('PRIVATE');
  await expect(page.getByLabel('Publish project', { exact: true })).not.toBeChecked();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const adminShot = 'artifacts/projects-375-admin.png';
  await page.screenshot({ path: adminShot, fullPage: true });
  report.screenshots.push(adminShot);
  assert.equal((await fetch(`${origin}/projects`, { redirect: 'manual' })).status, 307);
  assert.equal((await fetch(`${origin}/en/projects/does-not-exist`)).status, 404);
  pass(
    'Desktop/mobile case-study layouts, gallery, localized SEO, Arabic, accessibility, filter forms, all visibility modes and CMS edits',
  );
  const audit = await api(`/cms/projects/${project.id}/audit`);
  assert.ok(audit.items.some((a) => a.action.startsWith('project.clientVisibility.')));
  project = await api(`/cms/projects/${project.id}`, {
    method: 'PUT',
    body: { ...body(project), published: false },
  });
  await api(`/projects/${slug}`, { status: 404 });
  await api(`/cms/projects/${project.id}`, {
    method: 'DELETE',
    body: { version: project.version },
  });
  assert.equal(await db.projectService.count({ where: { projectId: project.id } }), 0);
  assert.equal(await db.industry.count({ where: { id: industry.id } }), 1);
  assert.equal(await db.service.count({ where: { id: service.id } }), 1);
  assert.equal(await db.solution.count({ where: { id: solution.id } }), 1);
  pass(
    'Audited visibility changes, immediate unpublication, and deletion that preserves related records',
  );
} catch (error) {
  report.error = String(error.stack ?? error);
  throw error;
} finally {
  await browser?.close();
  await db.project.deleteMany({ where: { id: { in: projectIds } } });
  await db.industry.deleteMany({ where: { id: { in: industryIds } } });
  await db.solution.deleteMany({ where: { id: { in: solutionIds } } });
  await db.service.deleteMany({ where: { id: { in: serviceIds } } });
  await db.cmsUser.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect();
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/projects-verification.json', JSON.stringify(report, null, 2));
}
