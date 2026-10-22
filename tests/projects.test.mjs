import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  projectWriteSchema,
  projectQuerySchema,
  projectImageSchema,
  containsClientIdentity,
} from '../packages/validation/dist/index.js';
import {
  projectContent,
  projectCard,
  safeProjectReferences,
} from '../apps/api/dist/projects/project-public.js';
import {
  ProjectsController,
  CmsProjectsController,
} from '../apps/api/dist/projects/projects.controller.js';

const translation = () => ({
  locale: 'en',
  title: 'Workplace modernization',
  summary: 'A reviewed case study.',
  published: true,
  anonymousClientName: 'Regional Hospitality Company',
  heroImage: null,
  gallery: [],
  challenge: 'Fragmented systems.',
  approach: 'Review workflows.',
  solution: 'Connected systems.',
  implementation: 'Phased delivery.',
  technologies: ['Networking'],
  results: [{ value: '3', label: 'Reviewed phases' }],
  testimonial: 'Delivery met the brief.',
  testimonialAuthor: 'Confidential Person',
  seoTitle: 'Workplace case study',
  seoDescription: 'A reviewed case study.',
});
const draft = () => ({
  slug: 'workplace-modernization',
  clientName: 'Secret Client Holdings',
  published: false,
  version: 0,
  translations: [{ ...translation(), published: false }],
});
const row = (visibility = 'PRIVATE') => ({
  id: randomUUID(),
  slug: 'workplace-modernization',
  clientName: 'Secret Client Holdings',
  clientVisibility: visibility,
  published: true,
  verified: true,
  featured: false,
  country: 'Türkiye',
  city: 'Istanbul',
  projectDate: new Date('2026-01-15'),
  translations: [translation()],
});

