import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectHomeCollections } from '../apps/web/src/content/home-records.ts';
test('homepage publication boundary excludes drafts, unverified partners, nonfeatured projects and unsafe links', () => {
  const valid = {
    id: 'fixture',
    title: 'Development fixture',
    description: 'Test only',
    href: '/projects',
    published: true,
  };
  const result = selectHomeCollections({
    industries: [
      valid,
      { ...valid, id: 'draft', published: false },
      { ...valid, href: '//external.example' },
    ],
    projects: [
      valid,
      { ...valid, id: 'featured', featured: true },
      { ...valid, featured: true, published: false },
    ],
    partners: [valid, { ...valid, id: 'verified', verified: true }],
    insights: [
      { ...valid, id: 'old', publishedAt: '2020-01-01' },
      { ...valid, id: 'new', publishedAt: '2021-01-01' },
      { ...valid, publishedAt: '2099-01-01' },
      { ...valid, publishedAt: 'invalid' },
    ],
  });
  assert.deepEqual(
    result.industries.map((item) => item.id),
    ['fixture'],
  );
  assert.deepEqual(
    result.projects.map((item) => item.id),
    ['featured'],
  );
  assert.deepEqual(
    result.partners.map((item) => item.id),
    ['verified'],
  );
  assert.deepEqual(
    result.insights.map((item) => item.id),
    ['new', 'old'],
  );
});
