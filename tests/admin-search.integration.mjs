// Optional isolated integration test. Uses embedded PostgreSQL only; never loads .env.
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { AdminController } from '../apps/api/dist/admin/admin.controller.js';
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
  const actor = randomUUID();
  await db.cmsUser.create({
    data: {
      id: actor,
      email: 'audit@example.test',
      passwordHash: 'test-only',
      role: 'SUPER_ADMIN',
    },
  });
  await db.adminRecord.createMany({
    data: Array.from({ length: 45 }, (_, i) => ({
      title: `Audit record ${String(i).padStart(2, '0')}`,
      module: 'pages',
      status: 'draft',
      createdById: actor,
      updatedById: actor,
      data: { body: 'not returned'.repeat(500) },
    })),
  });
  for (let i = 0; i < 5; i++)
    await db.service.create({
      data: {
        slug: `audit-service-${i}`,
        deletedAt: i > 1 ? new Date() : null,
        active: true,
        createdById: actor,
        translations: { create: { locale: 'ar', title: `Audit service ${i}`, published: true } },
      },
    });
  await db.cmsPage.create({
    data: {
      path: '/audit-custom',
      draft: { translations: { en: { title: 'Special landing' } } },
      createdById: actor,
      updatedById: actor,
    },
  });
  const controller = new AdminController(db),
    req = { cmsUser: { role: 'SUPER_ADMIN', id: actor } };
  const page = await controller.search(
    { q: 'Audit record', limit: '10', page: '2', sort: 'title', direction: 'asc' },
    req,
  );
  assert.equal(page.total, 45);
  assert.equal(page.items.length, 10);
  assert.equal(page.items[0].title, 'Audit record 10');
  assert.ok(!JSON.stringify(page).includes('not returned'));
  assert.equal(
    (await controller.search({ q: 'Audit record', limit: '10', page: '100' }, req)).total,
    45,
  );
  assert.equal((await controller.search({ q: '\'; DROP TABLE "AdminRecord";--' }, req)).total, 0);
  assert.equal((await controller.search({ q: '/audit-custom' }, req)).total, 1);
  assert.equal((await controller.trash({ limit: '2' }, req)).total, 3);
  assert.equal((await controller.trash({ limit: '2', page: '2' }, req)).items.length, 1);
  console.log(
    'PASS isolated PostgreSQL: exact cross-table pagination, path search, parameter binding and summary-only responses.',
  );
} finally {
  if (db) await db.$disconnect();
  await server.stop();
  await embedded.close();
}
