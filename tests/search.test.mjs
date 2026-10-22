import 'reflect-metadata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { PostgresSearchProvider } from '../apps/api/dist/search/search.provider.js';
import { SearchController } from '../apps/api/dist/search/search.controller.js';
import { publicEndpoints } from '../apps/api/dist/cms/permissions.js';
import { searchExcerpt } from '../apps/api/dist/search/search-excerpt.js';

test('long excerpts include the matching term and treat query syntax as text', () => {
  const excerpt = searchExcerpt(
    'Intro '.repeat(70) + 'Cloud platform ' + 'detail '.repeat(80),
    'cloud',
  );
  assert.match(excerpt, /Cloud platform/);
  assert.ok(excerpt.length <= 242);
  assert.equal(searchExcerpt('A short excerpt', '[.*]'), 'A short excerpt');
});

test('search validates input and delegates through the provider contract', async () => {
  const calls = [];
  const controller = new SearchController({
    search: async (q) => {
      calls.push(q);
      return { query: q.q, groups: [] };
    },
  });
  await controller.search({ q: '  cloud  ', locale: 'tr' });
  assert.deepEqual(calls[0], { q: 'cloud', locale: 'tr', limit: 8 });
  for (const raw of [{ q: 'x'.repeat(201) }, { locale: 'de' }, { limit: 51 }, { q: ['x'] }])
    assert.throws(() => controller.search(raw));
  assert.ok(publicEndpoints.SearchController.includes('search'));
});

test('PostgreSQL migration, all result types, locale isolation and immediate unpublishing', async () => {
  const pg = new PGlite();
  try {
    const root = new URL('../apps/api/prisma/migrations/', import.meta.url);
    for (const directory of (await readdir(root, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name)))
      await pg.exec(await readFile(new URL(directory.name + '/migration.sql', root), 'utf8'));
    for (const [model, type, title, summary] of [
      ['Service', 'service', 'title', 'summary'],
      ['Solution', 'solution', 'name', 'shortDescription'],
      ['Industry', 'industry', 'name', 'shortDescription'],
    ]) {
      const state = model === 'Service' ? '' : ', published, status';
      const values = model === 'Service' ? '' : ", true, 'PUBLISHED'";
      await pg.exec(`INSERT INTO "${model}" (id, slug, active, "updatedAt"${state}) VALUES ('${type}', '${type}', true, now()${values});
        INSERT INTO "${model}Translation" (id, "${type}Id", locale, "${title}", "${summary}", published${model === 'Service' ? '' : ', "updatedAt"'})
        VALUES ('${type}', '${type}', 'en', 'Cloud platform', 'Connected cloud services', true${model === 'Service' ? '' : ', now()'});`);
    }
    await pg.exec(`INSERT INTO "Project" (id,slug,published,verified,"updatedAt") VALUES ('project','cloud',true,true,now());
      INSERT INTO "ProjectTranslation" (id,"projectId",locale,title,summary,published,"updatedAt") VALUES ('pt','project','en','Cloud project','Cloud delivery',true,now());
      INSERT INTO "InsightArticle" (id,title,slug,content,kind,status,language,"publicationDate","updatedAt")
      VALUES ('blog','Cloud blog','cloud-blog','[]','blog','published','en',now(),now()),
      ('resource','Cloud guide','cloud-guide','[]','resource','scheduled','en',now(),now()),
      ('future','Cloud future','future','[]','blog','scheduled','en',now() + interval '1 day',now()),
      ('draft','Cloud draft','draft','[]','blog','draft','en',now(),now());
      INSERT INTO "CmsPage" (id,path,draft,published,"publishedAt","createdById","updatedById","updatedAt")
      VALUES ('page','/cloud','{"translations":{"en":{"title":"Secret draft"}}}',
      '{"translations":{"en":{"title":"Cloud page","seoDescription":"Cloud expertise"}}}',now(),'test','test',now());`);
    const result = await pg.query(
      "SELECT type,title,url FROM public_search_documents WHERE locale = 'en' AND vector @@ plainto_tsquery('simple', $1)",
      ['cloud'],
    );
    assert.deepEqual([...new Set(result.rows.map((r) => r.type))].sort(), [
      'blog',
      'industry',
      'page',
      'project',
      'resource',
      'service',
      'solution',
    ]);
    assert.equal(
      result.rows.some((r) => /draft|future/.test(r.title)),
      false,
    );
    assert.equal(
      (
        await pg.query(
          "SELECT * FROM public_search_documents WHERE locale='ar' AND vector @@ plainto_tsquery('simple','cloud')",
        )
      ).rows.length,
      0,
    );
    await pg.exec('UPDATE "Service" SET active=false; UPDATE "CmsPage" SET "deletedAt"=now();');
    assert.equal(
      (await pg.query("SELECT * FROM public_search_documents WHERE id IN ('service','page')"))
        .rows.length,
      0,
    );
    const provider = new PostgresSearchProvider({
      $queryRaw: async (strings, ...values) =>
        (
          await pg.query(
            strings.reduce((sql, part, i) => sql + (i ? '$' + i : '') + part, ''),
            values,
          )
        ).rows,
      project: { findMany: async () => [] },
    });
    const response = await provider.search({ q: 'cloud', locale: 'en', limit: 1 });
    assert.equal(
      response.groups.some((g) => g.type === 'project'),
      false,
      'invalid project projections fail closed',
    );
    assert.ok(response.groups.every((g) => g.items.length <= 1));
    assert.deepEqual(await provider.search({ q: '', locale: 'en', limit: 1 }), {
      query: '',
      groups: [],
    });
  } finally {
    await pg.close();
  }
});
