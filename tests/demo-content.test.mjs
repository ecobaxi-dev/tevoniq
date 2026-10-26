import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  buildDemoContent,
  appendCompanyContent,
  solutionRelationshipSections,
  previewDemoAuthorized,
} from '../scripts/lib/demo-content.mjs';
import {
  defaultCompanyContent,
  isDemoJob,
  publicTeamProfilesSchema,
} from '../packages/validation/dist/index.js';
import { demoLabels, locales } from '../content/demo-content.mjs';
import { CompanyController } from '../apps/api/dist/company/company.controller.js';
import { CareersController } from '../apps/api/dist/careers/careers.controller.js';
import { publicEndpoints } from '../apps/api/dist/cms/permissions.js';

const content = buildDemoContent('http://localhost:3000');
test('demo catalog covers all industries and localized content without empty page sections', () => {
  assert.equal(content.industries.length, 11);
  assert.equal(content.projects.length, 4);
  assert.equal(content.articles.length, 21);
  for (const row of [...content.industries, ...content.projects]) {
    assert.deepEqual(
      row.value.translations.map((t) => t.locale),
      locales,
    );
    for (const t of row.value.translations) assert.ok(t.seoTitle && t.seoDescription);
  }
  for (const row of content.industries) {
    assert.equal(row.value.translations[0].blocks.length, 9);
  }
  for (const locale of locales)
    for (const kind of ['blog', 'resource', 'case-study'])
      assert.ok(
        content.articles.filter((r) => r.value.language === locale && r.value.kind === kind)
          .length >= 1,
      );
});

test('project titles are clean and public project/article content has no external references', () => {
  for (const row of content.projects)
    for (const t of row.value.translations) {
      const l = demoLabels[t.locale];
      assert.ok(!t.title.startsWith(l.demo));
      assert.equal(t.heroImage.caption, l.demo);
      assert.doesNotMatch(JSON.stringify(t), /n[\s-]?ix/i);
      assert.equal(t.testimonial, '');
      assert.equal(t.testimonialAuthor, '');
      assert.ok(
        t.results.every((r) => !/\d/.test(r.value)),
        'No invented numeric results',
      );
      assert.equal(row.value.clientVisibility, 'PRIVATE');
    }
  assert.equal(
    content.articles.filter((r) =>
      r.value.content.some((b) => b.type === 'link' && b.url.startsWith('https://www.n-ix.com/')),
    ).length,
    0,
  );
  for (const { value } of content.articles) {
    assert.doesNotMatch(JSON.stringify(value), /n[\s-]?ix/i);
    assert.equal(value.content.at(-1).text, demoLabels[value.language].articleNote);
  }
});

test('company additions and solution sections are idempotent and preserve editorial content', () => {
  const before = { ...defaultCompanyContent('about'), title: 'Owner title' };
  const once = appendCompanyContent('about', 'en', before);
  assert.deepEqual(once.sections.slice(0, before.sections.length), before.sections);
  assert.equal(once.title, before.title);
  assert.deepEqual(appendCompanyContent('about', 'en', once), once);
  const blocks = [{ area: 'cta', content: { id: 'owner-id', type: 'cta', title: 'Owner CTA' } }];
  const added = solutionRelationshipSections('example', 'ar', blocks);
  assert.equal(added.at(-1), blocks[0]);
  assert.deepEqual(solutionRelationshipSections('example', 'ar', added), added);
});

test('every demo article points to a real taxonomy and uses a local illustration', () => {
  const ids = new Set(content.taxonomies.map((t) => t.id));
  for (const { value } of content.articles) {
    assert.ok(ids.has(value.categoryId));
    assert.ok(value.tagIds.every((id) => ids.has(id)));
    assert.ok(value.coverImage.startsWith('http://localhost:3000/brand/generated/'));
  }
  assert.deepEqual(buildDemoContent('http://localhost:3000'), content);
});

