import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { serviceWriteSchema } from '../packages/validation/dist/index.js';
import { loadExpansion, expansionPayload } from './lib/service-expansion.mjs';

if (process.argv.slice(2).some((arg) => arg !== '--apply')) throw Error('Unknown argument');
const apply = process.argv.includes('--apply');
config({ path: 'apps/api/.env', quiet: true });
const url = process.env.DATABASE_URL;
if (
  !url ||
  process.env.NODE_ENV !== 'development' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
)
  throw Error('Local development database required');
const value = serviceWriteSchema.parse(
  JSON.parse(await readFile('content/ui-ux-service.json', 'utf8')),
);
if (
  value.slug !== 'ui-ux-design' ||
  !value.active ||
  value.translations.length !== 3 ||
  value.translations.some((t) => !t.published)
)
  throw Error('Expected three published UI/UX translations');
const catalog = await loadExpansion();
const group = catalog.groups.find((g) => g.services.some((s) => s.slug === value.slug));
const entry = group.services.find((s) => s.slug === value.slug);
const baseline = expansionPayload(entry, group, 0);
const content = (translations) =>
  translations
    .map(({ locale, title, summary, published, seoTitle, seoDescription, blocks }) => ({
      locale,
      title,
      summary,
      published,
      seoTitle,
      seoDescription,
      blocks,
    }))
    .sort((a, b) => a.locale.localeCompare(b.locale));
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const before = await db.service.findUnique({
    where: { slug: value.slug },
    include: { translations: true },
  });
  if (!before || before.deletedAt || !before.active)
    throw Error('Published UI/UX service required');
  if (isDeepStrictEqual(content(before.translations), content(value.translations))) {
    console.log('UI/UX content already current; no changes.');
  } else {
    if (!isDeepStrictEqual(content(before.translations), content(baseline.translations)))
      throw Error('UI/UX content has editorial changes; refusing to overwrite them');
    console.log(
      JSON.stringify(
        {
          mode: apply ? 'apply' : 'preview',
          slug: value.slug,
          locales: value.translations.map((t) => t.locale),
          blocks: value.translations[0].blocks.map((b) => b.type),
        },
        null,
        2,
      ),
    );
    if (apply) {
      const runId = randomUUID();
      await mkdir('.data/content-backups', { recursive: true });
      const backup = `.data/content-backups/ui-ux-${runId}.json`;
      await writeFile(backup, JSON.stringify(before, null, 2), { flag: 'wx' });
      await db.$transaction(
        async (tx) => {
          const current = await tx.service.findUnique({
            where: { id: before.id },
            include: { translations: true },
          });
          if (
            !current ||
            current.deletedAt ||
            current.version !== before.version ||
            !isDeepStrictEqual(current, before)
          )
            throw Error('Content changed during import');
          await tx.service.update({
            where: { id: before.id },
            data: { version: { increment: 1 } },
          });
          for (const translation of value.translations)
            await tx.serviceTranslation.update({
              where: { serviceId_locale: { serviceId: before.id, locale: translation.locale } },
              data: translation,
            });
          await tx.cmsAudit.create({
            data: {
              actorId: 'owner-request:ui-ux-design:2026-09-29',
              entityId: before.id,
              action: `service.design.${runId}`,
            },
          });
        },
        { isolationLevel: 'Serializable', timeout: 30000 },
      );
      console.log(`UI/UX page updated in three languages. Backup: ${backup}`);
    }
  }
} finally {
  await db.$disconnect();
}
