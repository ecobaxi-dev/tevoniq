import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { conceptPayload, loadConcepts } from './lib/solution-concepts.mjs';

// Content-only import: no schema, styles, accounts, migrations or existing editorial records change.
const apply = process.argv.includes('--apply');
const hideFixture = process.argv.includes('--hide-development-fixture');
const allowedArgs = new Set(['--apply', '--hide-development-fixture']);
if (process.argv.slice(2).some((arg) => !allowedArgs.has(arg))) throw new Error('Unknown argument');
config({ path: resolve('apps/api/.env'), quiet: true });
const url = process.env.DATABASE_URL;
if (
  !url ||
  process.env.NODE_ENV !== 'development' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
)
  throw new Error('This import is restricted to the configured local development database');
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const actorId = 'content-import:owner-request:solutions-2026-09-25';
const fixtureSlug = 'development-case-8d1ce734-23ac-4797-b257-93ea75fa0acf-solution';
const runId = randomUUID();
try {
  const concepts = await loadConcepts();
  const existing = await db.solution.findMany({
    where: { slug: { in: concepts.map((c) => c.slug) } },
    select: { slug: true },
  });
  const existingSlugs = new Set(existing.map((row) => row.slug));
  const services = await db.service.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true },
  });
  const planned = concepts.flatMap((concept, order) =>
    existingSlugs.has(concept.slug)
      ? []
      : [
          {
            id: randomUUID(),
            value: conceptPayload(
              concept,
              order,
              concept.serviceSlugs.flatMap((slug) =>
                services.filter((s) => s.slug === slug).map((s) => s.id),
              ),
            ),
          },
        ],
  );
  const fixture = hideFixture
    ? await db.solution.findUnique({
        where: { slug: fixtureSlug },
        include: { translations: true },
      })
    : null;
  if (
    fixture &&
    !fixture.translations.every(
      (t) =>
        t.name === 'Development solution' &&
        JSON.stringify(t.blocks).includes('Development verification only'),
    )
  )
    throw new Error('Development fixture has changed; leave it untouched');
  const hide = fixture?.active || fixture?.published;
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'preview',
        create: planned.map((p) => ({
          slug: p.value.slug,
          languages: p.value.translations.map((t) => t.locale),
          sectionsPerLanguage: 9,
        })),
        preserveExisting: [...existingSlugs],
        hideFixture: hide ? fixtureSlug : null,
      },
      null,
      2,
    ),
  );
  if (!apply || (!planned.length && !hide)) process.exitCode = 0;
  else {
    await mkdir('.data/content-backups', { recursive: true });
    const backup = resolve('.data/content-backups', `solutions-${runId}.json`);
    // Snapshot is persisted before the transaction. Created IDs make this import independently reversible.
    await writeFile(
      backup,
      JSON.stringify(
        {
          runId,
          actorId,
          createdAt: new Date().toISOString(),
          created: planned.map((p) => ({ id: p.id, slug: p.value.slug })),
          fixture: hide ? fixture : null,
        },
        null,
        2,
      ),
      { flag: 'wx' },
    );
    await db.$transaction(
      async (tx) => {
        for (const { id, value } of planned) {
          const { serviceIds, translations } = value;
          const data = {
            slug: value.slug,
            status: value.status,
            active: value.active,
            published: value.published,
            featured: value.featured,
            sortOrder: value.sortOrder,
          };
          await tx.solution.create({
            data: {
              id,
              ...data,
              translations: { create: translations },
              services: {
                create: serviceIds.map((serviceId, sortOrder) => ({ serviceId, sortOrder })),
              },
            },
          });
          await tx.cmsAudit.create({
            data: { actorId, entityId: id, action: `solution.import-concept.${runId}` },
          });
        }
        if (hide) {
          const changed = await tx.solution.updateMany({
            where: { id: fixture.id, version: fixture.version },
            data: { active: false, published: false, status: 'DRAFT', version: { increment: 1 } },
          });
          if (changed.count !== 1) throw new Error('Development fixture changed during import');
          await tx.solutionTranslation.updateMany({
            where: { solutionId: fixture.id },
            data: { published: false },
          });
          await tx.cmsAudit.create({
            data: {
              actorId,
              entityId: fixture.id,
              action: `solution.hide-development-fixture.${runId}`,
            },
          });
        }
      },
      { isolationLevel: 'Serializable', timeout: 30000 },
    );
    console.log(
      `Imported ${planned.length} concepts. Existing content preserved. Backup: ${backup}`,
    );
  }
} finally {
  await db.$disconnect();
}
