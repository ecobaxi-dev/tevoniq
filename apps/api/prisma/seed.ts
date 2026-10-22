import { initialIndustryNames } from './industry-catalog.js';
import { initialServiceNames, categorySlug } from './service-catalog.js';
import { initialSolutionNames } from './solution-catalog.js';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
if (process.env.NODE_ENV !== 'development') {
  throw new Error(
    'Development seed requires NODE_ENV=development. It must never run in production.',
  );
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  await prisma.developmentFixture.upsert({
    where: { id: 'architecture-check' },
    create: {
      id: 'architecture-check',
      label: 'DEVELOPMENT DATA — architecture verification only',
    },
    update: { label: 'DEVELOPMENT DATA — architecture verification only' },
  });
  for (const title of initialServiceNames) {
    await prisma.service.upsert({
      where: { slug: categorySlug(title) },
      create: {
        slug: categorySlug(title),
        active: false,
        translations: { create: { locale: 'en', title, published: false } },
      },
      update: {},
    });
  }
  for (const name of initialSolutionNames) {
    await prisma.solution.upsert({
      where: { slug: categorySlug(name) },
      create: {
        slug: categorySlug(name),
        status: 'DRAFT',
        active: false,
        published: false,
        featured: false,
        translations: { create: { locale: 'en', name, published: false } },
      },
      update: {},
    });
  }
  for (const name of initialIndustryNames) {
    await prisma.industry.upsert({
      where: { slug: categorySlug(name) },
      create: {
        slug: categorySlug(name),
        status: 'DRAFT',
        active: false,
        published: false,
        featured: false,
        translations: { create: { locale: 'en', name, published: false } },
      },
      update: {},
    });
  }
  console.log(
    'Development fixture and inactive service categories seeded. Existing editorial records were preserved.',
  );
} finally {
  await prisma.$disconnect();
}
