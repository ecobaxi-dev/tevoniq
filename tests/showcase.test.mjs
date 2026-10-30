import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPlaceholderPartner,
  isIllustrativeProject,
  industryProfiles,
  industryProfile,
  projectExamples,
} from '../apps/web/src/content/showcase.ts';
import { selectHomeCollections } from '../apps/web/src/content/home-records.ts';
import { articlePath, articleUrl } from '../apps/web/src/lib/insight-format.ts';
import { findWebsiteDesign } from '../apps/web/src/content/website-designs.ts';
import { findWorkSystem } from '../apps/web/src/content/work-systems.ts';
import { isRetiredPublicPath } from '../packages/types/dist/index.js';
test('placeholder partners never become public relationships even with an old verified flag', () => {
  const base = {
    id: 'example',
    title: 'Verified relationship record',
    description: 'Owner-provided relationship',
    href: '/company/partners',
    published: true,
    verified: true,
  };
  for (const title of [
    'شريك توضيحي: أنظمة',
    'Illustrative partner: example',
    'Demo partner',
    'Örnek ortak',
  ])
    assert.equal(isPlaceholderPartner(title), true);
  assert.equal(isPlaceholderPartner(base.title), false);
  const result = selectHomeCollections({
    industries: [],
    projects: [],
    insights: [],
    partners: [
      { ...base, title: 'شريك توضيحي: مثال' },
      { ...base, title: 'Illustrative partner: example' },
      base,
    ],
  });
  assert.deepEqual(result.partners, [base]);
});
test('resource links have a working dedicated path while existing CMS case study and Turkish paths remain compatible', () => {
  for (const language of ['ar', 'en']) {
    assert.equal(
      articlePath({ language, slug: 'checklist', kind: 'resource' }),
      `/${language}/insights/resources/checklist`,
    );
    assert.equal(
      articlePath({ language, slug: 'study', kind: 'case-study' }),
      `/${language}/insights/blog/study`,
    );
    assert.equal(
      articleUrl({ language, slug: 'checklist', kind: 'resource' }, 'https://tevoniq.example'),
      `https://tevoniq.example/${language}/insights/resources/checklist`,
    );
  }
  assert.equal(
    articlePath({ language: 'tr', slug: 'checklist', kind: 'resource' }),
    '/tr/insights/blog/checklist',
  );
  assert.equal(articlePath({ language: 'en', slug: 'plain' }), '/en/insights/blog/plain');
});
test('industry and project starting points resolve existing demos and never revive retired services', () => {
  for (const path of [
    ...Object.values(industryProfiles).map((p) => p.demo),
    ...Object.values(projectExamples),
  ]) {
    assert.equal(isRetiredPublicPath(path), false);
    const [, collection, slug] = path.split('/');
    if (collection === 'website-designs') assert.ok(findWebsiteDesign(slug));
    if (collection === 'work-systems' && slug) assert.ok(findWorkSystem(slug));
  }
  assert.ok(industryProfile('unmapped-sector').ar.scope);
  assert.equal(isIllustrativeProject('demo-retail'), true);
  assert.equal(isIllustrativeProject('retail-project'), false);
  const item = {
    id: 'resource',
    title: 'Checklist',
    description: 'Published resource',
    href: '/insights/resources/checklist',
    published: true,
    publishedAt: '2020-01-01',
    kind: 'resource',
    image: '/brand/logo.png',
  };
  const result = selectHomeCollections({
    industries: [],
    projects: [],
    partners: [],
    insights: [
      item,
      { ...item, id: 'future', publishedAt: '2999-01-01' },
      { ...item, id: 'draft', published: false },
    ],
  });
  assert.deepEqual(result.insights, [item]);
});
