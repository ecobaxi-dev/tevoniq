import { test } from 'node:test';
import assert from 'node:assert/strict';
import { organizationSettingsSchema, seoFieldsSchema } from '../packages/validation/dist/index.js';
import {
  buildSeoMetadata,
  organizationData,
  routeLanguages,
  indexableRoute,
  jsonLd,
  faqData,
  jobPostingData,
} from '../apps/web/src/lib/seo-core.ts';
const site = 'https://tevoniq.example';
const settings = organizationSettingsSchema.parse({});
const route = (seo = {}) => ({
  route: '/services/cloud',
  locale: 'en',
  title: 'Cloud',
  canonical: '',
  updatedAt: null,
  seo: seoFieldsSchema.parse(seo),
  translations: ['en', 'tr', 'ar'].map((locale) => ({
    locale,
    canonical: '',
    seo: seoFieldsSchema.parse({}),
  })),
});
test('CMS overrides metadata and social fields while retaining article-specific images', () => {
  const result = buildSeoMetadata(
    site,
    'en',
    '/services/cloud',
    { title: 'Old', openGraph: { images: ['https://tevoniq.example/article.png'] } },
    { ...settings, defaultOgImage: 'https://tevoniq.example/default.png' },
    route({
      seoTitle: 'New',
      description: 'Description',
      ogTitle: 'Social',
      twitterTitle: 'Tweet',
      robots: 'index,nofollow',
    }),
  );
  assert.equal(result.title, 'New');
  assert.equal(result.description, 'Description');
  assert.equal(result.openGraph.title, 'Social');
  assert.equal(result.twitter.title, 'Tweet');
  assert.equal(result.robots.follow, false);
  assert.deepEqual(result.openGraph.images, ['https://tevoniq.example/article.png']);
  assert.equal(result.alternates.languages.ar, site + '/ar/services/cloud');
});
test('noindex and external canonicals are excluded from indexing and hreflang', () => {
  const item = route({ robots: 'noindex,follow' });
  assert.equal(indexableRoute(item, site), false);
  item.translations[1].seo.robots = 'noindex,follow';
  item.translations[2].canonical = 'https://other.example/cloud';
  assert.deepEqual(Object.keys(routeLanguages(item, site)), ['en', 'x-default']);
  const result = buildSeoMetadata(site, 'en', item.route, {}, settings, item);
  assert.equal(result.robots.index, false);
  assert.deepEqual(result.alternates.languages, {});
  assert.equal(indexableRoute(route({ canonical: 'https://other.example/cloud' }), site), false);
});
test('Organization contains only verified supplied identity fields', () => {
  assert.equal(organizationData(settings, site), null);
  const org = organizationData(
    { ...settings, companyName: 'Real company', email: 'hello@example.com' },
    site,
  );
  assert.equal(org.name, 'Real company');
  assert.equal(org.email, 'hello@example.com');
  for (const key of ['legalName', 'telephone', 'address', 'logo', 'sameAs'])
    assert.equal(key in org, false);
});
test('structured data cannot break out of a script; empty FAQs are omitted', () => {
  assert.equal(jsonLd({ text: '</script><script>alert(1)</script>' }).includes('<'), false);
  assert.equal(faqData([{ question: '', answer: ' ' }]), null);
  assert.equal(faqData([{ question: 'Question', answer: 'Answer' }]).mainEntity.length, 1);
});
test('jobs omit unknown employers and expired postings and map employment enums', () => {
  const job = {
    slug: 'engineer',
    title: 'Engineer',
    publishedAt: '2026-01-01T00:00:00Z',
    closingDate: '2026-12-31T00:00:00Z',
    description: 'Build',
    responsibilities: [],
    requirements: [],
    preferredQualifications: [],
    employmentType: 'CONTRACT',
    workMode: 'HYBRID',
    location: 'Istanbul',
  };
  const now = Date.parse('2026-09-16');
  assert.equal(jobPostingData(job, settings, site, 'en', now), null);
  const org = { ...settings, companyName: 'Verified' };
  assert.equal(jobPostingData(job, org, site, 'en', now).employmentType, 'CONTRACTOR');
  assert.equal(jobPostingData(job, org, site, 'en', Date.parse('2027-01-01')), null);
});

test('Demo vacancies stay out of the sitemap and alternate clusters even without a CMS override', () => {
  const demo = { ...route(), route: '/careers/demo-software-engineer' };
  assert.equal(indexableRoute(demo, site), false);
  assert.deepEqual(routeLanguages(demo, site), {});
});
test('Resource alternates use the canonical route of each language and honor noindex', () => {
  const resource = { ...route(), route: '/insights/resources/checklist' };
  resource.translations = ['ar', 'en', 'tr'].map((locale) => ({
    locale,
    route: `/insights/${locale === 'tr' ? 'blog' : 'resources'}/checklist`,
    canonical: '',
    seo: seoFieldsSchema.parse({}),
  }));
  assert.deepEqual(routeLanguages(resource, site, 'ar'), {
    ar: `${site}/ar/insights/resources/checklist`,
    en: `${site}/en/insights/resources/checklist`,
    tr: `${site}/tr/insights/blog/checklist`,
    'x-default': `${site}/ar/insights/resources/checklist`,
  });
  resource.translations[0].seo.robots = 'noindex,follow';
  assert.equal(routeLanguages(resource, site, 'ar').ar, undefined);
});
test('The public resource inventory normalizes routes while preserving other content routes', async () => {
  const { publicSeoPath } = await import('../apps/api/dist/seo/seo-policy.js');
  assert.equal(
    publicSeoPath('/insights/blog/checklist', 'resource', 'ar'),
    '/insights/resources/checklist',
  );
  assert.equal(
    publicSeoPath('/insights/blog/checklist', 'resource', 'en'),
    '/insights/resources/checklist',
  );
  assert.equal(
    publicSeoPath('/insights/blog/checklist', 'resource', 'tr'),
    '/insights/blog/checklist',
  );
  assert.equal(publicSeoPath('/insights/blog/story', 'blog', 'ar'), '/insights/blog/story');
});
test('SEO API returns current resource routes with legacy Turkish translations', async () => {
  const { SeoController } = await import('../apps/api/dist/seo/seo.controller.js');
  let queryText = '';
  const controller = new SeoController(
    {
      $queryRaw: async (parts) => {
        queryText = parts.join('?');
        return [
          {
            id: 'resource-id',
            type: 'resource',
            route: '/insights/blog/checklist',
            locale: 'ar',
            title: 'Checklist',
            canonical: '',
            updatedAt: null,
            seo: {},
            total: 3n,
            translations: ['ar', 'en', 'tr'].map((locale) => ({ locale, canonical: '', seo: {} })),
          },
        ];
      },
    },
    {},
  );
  const result = await controller.routes({ path: '/insights/resources/checklist' });
  assert.equal(result.items[0].route, '/insights/resources/checklist');
  assert.deepEqual(
    result.items[0].translations.map((t) => t.route),
    ['/insights/resources/checklist', '/insights/resources/checklist', '/insights/blog/checklist'],
  );
  assert.match(queryText, /NOT \(v\.type = 'job' AND v\.route LIKE '\/careers\/demo-%'\)/);
  assert.match(queryText, /data->>'path' <> v\.route/);
});
