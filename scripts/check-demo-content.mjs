// Read-only verification of a running local demo. No forms are submitted.
import assert from 'node:assert/strict';
import {
  publicHomeSchema,
  industryListSchema,
  projectListSchema,
  solutionListSchema,
  serviceListSchema,
  articleListSchema,
  publicTeamProfilesSchema,
  publicIndustrySchema,
  publicProjectSchema,
  publicSolutionSchema,
} from '@tevoniq/validation';
const api = process.env.API_URL || 'http://127.0.0.1:4200/api/v1';
const site = process.env.SITE_URL || 'http://127.0.0.1:3100';
const locale = process.argv[2] || 'en';
assert.ok(['en', 'tr', 'ar'].includes(locale));
for (const url of [api, site])
  assert.ok(
    ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname),
    'Local preview only',
  );
const json = async (path, schema) => {
  const response = await fetch(`${api}/${path}`);
  assert.equal(response.status, 200, path);
  return schema.parse(await response.json());
};
const home = await json(`home/${locale}`, publicHomeSchema);
assert.ok(home.content);
assert.equal(home.partners.length, 3);
const team = await json(`company/team/profiles?locale=${locale}`, publicTeamProfilesSchema);
assert.equal(team.items.length, 4);
const services = await json(`services?locale=${locale}&limit=48`, serviceListSchema);
assert.ok(services.total >= 44);
const industries = await json(`industries?locale=${locale}`, industryListSchema);
const projects = await json(`projects?locale=${locale}`, projectListSchema);
const solutions = await json(`solutions?locale=${locale}`, solutionListSchema);
const articles = await json(`insights?locale=${locale}&limit=100`, articleListSchema);
assert.equal(industries.total, 11);
assert.equal(projects.total, 6);
assert.ok(solutions.total >= 6);
assert.equal(articles.items.filter((r) => r.kind === 'blog').length, 3);
assert.equal(articles.items.filter((r) => r.kind === 'resource').length, 3);
assert.equal(articles.items.filter((r) => r.kind === 'case-study').length, 6);
for (const row of industries.items) {
  const d = await json(`industries/${row.slug}?locale=${locale}`, publicIndustrySchema);
  assert.equal(d.blocks.length, 9);
  assert.ok(d.services.length && d.solutions.length && d.projects.length, row.slug);
}
for (const row of projects.items) {
  const d = await json(`projects/${row.slug}?locale=${locale}`, publicProjectSchema);
  assert.ok(d.challenge && d.approach && d.solution && d.implementation);
  assert.ok(d.services.length && d.industries.length && d.solutions.length);
  assert.ok(d.heroImage && d.gallery.length);
}
for (const row of solutions.items) {
  const d = await json(`solutions/${row.slug}?locale=${locale}`, publicSolutionSchema);
  assert.equal(d.blocks.length, 12);
  assert.ok(d.services.length && d.industries.length && d.projects.length, row.slug);
}
const paths = [
  '',
  '/services',
  '/solutions',
  '/industries',
  '/projects',
  '/company',
  '/company/about',
  '/company/why-tevoniq',
  '/company/team',
  '/company/partners',
  '/company/careers',
  '/careers',
  '/careers/demo-software-engineer',
  '/insights',
  '/insights/blog',
  '/insights/resources',
  '/insights/case-studies',
  '/industries/retail',
  '/solutions/resilient-hybrid-cloud',
  '/projects/demo-cloud-independent-iot',
  '/insights/blog/demo-ai-readiness',
  '/services/cloud-solutions',
  '/contact',
  '/request-quote',
  '/privacy-policy',
  '/cookie-policy',
  '/pesto',
  ...(locale === 'tr' ? [] : ['/advocas']),
];
for (const path of paths) {
  const response = await fetch(`${site}/${locale}${path}`);
  assert.equal(response.status, 200, `${locale}${path}`);
  const html = await response.text();
  assert.match(html, /<main/);
  const visible = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  assert.ok(
    !/temporarily unavailable|geçici olarak kullanılamıyor|غير متاح مؤقت/.test(visible),
    `${locale}${path} rendered an unavailable message`,
  );
  if (path === '') {
    for (const id of ['industries', 'projects', 'partners', 'insights'])
      assert.ok(html.includes(`id="${id}"`), `Missing homepage collection: ${id}`);
    assert.ok(html.includes(`/${locale}/insights/blog/demo-`));
  }
  if (path === '/careers/demo-software-engineer') {
    assert.doesNotMatch(html, /JobPosting/);
    assert.doesNotMatch(html, /id="apply"/);
  }
}
console.log(
  JSON.stringify({
    locale,
    publicRoutes: paths.length,
    industries: industries.total,
    projects: projects.total,
    articles: articles.total,
    partners: home.partners.length,
    team: team.items.length,
    allChecksPassed: true,
  }),
);
