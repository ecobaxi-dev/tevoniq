import { spawnSync } from 'node:child_process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../apps/api/dist/generated/prisma/client.js';
import { hashPassword } from '../../apps/api/dist/cms/password.js';
import { accountEmailSchema, passwordSchema } from '@tevoniq/validation';

export async function bootstrapPreview(env) {
  const email = accountEmailSchema.parse(env.CMS_ADMIN_EMAIL);
  const password = passwordSchema.parse(env.CMS_ADMIN_PASSWORD);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
  try {
    let admin = await db.cmsUser.findUnique({ where: { email } });
    if (!admin) {
      admin = await db.cmsUser.create({
        data: { email, passwordHash: await hashPassword(password), role: 'SUPER_ADMIN' },
      });
      await db.cmsAudit.create({
        data: { actorId: 'render-bootstrap', entityId: admin.id, action: 'admin.provision' },
      });
    }
    if (admin.disabled || admin.role !== 'SUPER_ADMIN')
      throw new Error('Preview administrator is not enabled');
    const count = await db.adminRecord.count({ where: { module: 'homepage' } });
    if (count) {
      console.log('Existing preview content and administrator preserved.');
      return;
    }
    // The importer refuses nonempty editorial tables and never imports accounts.
    const result = spawnSync(
      process.execPath,
      [
        'scripts/editorial-transfer.mjs',
        'import',
        'content/render-preview.json',
        '--apply',
        `--actor=${admin.id}`,
      ],
      { env, stdio: 'inherit' },
    );
    if (result.status !== 0) throw new Error('Preview content import failed');
  } finally {
    await db.$disconnect();
  }
}
