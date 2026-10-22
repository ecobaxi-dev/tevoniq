import 'reflect-metadata';
import { readFile } from 'node:fs/promises';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { companyContentSchema, defaultCompanyContent, companySlugs } from '@tevoniq/validation';
config({ path: 'apps/api/.env', quiet: true });
const args = process.argv.slice(2);
if (args.some((a) => a !== '--apply')) throw Error('Unknown argument');
const url = process.env.DATABASE_URL;
if (
  !url ||
  process.env.NODE_ENV !== 'development' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
)
  throw Error('Local development only');
const source = JSON.parse(
  await readFile(new URL('../content/company-pages.json', import.meta.url), 'utf8'),
);
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  for (const locale of ['en', 'tr', 'ar'])
    for (const slug of companySlugs) {
      if (await db.companyPage.findUnique({ where: { slug_locale: { slug, locale } } })) {
        console.log(`${locale}/${slug}: preserved`);
        continue;
      }
      const base = defaultCompanyContent(slug),
        translated = source[locale]?.pages[slug];
      const content = companyContentSchema.parse(
        translated
          ? { ...base, ...translated, seoDescription: translated.intro, cta: source[locale].cta }
          : base,
      );
      if (args.includes('--apply'))
        await db.$transaction(async (tx) => {
          await tx.companyPage.create({
            data: {
              slug,
              locale,
              content,
              published: true,
              createdById: 'content-import:company',
              updatedById: 'content-import:company',
            },
          });
          await tx.cmsAudit.create({
            data: {
              actorId: 'content-import:company',
              entityId: `company/${slug}/${locale}`,
              action: 'company.bootstrap',
            },
          });
        });
      console.log(`${locale}/${slug}: ${args.includes('--apply') ? 'imported' : 'ready'}`);
    }
} finally {
  await db.$disconnect();
}
