import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import {
  loadExpansion,
  expansionPayload,
  untouchedExpansionSeed,
} from './lib/service-expansion.mjs';

if (process.argv.slice(2).some((arg) => arg !== '--apply')) throw Error('Unknown argument');
const apply = process.argv.includes('--apply');
config({ path: 'apps/api/.env', quiet: true });
const url = process.env.DATABASE_URL;
if (
  !url ||
  process.env.NODE_ENV !== 'development' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
)
  throw Error('Import is restricted to the local development database');
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const catalog = await loadExpansion();
  const entries = catalog.groups.flatMap((group) =>
    group.services.map((entry) => ({ entry, group })),
  );
  const existing = await db.service.findMany({
    where: { slug: { in: entries.map(({ entry }) => entry.slug) } },
    include: { translations: true },
  });
  const planned = [],
    preserved = [],
    unavailable = [];
  for (const [{ entry, group }, order] of entries.map((item, order) => [item, order])) {
    const before = existing.find((row) => row.slug === entry.slug);
    if (before && !untouchedExpansionSeed(before)) {
      preserved.push(entry.slug);
      if (
        before.deletedAt ||
        !before.active ||
        !['en', 'tr', 'ar'].every((locale) =>
          before.translations.some((t) => t.locale === locale && t.published),
        )
      )
        unavailable.push(entry.slug);
      continue;
    }
    planned.push({
      id: before?.id ?? randomUUID(),
      before: before ?? null,
      value: expansionPayload(entry, group, 100 + order, before?.version ?? 0),
    });
  }
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'preview',
        create: planned.filter((p) => !p.before).map((p) => p.value.slug),
        enrich: planned.filter((p) => p.before).map((p) => p.value.slug),
        preserved,
        unavailable,
      },
      null,
      2,
    ),
  );
  if (unavailable.length)
    throw Error(
      'Existing unpublished/archived or incomplete services require editorial review before linking',
    );
  if (apply && planned.length) {
    await mkdir('.data/content-backups', { recursive: true });
    const runId = randomUUID(),
      actorId = 'owner-request:service-expansion:2026-09-28';
    const backup = `.data/content-backups/service-expansion-${runId}.json`;
    await writeFile(
      backup,
      JSON.stringify(
        {
          runId,
          actorId,
          services: planned.map(({ id, before, value }) => ({ id, slug: value.slug, before })),
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
              !untouchedExpansionSeed(current) ||
              current.updatedAt.getTime() !== before.updatedAt.getTime()
            )
              throw Error('Service changed; transaction cancelled');
            const updated = await tx.service.updateMany({
              where: { id, version: before.version, deletedAt: null },
              data: { active: true, sortOrder: value.sortOrder, version: { increment: 1 } },
            });
            if (updated.count !== 1) throw Error('Service changed during import');
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
            data: { actorId, entityId: id, action: `service.expand.${runId}` },
          });
        }
      },
      { isolationLevel: 'Serializable', timeout: 30000 },
    );
    console.log(`Published ${planned.length} services in three languages. Backup: ${backup}`);
  }
} finally {
  await db.$disconnect();
}
