import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  companySlugs,
  companyContentSchema,
  defaultCompanyContent,
} from '../packages/validation/dist/index.js';
import {
  CompanyController,
  CmsCompanyController,
} from '../apps/api/dist/company/company.controller.js';

test('Company defaults contain requested sections without dates or coverage', () => {
  for (const slug of companySlugs) {
    const content = companyContentSchema.parse(defaultCompanyContent(slug));
    assert.equal(content.foundingYear, null);
    assert.equal(content.geographicCoverage, '');
    assert.doesNotMatch(JSON.stringify(content), /\b(19|20)\d{2}\b/);
  }
  assert.deepEqual(
    defaultCompanyContent('about').sections.map((s) => s.title),
    [
      'Who We Are',
      'Our Vision',
      'Our Mission',
      'Our Values',
      'What We Do',
      'Technology Philosophy',
      'Global Perspective',
    ],
  );
  assert.deepEqual(
    defaultCompanyContent('why-tevoniq').sections.map((s) => s.title),
    [
      'Engineering Excellence',
      'Innovation',
      'Security',
      'Reliability',
      'Scalability',
      'Business Understanding',
      'Long-Term Partnership',
    ],
  );
});
test('CTA rejects executable and external URLs', () => {
  for (const href of [
    'javascript:alert(1)',
    '//example.com',
    '/\\example.com',
    'https://example.com',
  ]) {
    const content = defaultCompanyContent('about');
    content.cta.href = href;
    assert.equal(companyContentSchema.safeParse(content).success, false);
  }
});
test('Public Company pages respect publication and language boundaries', async () => {
  let row = null;
  const controller = new CompanyController({ companyPage: { findUnique: async () => row } });
  assert.equal((await controller.get('about', {})).title, 'About TEVONIQ');
  await assert.rejects(controller.get('about', { locale: 'ar' }), { status: 404 });
  row = { published: false, content: defaultCompanyContent('about') };
  await assert.rejects(controller.get('about', {}), { status: 404 });
  row.published = true;
  row.content.title = 'CMS edited title';
  assert.equal((await controller.get('about', {})).title, 'CMS edited title');
});
test('Conflicting Company edits cannot overwrite a newer revision', async () => {
  let audited = false;
  const controller = new CmsCompanyController({
    $transaction: (fn) =>
      fn({
        companyPage: { updateMany: async () => ({ count: 0 }) },
        cmsAudit: {
          create: async () => {
            audited = true;
          },
        },
      }),
  });
  await assert.rejects(
    controller.save(
      'about',
      {},
      { content: defaultCompanyContent('about'), published: true, version: 1 },
      { cmsUser: { id: 'test' } },
    ),
    { status: 409 },
  );
  assert.equal(audited, false);
});
