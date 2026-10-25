import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { solutionTranslationSchema } from '@tevoniq/validation';
import { refreshDemoPresentation } from './lib/demo-presentation.mjs';
import {
  buildDemoContent,
  actorId,
  appendCompanyContent,
  solutionRelationshipSections,
  contentId,
  demoRelease,
  previewDemoAuthorized,
} from './lib/demo-content.mjs';

const args = process.argv.slice(2);
const preview = args.includes('--apply-preview');
const apply = preview || args.includes('--apply');
if (args.some((a) => !['--check', '--apply', '--apply-preview'].includes(a)) || args.length > 1)
  throw new Error(
    'Usage: node scripts/import-demo-content.mjs [--check | --apply | --apply-preview]',
  );
if (!preview) {
  config({ path: 'apps/api/.env', quiet: true });
  config({ path: 'apps/web/.env', quiet: true });
}
if (preview && !previewDemoAuthorized(process.env))
  throw new Error(
    'Render preview import requires an explicit release opt-in, production runtime, HTTPS site origin and injected database configuration.',
  );
const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const content = buildDemoContent(siteUrl);
const counts = (value) =>
  Object.fromEntries(Object.entries(value).map(([key, rows]) => [key, rows.length]));
if (args.includes('--check')) {
  console.log(
    JSON.stringify({ mode: 'validated-without-database', counts: counts(content) }, null, 2),
  );
} else {
  const url = process.env.DATABASE_URL;
  if (
    !preview &&
    (!url ||
      process.env.NODE_ENV !== 'development' ||
      !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname))
  )
    throw new Error(
      'Demo content import requires a local development database. Production and remote databases are refused.',
    );
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const releaseId = contentId(`release:${demoRelease}`);
    const completed = preview && (await db.adminRecord.findUnique({ where: { id: releaseId } }));
    if (completed) {
      console.log('Demo preview release already applied. Editorial changes preserved.');
    } else {
      const [
        services,
        solutions,
        industries,
        projects,
        articles,
        taxonomies,
        admin,
        jobs,
        company,
      ] = await Promise.all([
        db.service.findMany({
          where: { deletedAt: null, active: true },
          select: { id: true, slug: true },
        }),
        db.solution.findMany({ where: { deletedAt: null }, include: { translations: true } }),
        db.industry.findMany({ select: { id: true, slug: true } }),
        db.project.findMany({ select: { id: true, slug: true } }),
        db.insightArticle.findMany({ select: { id: true, slug: true, language: true } }),
        db.insightTaxonomy.findMany({
          select: { id: true, slug: true, language: true, type: true },
        }),
        db.adminRecord.findMany({
          where: { id: { in: [...content.team, ...content.partners].map((r) => r.id) } },
          select: { id: true },
        }),
        db.careerJob.findMany({ select: { id: true, slug: true } }),
        db.companyPage.findMany(),
      ]);
      const serviceIds = (slugs) =>
        slugs.map((slug) => {
          const row = services.find((s) => s.slug === slug);
          if (!row)
            throw new Error(
              `Required published service missing: ${slug}. Import the service catalog first.`,
            );
          return row.id;
        });
      for (const row of [...content.industries, ...content.projects]) serviceIds(row.serviceSlugs);
      const missingSolutions = [
        ...new Set(content.projects.flatMap((p) => p.solutionSlugs)),
      ].filter((slug) => !solutions.some((s) => s.slug === slug && s.published));
      if (missingSolutions.length)
        throw new Error(`Required solutions missing: ${missingSolutions.join(', ')}`);
      const industryId = (slug) =>
        industries.find((r) => r.slug === slug)?.id ||
        content.industries.find((r) => r.value.slug === slug)?.id;
      const solutionId = (slug) => solutions.find((r) => r.slug === slug).id;
      const planned = {
        industries: content.industries.filter(
          (r) => !industries.some((old) => old.id === r.id || old.slug === r.value.slug),
        ),
        projects: content.projects.filter(
          (r) => !projects.some((old) => old.id === r.id || old.slug === r.value.slug),
        ),
        taxonomies: content.taxonomies.filter(
          (r) =>
            !taxonomies.some(
              (old) =>
                old.id === r.id ||
                (old.slug === r.slug && old.language === r.language && old.type === r.type),
            ),
        ),
        articles: content.articles.filter(
          (r) =>
            !articles.some(
              (old) =>
                old.id === r.id || (old.slug === r.value.slug && old.language === r.value.language),
            ),
        ),
        partners: content.partners.filter((r) => !admin.some((old) => old.id === r.id)),
        team: content.team.filter((r) => !admin.some((old) => old.id === r.id)),
        jobs: content.jobs.filter(
          (r) => !jobs.some((old) => old.id === r.id || old.slug === r.value.slug),
        ),
      };
      const companyChanges = company.flatMap((before) => {
        if (!before.published) return [];
        const after = appendCompanyContent(before.slug, before.locale, before.content);
        return isDeepStrictEqual(after.sections, before.content.sections)
          ? []
          : [{ before, after }];
      });
      const solutionChanges = solutions.flatMap((before) =>
        before.translations.flatMap((t) => {
          if (!t.published || !before.published) return [];
          const blocks = solutionRelationshipSections(before.slug, t.locale, t.blocks);
          if (JSON.stringify(blocks) === JSON.stringify(t.blocks)) return [];
          solutionTranslationSchema.parse({
            locale: t.locale,
            name: t.name,
            shortDescription: t.shortDescription,
            published: t.published,
            seoTitle: t.seoTitle,
            seoDescription: t.seoDescription,
            blocks,
          });
          return [{ before, translation: t, blocks }];
        }),
      );
      const hasChanges =
        Object.values(planned).some((r) => r.length) ||
        companyChanges.length ||
        solutionChanges.length;
      console.log(
        JSON.stringify(
          {
            mode: apply ? (preview ? 'apply-render-preview' : 'apply') : 'preview',
            create: counts(planned),
            appendCompanyPages: companyChanges.length,
            addSolutionRelationshipSections: solutionChanges.length,
            preserveExistingRecords: true,
          },
          null,
          2,
        ),
      );
      if (apply && (hasChanges || preview)) {
        const runId = randomUUID(),
          backupPath = `.data/content-backups/demo-catalog-${runId}.json`;
        await mkdir('.data/content-backups', { recursive: true });
        await writeFile(
          backupPath,
          JSON.stringify(
            {
              runId,
              actorId,
              createdAt: new Date().toISOString(),
              created: Object.fromEntries(
                Object.entries(planned).map(([key, rows]) => [key, rows.map((r) => r.id)]),
              ),
              companyPages: companyChanges.map((r) => r.before),
              solutions: [...new Map(solutionChanges.map((r) => [r.before.id, r.before])).values()],
            },
            null,
            2,
          ),
          { flag: 'wx', mode: 0o600 },
        );
        const audit = (tx, id) =>
          tx.cmsAudit.create({
            data: { actorId, entityId: id, action: `demo-content.import.${runId}` },
          });
        await db.$transaction(
          async (tx) => {
            for (const row of planned.industries) {
              const {
                serviceIds: unusedServices,
                solutionIds: unusedSolutions,
                projectIds: unusedProjects,
                version,
                ...data
              } = row.value;
              void unusedServices;
              void unusedSolutions;
              void unusedProjects;
              void version;
              const { translations, ...fields } = data;
              await tx.industry.create({
                data: {
                  id: row.id,
                  ...fields,
                  translations: { create: translations },
                  services: {
                    create: serviceIds(row.serviceSlugs).map((serviceId, sortOrder) => ({
                      serviceId,
                      sortOrder,
                    })),
                  },
                },
              });
              await audit(tx, row.id);
            }
            for (const row of planned.projects) {
              const {
                industryIds: unusedIndustries,
                serviceIds: unusedServices,
                solutionIds: unusedSolutions,
                version,
                translations,
                ...fields
              } = row.value;
              void unusedIndustries;
              void unusedServices;
              void unusedSolutions;
              void version;
              await tx.project.create({
                data: {
                  id: row.id,
                  ...fields,
                  projectDate: null,
                  translations: { create: translations },
                  services: {
                    create: serviceIds(row.serviceSlugs).map((serviceId, sortOrder) => ({
                      serviceId,
                      sortOrder,
                    })),
                  },
                  industries: {
                    create: row.industrySlugs.map((slug, sortOrder) => ({
                      industryId: industryId(slug),
                      sortOrder,
                    })),
                  },
                  solutions: {
                    create: row.solutionSlugs.map((slug, sortOrder) => ({
                      solutionId: solutionId(slug),
                      sortOrder,
                    })),
                  },
                },
              });
              await audit(tx, row.id);
            }
            // Create only associations owned by the newly created examples. A later
            // rerun never restores a relationship that an editor removed.
            const pairs = new Map();
            for (const row of planned.projects)
              for (const i of row.industrySlugs)
                for (const s of row.solutionSlugs)
                  pairs.set(`${i}:${s}`, { industryId: industryId(i), solutionId: solutionId(s) });
            for (const pair of pairs.values())
              await tx.solutionIndustry.upsert({
                where: { solutionId_industryId: pair },
                create: pair,
                update: {},
              });
            const taxonomyMap = new Map(
              taxonomies.map((r) => [`${r.slug}:${r.language}:${r.type}`, r.id]),
            );
            for (const t of content.taxonomies) {
              const existing = taxonomies.find((row) => row.id === t.id);
              if (existing) taxonomyMap.set(`${t.slug}:${t.language}:${t.type}`, existing.id);
            }
            for (const row of planned.taxonomies) {
              await tx.insightTaxonomy.create({ data: row });
              taxonomyMap.set(`${row.slug}:${row.language}:${row.type}`, row.id);
              await audit(tx, row.id);
            }
            const taxonomyId = (original) => {
              const t = content.taxonomies.find((r) => r.id === original);
              return taxonomyMap.get(`${t.slug}:${t.language}:${t.type}`);
            };
            for (const row of planned.articles) {
              const { tagIds, version, ...value } = row.value;
              void version;
              await tx.insightArticle.create({
                data: {
                  id: row.id,
                  ...value,
                  categoryId: taxonomyId(value.categoryId),
                  tags: { create: tagIds.map((id) => ({ tagId: taxonomyId(id) })) },
                  createdById: actorId,
                  updatedById: actorId,
                },
              });
              await audit(tx, row.id);
            }
            for (const row of [...planned.partners, ...planned.team]) {
              await tx.adminRecord.create({ data: row });
              await audit(tx, row.id);
            }
            for (const row of planned.jobs) {
              const { version, ...value } = row.value;
              void version;
              await tx.careerJob.create({
                data: { id: row.id, ...value, createdById: actorId, updatedById: actorId },
              });
              await audit(tx, row.id);
            }
            for (const { before, after } of companyChanges) {
              const changed = await tx.companyPage.updateMany({
                where: {
                  slug: before.slug,
                  locale: before.locale,
                  version: before.version,
                  updatedAt: before.updatedAt,
                },
                data: { content: after, version: { increment: 1 }, updatedById: actorId },
              });
              if (changed.count !== 1)
                throw new Error('Company page changed during import. No changes committed.');
              await audit(tx, `company/${before.slug}/${before.locale}`);
            }
            const changedSolutions = new Map();
            for (const { before, translation, blocks } of solutionChanges) {
              const changed = await tx.solutionTranslation.updateMany({
                where: { id: translation.id, updatedAt: translation.updatedAt },
                data: { blocks },
              });
              if (changed.count !== 1)
                throw new Error(
                  'Solution translation changed during import. No changes committed.',
                );
              changedSolutions.set(before.id, before);
            }
            for (const before of changedSolutions.values()) {
              const changed = await tx.solution.updateMany({
                where: { id: before.id, version: before.version, updatedAt: before.updatedAt },
                data: { version: { increment: 1 } },
              });
              if (changed.count !== 1)
                throw new Error('Solution changed during import. No changes committed.');
              await audit(tx, before.id);
            }
            if (preview)
              await tx.adminRecord.create({
                data: {
                  id: releaseId,
                  module: 'demo-release',
                  title: `demo-catalog/${demoRelease}`,
                  language: 'en',
                  status: 'published',
                  data: { release: demoRelease },
                  createdById: actorId,
                  updatedById: actorId,
                },
              });
          },
          { isolationLevel: 'Serializable', timeout: 60000 },
        );
        console.log(
          `Demo content applied${preview ? ' to the Render preview' : ' to the local development database'}. Backup: ${backupPath}`,
        );
      } else if (apply) console.log('No changes required. Existing content preserved.');
    }
    await refreshDemoPresentation(db, content, { apply, preview });
  } finally {
    await db.$disconnect();
  }
}
