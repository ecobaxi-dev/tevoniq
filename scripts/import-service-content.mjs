import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import {
  isUntouchedService,
  loadServiceContent,
  serviceContentPayload,
} from './lib/service-content.mjs';

const apply = process.argv.includes('--apply');
const hideFixture = process.argv.includes('--hide-development-fixture');
if (process.argv.slice(2).some((arg) => !['--apply', '--hide-development-fixture'].includes(arg)))
  throw new Error('Unknown argument');
config({ path: resolve('apps/api/.env'), quiet: true });
const url = process.env.DATABASE_URL;
if (
  !url ||
  process.env.NODE_ENV !== 'development' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
)
  throw new Error('This import is restricted to the local development database');
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const runId = randomUUID(),
  actorId = 'content-import:owner-request:services-2026-09-25';
const fixtureSlug = 'development-case-8d1ce734-23ac-4797-b257-93ea75fa0acf-service';
try {
  const content = await loadServiceContent();
  const rows = await db.service.findMany({
    where: { slug: { in: content.map((c) => c.slug) } },
    include: { translations: true },
  });
  const preserved = [];
  const planned = content.flatMap((entry, order) => {
    const before = rows.find((r) => r.slug === entry.slug);
    if (before && !isUntouchedService(before)) {
      preserved.push(entry.slug);
      return [];
    }
    return [
      {
        id: before?.id || randomUUID(),
        before: before || null,
        value: serviceContentPayload(entry, order, before?.version || 0),
      },
    ];
  });
  const fixture = hideFixture
    ? await db.service.findUnique({ where: { slug: fixtureSlug }, include: { translations: true } })
    : null;
  if (
    fixture &&
    !fixture.translations.every(
      (t) =>
        t.title === 'Development service' &&
        t.summary === 'Development fixture' &&
        JSON.stringify(t.blocks).includes('Development verification only'),
    )
  )
    throw new Error('Development fixture content changed; leave it untouched');
  const hide = fixture && (fixture.active || fixture.translations.some((t) => t.published));
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'preview',
        enrich: planned.filter((p) => p.before).map((p) => p.value.slug),
        create: planned.filter((p) => !p.before).map((p) => p.value.slug),
        preserveExisting: preserved,
        hideFixture: hide ? fixtureSlug : null,
      },
      null,
      2,
    ),
  );
  if (apply && (planned.length || hide)) {
    await mkdir('.data/content-backups', { recursive: true });
    const backup = resolve('.data/content-backups', `services-${runId}.json`);
    await writeFile(
      backup,
      JSON.stringify(
        {
          runId,
          actorId,
          createdAt: new Date().toISOString(),
          services: planned.map((p) => ({ id: p.id, slug: p.value.slug, before: p.before })),
          fixture: hide ? fixture : null,
        },
        null,
        2,
      ),
      { flag: 'wx' },
    );
    await db.$transaction(
      async (tx) => {
        for (const { id, before, value } of planned) {
          if (before) {
            const current = await tx.service.findUnique({
              where: { id },
              include: { translations: true },
            });
            if (
              !isUntouchedService(current) ||
              current.updatedAt.getTime() !== before.updatedAt.getTime()
            )
              throw new Error('Service changed after preview; no content overwritten');
            const result = await tx.service.updateMany({
              where: { id, version: before.version, deletedAt: null },
              data: { active: true, sortOrder: value.sortOrder, version: { increment: 1 } },
            });
            if (result.count !== 1) throw new Error('Service changed during import');
          } else
            await tx.service.create({
              data: { id, slug: value.slug, active: true, sortOrder: value.sortOrder },
            });
          for (const translation of value.translations)
            await tx.serviceTranslation.upsert({
              where: { serviceId_locale: { serviceId: id, locale: translation.locale } },
              create: { ...translation, serviceId: id },
              update: translation,
            });
          await tx.cmsAudit.create({
            data: { actorId, entityId: id, action: `service.import-content.${runId}` },
          });
        }
        if (hide) {
          const result = await tx.service.updateMany({
            where: { id: fixture.id, version: fixture.version },
            data: { active: false, version: { increment: 1 } },
          });
          if (result.count !== 1) throw new Error('Development fixture changed during import');
          await tx.serviceTranslation.updateMany({
            where: { serviceId: fixture.id },
            data: { published: false },
          });
          await tx.cmsAudit.create({
            data: {
              actorId,
              entityId: fixture.id,
              action: `service.hide-development-fixture.${runId}`,
            },
          });
        }
      },
      { isolationLevel: 'Serializable', timeout: 30000 },
    );
    console.log(
      `Published content for ${planned.length} services in three languages. Backup: ${backup}`,
    );
  }
} finally {
  await db.$disconnect();
}