test('demo import refuses remote and production databases before any connection', () => {
  for (const env of [
    { NODE_ENV: 'development', DATABASE_URL: 'postgresql://demo:demo@example.invalid/demo' },
    { NODE_ENV: 'production', DATABASE_URL: 'postgresql://demo:demo@127.0.0.1/demo' },
  ]) {
    const result = spawnSync(process.execPath, ['scripts/import-demo-content.mjs', '--apply'], {
      env: { ...process.env, ...env },
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /local development database/);
  }
});

test('demo career prefix and public team schema distinguish examples from active recruitment', () => {
  assert.ok(content.jobs.every((r) => isDemoJob(r.value.slug)));
  assert.equal(isDemoJob('software-engineer'), false);
  assert.ok(
    publicTeamProfilesSchema.safeParse({
      items: [{ id: content.team[0].id, title: 'Example', role: 'Engineer', bio: 'Sample role' }],
    }).success,
  );
  assert.equal(
    publicTeamProfilesSchema.safeParse({
      items: [
        {
          id: content.team[0].id,
          title: 'Example',
          role: 'Engineer',
          bio: 'Sample role',
          email: 'private@example.invalid',
        },
      ],
    }).success,
    false,
  );
});

test('team endpoint exposes published localized profile fields without CMS metadata', async () => {
  let query;
  const controller = new CompanyController({
    adminRecord: {
      findMany: async (value) => {
        query = value;
        return [
          {
            id: content.team[0].id,
            title: 'Sample role',
            data: { role: 'Engineer', bio: 'Example', internalNote: 'Private' },
          },
        ];
      },
    },
  });
  assert.ok(publicEndpoints.CompanyController.includes('team'));
  const result = await controller.team({ locale: 'ar' });
  assert.deepEqual(query.where, {
    module: 'team',
    language: 'ar',
    status: 'published',
    deletedAt: null,
  });
  assert.deepEqual(result.items[0], {
    id: content.team[0].id,
    title: 'Sample role',
    role: 'Engineer',
    bio: 'Example',
  });
});

test('demo career submissions are refused before database writes or CV processing', async () => {
  const unexpected = () => {
    throw new Error('Must not process a demo application');
  };
  const controller = new CareersController(
    { careerJob: { count: unexpected } },
    {},
    { rateLimit: unexpected },
    { validate: unexpected },
  );
  await assert.rejects(
    controller.apply(
      {
        payload: JSON.stringify({
          submissionId: '11111111-1111-4111-8111-111111111111',
          jobSlug: 'demo-software-engineer',
          name: 'Example Applicant',
          email: 'example@example.invalid',
          location: 'Example',
          consent: true,
        }),
      },
      undefined,
      {},
    ),
    /Demonstration roles do not accept applications/,
  );
});

test('hosted demo imports require the explicit Render release opt-in and HTTPS origin', () => {
  const env = {
    RENDER: 'true',
    NODE_ENV: 'production',
    PREVIEW_DEMO_CONTENT_RELEASE: '2026-10-25',
    SITE_URL: 'https://preview.example.invalid',
    DATABASE_URL: 'postgresql://demo:demo@example.invalid/demo',
  };
  assert.equal(previewDemoAuthorized(env), true);
  for (const patch of [
    { RENDER: 'false' },
    { NODE_ENV: 'development' },
    { PREVIEW_DEMO_CONTENT_RELEASE: '' },
    { SITE_URL: 'http://preview.example.invalid' },
    { SITE_URL: 'https://preview.example.invalid/path' },
    { DATABASE_URL: '' },
  ])
    assert.equal(previewDemoAuthorized({ ...env, ...patch }), false);
  const result = spawnSync(
    process.execPath,
    ['scripts/import-demo-content.mjs', '--apply-preview'],
    { env: { ...process.env, RENDER: 'false', DATABASE_URL: env.DATABASE_URL }, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /explicit release opt-in/);
});
