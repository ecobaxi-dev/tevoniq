import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
config({ path: 'apps/api/.env', quiet: true });
assert.equal(process.env.NODE_ENV, 'development');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const prefix = `homepage-test-${randomUUID()}`;
const ids = {
  industry: randomUUID(),
  project: randomUUID(),
  article: randomUUID(),
  partner: randomUUID(),
};
async function page() {
  const r = await fetch('http://localhost:3000/en', { headers: { 'cache-control': 'no-cache' } });
  assert.equal(r.status, 200);
  return r.text();
}
try {
  await db.industry.create({
    data: {
      id: ids.industry,
      slug: prefix,
      status: 'PUBLISHED',
      published: true,
      active: true,
      sortOrder: -100,
      translations: {
        create: {
          locale: 'en',
          name: `${prefix} industry`,
          shortDescription: 'Integration fixture only',
          published: true,
        },
      },
    },
  });
  await db.project.create({
    data: {
      id: ids.project,
      slug: prefix,
      published: true,
      verified: true,
      featured: true,
      sortOrder: -100,
      translations: {
        create: {
          locale: 'en',
          title: `${prefix} project`,
          summary: 'Integration fixture only',
            challenge: 'Integration challenge',
            solution: 'Integration solution',
            seoTitle: 'Integration project',
            seoDescription: 'Integration fixture only',
          published: true,
        },
      },
    },
  });
  await db.insightArticle.create({
    data: {
      id: ids.article,
      title: `${prefix} article`,
      slug: prefix,
      content: [],
      language: 'en',
      status: 'published',
      publicationDate: new Date(),
    },
  });
  await db.adminRecord.create({
    data: {
      id: ids.partner,
      module: 'partners',
      title: `${prefix} partner`,
      language: 'en',
      status: 'published',
      data: { verified: 'true', description: 'Integration fixture only' },
      createdById: 'integration-test',
      updatedById: 'integration-test',
    },
  });
  let html = await page();
  for (const kind of ['industry', 'project', 'article', 'partner'])
    assert.ok(html.includes(`${prefix} ${kind}`), `${kind} missing from homepage`);
  await Promise.all([
    db.industry.update({ where: { id: ids.industry }, data: { published: false } }),
    db.project.update({ where: { id: ids.project }, data: { featured: false } }),
    db.insightArticle.update({ where: { id: ids.article }, data: { status: 'draft' } }),
    db.adminRecord.update({
      where: { id: ids.partner },
      data: { data: { verified: 'false', description: 'Integration fixture only' } },
    }),
  ]);
  html = await page();
  for (const kind of ['industry', 'project', 'article', 'partner'])
    assert.ok(!html.includes(`${prefix} ${kind}`), `${kind} still public`);
  console.log(
    'Homepage live CMS: published industry, featured verified project, current article and verified partner render; draft/unfeatured/unverified records disappear.',
  );
} finally {
  await Promise.all([
    db.industry.deleteMany({ where: { id: ids.industry } }),
    db.project.deleteMany({ where: { id: ids.project } }),
    db.insightArticle.deleteMany({ where: { id: ids.article } }),
    db.adminRecord.deleteMany({ where: { id: ids.partner } }),
  ]);
  await db.$disconnect();
}