test('Project identity and publication default to private and unreviewed', () => {
  const value = projectWriteSchema.parse(draft());
  assert.equal(value.clientVisibility, 'PRIVATE');
  assert.equal(value.verified, false);
  assert.equal(value.featured, false);
  assert.equal(projectWriteSchema.safeParse({ ...draft(), published: true }).success, false);
});
test('Private and anonymous public DTOs contain no internal identity or personal attribution', () => {
  for (const visibility of ['PRIVATE', 'ANONYMOUS']) {
    const p = projectContent(row(visibility), 'en');
    assert.ok(p);
    assert.equal('clientName' in p, false);
    assert.equal('testimonialAuthor' in p, false);
    assert.ok(!JSON.stringify(p).includes('Secret Client Holdings'));
    assert.ok(!JSON.stringify(p).includes('Confidential Person'));
    assert.equal(p.clientLabel, visibility === 'PRIVATE' ? null : 'Regional Hospitality Company');
    assert.equal(p.testimonialAttribution, p.clientLabel);
  }
  assert.equal(projectContent(row('PUBLIC'), 'en').clientLabel, 'Secret Client Holdings');
  assert.equal(projectContent(row('PUBLIC'), 'en').testimonialAttribution, 'Confidential Person');
});
test('Published anonymous projects require a localized descriptor and public clients require a name', () => {
  const value = {
    ...draft(),
    published: true,
    verified: true,
    clientVisibility: 'ANONYMOUS',
    translations: [translation()],
  };
  assert.equal(projectWriteSchema.safeParse(value).success, true);
  assert.equal(
    projectWriteSchema.safeParse({
      ...value,
      translations: [{ ...translation(), anonymousClientName: '' }],
    }).success,
    false,
  );
  assert.equal(
    projectWriteSchema.safeParse({ ...value, clientVisibility: 'PUBLIC', clientName: '' }).success,
    false,
  );
});
test('Confidential names cannot leak via title, slug, SEO, captions, images or narrative', () => {
  const base = {
    ...draft(),
    published: true,
    verified: true,
    clientVisibility: 'ANONYMOUS',
    translations: [translation()],
  };
  for (const key of [
    'title',
    'summary',
    'challenge',
    'approach',
    'solution',
    'implementation',
    'seoTitle',
    'seoDescription',
    'testimonial',
    'anonymousClientName',
  ]) {
    assert.equal(
      projectWriteSchema.safeParse({
        ...base,
        translations: [{ ...translation(), [key]: 'SECRET CLIENT HOLDINGS' }],
      }).success,
      false,
      key,
    );
  }
  assert.equal(
    projectWriteSchema.safeParse({ ...base, slug: 'secret-client-holdings-rollout' }).success,
    false,
  );
  assert.equal(
    projectWriteSchema.safeParse({
      ...base,
      translations: [
        {
          ...translation(),
          heroImage: {
            url: 'https://images.example/Secret%20Client%20Holdings.jpg',
            alt: 'Workplace',
            caption: '',
          },
        },
      ],
    }).success,
    false,
  );
  assert.equal(
    projectWriteSchema.safeParse({
      ...base,
      translations: [
        {
          ...translation(),
          gallery: [{ url: '/media/example.jpg', alt: 'SECRET-CLIENT-HOLDINGS', caption: '' }],
        },
      ],
    }).success,
    false,
  );
  assert.equal(containsClientIdentity('Secret—Client_Holdings', 'Secret Client Holdings'), true);
});
test('Legacy and direct database edits fail closed in cards and related-project references', () => {
  const bad = row();
  bad.translations[0].seoTitle = 'Secret Client Holdings';
  assert.equal(projectContent(bad, 'en'), null);
  assert.equal(projectCard(bad, 'en'), null);
  assert.deepEqual(safeProjectReferences([bad], 'en'), []);
  const unpublished = row();
  unpublished.published = false;
  assert.equal(projectContent(unpublished, 'en'), null);
  assert.equal(projectContent(row(), 'ar'), null);
  assert.equal(projectContent({ ...row(), verified: false }, 'en'), null);
});
test('Dates, media, unique UUID relationships and locale membership are validated', () => {
  assert.equal(
    projectWriteSchema.safeParse({ ...draft(), projectDate: '2026-02-30' }).success,
    false,
  );
  assert.equal(
    projectWriteSchema.safeParse({ ...draft(), projectDate: '2024-02-29' }).success,
    true,
  );
  for (const url of [
    'javascript:alert(1)',
    '//outside.example/a.png',
    'data:image/svg+xml,abc',
    'http://insecure.example/a.jpg',
    'https://user:pass@example.com/a.jpg',
  ])
    assert.equal(projectImageSchema.safeParse({ url, alt: 'image', caption: '' }).success, false);
  const id = randomUUID();
  assert.equal(projectWriteSchema.safeParse({ ...draft(), industryIds: [id, id] }).success, false);
  assert.equal(
    projectWriteSchema.safeParse({ ...draft(), translations: [translation(), translation()] })
      .success,
    false,
  );
  assert.equal(projectQuerySchema.safeParse({ clientName: 'Secret' }).success, false);
  assert.equal(projectWriteSchema.safeParse({ ...draft(), slug: 'filters' }).success, false);
});
test('All three public filters combine using eligible relationship records', async () => {
  const db = {
    project: {
      findMany: async ({ where }) => {
        assert.equal(where.published, true);
        assert.equal(where.verified, true);
        assert.equal(where.industries.some.industry.slug, 'hospitality');
        assert.equal(where.industries.some.industry.published, true);
        assert.equal(where.services.some.service.slug, 'networking');
        assert.equal(where.services.some.service.active, true);
        assert.equal(where.solutions.some.solution.slug, 'smart-workplace');
        assert.equal(where.solutions.some.solution.status, 'PUBLISHED');
        return [row()];
      },
    },
  };
  const result = await new ProjectsController(db).list({
    industry: 'hospitality',
    service: 'networking',
    solution: 'smart-workplace',
  });
  assert.equal(result.total, 1);
  assert.ok(!JSON.stringify(result).includes('Secret Client Holdings'));
});
test('Invalid slugs and stale project updates fail safely', async () => {
  await assert.rejects(
    () => new ProjectsController({}).detail('INVALID_slug', {}),
    (e) => e.getStatus() === 404,
  );
  const db = {
    $transaction: async (fn) =>
      fn({ project: { findUnique: async () => null, updateMany: async () => ({ count: 0 }) } }),
  };
  await assert.rejects(
    () =>
      new CmsProjectsController(db).update(randomUUID(), draft(), {
        cmsUser: { id: randomUUID() },
      }),
    (e) => e.getStatus() === 409,
  );
});
