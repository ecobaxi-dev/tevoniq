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
const id = randomUUID(),
  label = `Navigation integration ${id}`;
try {
  await db.adminRecord.create({
    data: {
      id,
      module: 'navigation',
      title: label,
      language: 'en',
      status: 'draft',
      data: { href: '/company/about', group: 'company', order: '0' },
      createdById: 'integration-test',
      updatedById: 'integration-test',
    },
  });
  const get = async () => (await fetch('http://localhost:4000/api/v1/navigation/en')).json();
  assert.ok(!(await get()).items.some((row) => row.id === id));
  await db.adminRecord.update({ where: { id }, data: { status: 'published' } });
  assert.ok((await get()).items.some((row) => row.id === id));
  const page = await fetch('http://localhost:3000/en/contact', {
    headers: { 'cache-control': 'no-cache' },
  }).then((r) => r.text());
  assert.ok(page.includes(label), 'Published navigation override missing from rendered page');
  const arabic = await fetch('http://localhost:4000/api/v1/navigation/ar').then((r) => r.json());
  assert.ok(!arabic.items.some((row) => row.id === id));
  await db.adminRecord.update({ where: { id }, data: { deletedAt: new Date() } });
  assert.ok(!(await get()).items.some((row) => row.id === id));
  console.log(
    'Navigation CMS verified: drafts hidden, published labels rendered, locale isolated and archived overrides hidden.',
  );
} finally {
  await db.adminRecord.deleteMany({ where: { id } });
  await db.$disconnect();
}
