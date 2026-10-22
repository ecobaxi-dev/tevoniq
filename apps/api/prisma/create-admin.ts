import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { hashPassword } from '../src/cms/password.js';
// Supply through the process environment, never command arguments or committed files.
const email = process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.CMS_ADMIN_PASSWORD;
if (
  !email ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  !password ||
  password.length < 15 ||
  password.length > 128
)
  throw new Error(
    'Set CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD (15–128 characters) in the process environment.',
  );
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const passwordHash = await hashPassword(password);
  await db.$transaction(async (tx) => {
    const user = await tx.cmsUser.upsert({
      where: { email },
      create: { email, passwordHash, role: 'SUPER_ADMIN' },
      update: { passwordHash, role: 'SUPER_ADMIN', disabled: false, authVersion: { increment: 1 }, version: { increment: 1 } },
    });
    await tx.cmsSession.deleteMany({ where: { userId: user.id } });
    await tx.cmsPasswordReset.deleteMany({ where: { userId: user.id } });
    await tx.cmsAudit.create({
      data: { actorId: 'operator', action: 'admin.provision', entityId: user.id },
    });
  });
  console.log('Administrator provisioned; existing sessions revoked.');
} finally {
  await db.$disconnect();
}
