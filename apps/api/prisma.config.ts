import 'dotenv/config';
import { defineConfig } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  // Generation and image builds do not require secrets or a running database.
  datasource: { url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/tevoniq' },
});
