import 'reflect-metadata';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { homeContentSchema } from '@tevoniq/validation';
import { homeCopy } from '../apps/web/src/content/home.ts';
import { referenceHeroCopy } from '../apps/web/src/content/reference-hero.ts';
config({ path: 'apps/api/.env', quiet: true });
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--apply')) throw new Error('Unknown argument');
const url = process.env.DATABASE_URL;
if (
  !url ||
  process.env.NODE_ENV !== 'development' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
)
  throw new Error('Local development database required');
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  for (const locale of ['en', 'tr', 'ar']) {
    const title = `homepage/${locale}`;
    const exists = await db.adminRecord.findFirst({
      where: { module: 'homepage', title, language: locale },
    });
    if (exists) {
      console.log(`${locale}: existing homepage preserved`);
      continue;
    }
    const content = homeContentSchema.parse({
      copy: homeCopy[locale],
      hero: referenceHeroCopy[locale],
    });
    if (args.includes('--apply'))
      await db.$transaction(async (tx) => {
        const row = await tx.adminRecord.create({
          data: {
            module: 'homepage',
            title,
            language: locale,
            status: 'published',
            data: { draft: content, published: content },
            createdById: 'content-import:homepage',
            updatedById: 'content-import:homepage',
          },
        });
        await tx.cmsAudit.create({
          data: {
            actorId: 'content-import:homepage',
            entityId: row.id,
            action: 'homepage.bootstrap',
          },
        });
      });
    console.log(`${locale}: ${args.includes('--apply') ? 'homepage imported' : 'ready to import'}`);
  }
} finally {
  await db.$disconnect();
}
