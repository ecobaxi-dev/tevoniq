import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../apps/api/dist/generated/prisma/client.js';

// Explicit allowlist: never transfer users, sessions, passwords, leads, CVs,
// applications, subscribers, delivery jobs, throttles, or audit history.
const models = [
  'service',
  'solution',
  'industry',
  'project',
  'companyPage',
  'insightTaxonomy',
  'insightArticle',
  'careerJob',
  'adminRecord',
  'cmsPage',
  'mediaAsset',
  'leadSettings',
  'serviceTranslation',
  'solutionTranslation',
  'industryTranslation',
  'projectTranslation',
  'solutionService',
  'solutionIndustry',
  'solutionProject',
  'industryService',
  'industryProject',
  'projectService',
  'insightArticleTag',
  'adminReference',
  'pageCatalogReference',
];
const modules = [
  'homepage',
  'site-settings',
  'team',
  'partners',
  'testimonials',
  'navigation',
  'translations',
  'seo',
  'pages',
  'media',
];
const [mode, file, ...options] = process.argv.slice(2);
const apply = options.includes('--apply');
const actor = options.find((v) => v.startsWith('--actor='))?.slice(8);
if (
  !['export', 'import'].includes(mode) ||
  !file ||
  options.some((v) => v !== '--apply' && !v.startsWith('--actor='))
)
  throw new Error(
    'Usage: node scripts/editorial-transfer.mjs export <file> OR import <file> [--apply --actor=<admin-id>]',
  );
if (mode === 'export') config({ path: 'apps/api/.env', quiet: true });
// Import intentionally never loads a local .env. Inject the target URL explicitly.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be explicitly configured');
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  if (mode === 'export') {
    const tables = await db.$transaction(
      async (tx) => {
        const result = {};
        for (const model of models) {
          result[model] = await tx[model].findMany(
            model === 'adminRecord' ? { where: { module: { in: modules } } } : {},
          );
        }
        const ids = new Set(result.adminRecord.map((row) => row.id));
        result.adminReference = result.adminReference.filter(
          (row) => ids.has(row.sourceId) && ids.has(row.targetId),
        );
        for (const rows of Object.values(result))
          for (const row of rows) {
            if ('createdById' in row) row.createdById = null;
            if ('updatedById' in row) row.updatedById = null;
          }
        return result;
      },
      { isolationLevel: 'RepeatableRead', timeout: 30000 },
    );
    await mkdir(dirname(file), { recursive: true });
    await writeFile(
      file,
      JSON.stringify(
        { format: 'tevoniq-editorial-v1', exportedAt: new Date().toISOString(), tables },
        null,
        2,
      ),
      { mode: 0o600, flag: 'wx' },
    );
    console.log(
      'Editorial export saved. Accounts and visitor data excluded. Review content and migrate media files separately before import.',
    );
  } else {
    const bundle = JSON.parse(await readFile(file, 'utf8'));
    if (
      bundle.format !== 'tevoniq-editorial-v1' ||
      !bundle.tables ||
      Object.keys(bundle.tables).length !== models.length ||
      models.some((model) => !Array.isArray(bundle.tables[model]))
    )
      throw new Error('Invalid editorial bundle');
    if (bundle.tables.adminRecord.some((row) => !modules.includes(row.module)))
      throw new Error('Unsupported admin module');
    if (bundle.tables.mediaAsset.some((row) => row.storage !== 's3'))
      throw new Error('Migrate local media files to S3 before production import');
    if (!apply) {
      console.log(
        JSON.stringify(
          {
            mode: 'preview',
            counts: Object.fromEntries(models.map((model) => [model, bundle.tables[model].length])),
          },
          null,
          2,
        ),
      );
    } else {
      if (
        !actor ||
        !(await db.cmsUser.findFirst({
          where: { id: actor, role: 'SUPER_ADMIN', disabled: false },
        }))
      )
        throw new Error('Provide --actor=<id> of an active SUPER_ADMIN in the target database');
      await db.$transaction(
        async (tx) => {
          for (const model of models)
            if (await tx[model].count())
              throw new Error(
                'Import requires an empty editorial database; existing content will never be overwritten',
              );
          for (const model of models) {
            const rows = bundle.tables[model].map((entry) => {
              const row = { ...entry };
              if ('createdById' in row) row.createdById = actor;
              if ('updatedById' in row) row.updatedById = actor;
              if (model === 'projectTranslation' && row.heroImage === null)
                row.heroImage = Prisma.DbNull;
              if (model === 'cmsPage' && row.published === null) row.published = Prisma.DbNull;
              return row;
            });
            if (rows.length) await tx[model].createMany({ data: rows });
          }
          await tx.cmsAudit.create({
            data: { actorId: actor, entityId: 'editorial-release', action: 'editorial.import' },
          });
        },
        { isolationLevel: 'Serializable', timeout: 60000 },
      );
      console.log(
        'Editorial import committed. Verify publication, storage, mail recipients and public URLs before releasing traffic.',
      );
    }
  }
} finally {
  await db.$disconnect();
}
