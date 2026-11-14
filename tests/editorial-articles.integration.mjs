// Isolated embedded PostgreSQL; never reads .env or production credentials.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { SeoController } from '../apps/api/dist/seo/seo.controller.js';
import { readdir, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import {
  publishEditorialArticles,
  publishEditorialReleases,
} from '../scripts/lib/editorial-articles.mjs';
const embedded = await PGlite.create();
const server = new PGLiteSocketServer({ db: embedded, port: 0, host: '127.0.0.1' });
let db;
try {
  const root = new URL('../apps/api/prisma/migrations/', import.meta.url);
  for (const entry of (await readdir(root, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name)))
    await embedded.exec(await readFile(new URL(`${entry.name}/migration.sql`, root), 'utf8'));
  await server.start();
  db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: `postgresql://postgres:postgres@${server.getServerConn()}/postgres`,
      max: 1,
    }),
  });
  const actorId = randomUUID();
  const category = await db.insightTaxonomy.create({
    data: {
      id: randomUUID(),
      slug: 'websites-and-experience',
      name: 'Existing category',
      language: 'ar',
      type: 'category',
    },
  });
  await db.insightArticle.create({
    data: {
      slug: 'business-website-planning',
      title: 'Owner draft',
      language: 'ar',
      status: 'draft',
      content: [],
    },
  });
  const result = await publishEditorialArticles(db, 'https://www.tevoniq.com', actorId);
  assert.equal(result.created, 4);
  assert.equal(
    (
      await db.insightArticle.findUnique({
        where: { slug_language: { slug: 'business-website-planning', language: 'ar' } },
      })
    ).status,
    'draft',
  );
  const speed = await db.insightArticle.findUnique({
    where: { slug_language: { slug: 'website-performance-core-web-vitals', language: 'ar' } },
  });
  assert.equal(speed.categoryId, category.id);
  assert.equal(speed.author, 'TEVONIQ');
  const inventory = await new SeoController(db, {}).routes({});
  assert.ok(
    inventory.items.some(
      (r) => r.route === '/insights/blog/website-performance-core-web-vitals' && r.locale === 'ar',
    ),
  );
  assert.ok(!inventory.items.some((r) => r.route === '/insights/blog/business-website-planning'));
  await db.insightArticle.update({
    where: { id: speed.id },
    data: { title: 'Owner updated title', status: 'archived' },
  });
  await db.insightArticle.deleteMany({ where: { slug: 'business-dashboard-kpi-guide' } });
  assert.equal(
    (await publishEditorialArticles(db, 'https://www.tevoniq.com', actorId)).alreadyApplied,
    true,
  );
  assert.equal(await db.insightArticle.count(), 4);
  assert.equal(
    (await db.insightArticle.findUnique({ where: { id: speed.id } })).title,
    'Owner updated title',
  );
  assert.equal(await db.cmsAudit.count({ where: { action: 'editorial.release.publish' } }), 1);
  const second = await publishEditorialArticles(
    db,
    'https://www.tevoniq.com',
    actorId,
    '2026-11-14-growth-guides',
  );
  assert.equal(second.created, 5);
  assert.equal(await db.insightTaxonomy.count(), 2);
  assert.equal(await db.insightArticle.count(), 9);
  const all = await publishEditorialReleases(db, 'https://www.tevoniq.com', actorId);
  assert.ok(all.every((r) => r.alreadyApplied && r.created === 0));
  assert.equal(
    await db.insightArticle.count({ where: { slug: 'business-dashboard-kpi-guide' } }),
    0,
  );
  await db.insightArticle.deleteMany({ where: { slug: 'contact-form-design-checklist' } });
  await publishEditorialReleases(db, 'https://www.tevoniq.com', actorId);
  assert.equal(
    await db.insightArticle.count({ where: { slug: 'contact-form-design-checklist' } }),
    0,
  );
  console.log(
    'PASS: insert-only release, existing category reuse, draft preservation, restart idempotency, owner edits and deletions retained.',
  );
} finally {
  if (db) await db.$disconnect();
  await server.stop();
  await embedded.close();
}
