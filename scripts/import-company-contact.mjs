import 'reflect-metadata';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../apps/api/dist/generated/prisma/client.js';
import { siteSettingsSchema } from '@tevoniq/validation';
import { SiteSettingsService } from '../apps/api/dist/site-settings/site-settings.service.js';

config({ path: 'apps/api/.env', quiet: true });
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--apply')) throw new Error('Unknown argument');
const url = process.env.DATABASE_URL;
if (
  !url ||
  process.env.NODE_ENV !== 'development' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
) {
  throw new Error('This import is restricted to the local development database');
}
const source = JSON.parse(
  await readFile(new URL('../content/company-contact.json', import.meta.url), 'utf8'),
);
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const service = new SiteSettingsService(db);
  const before = await service.read();
  const settings = siteSettingsSchema.parse({
    ...before.settings,
    general: { ...before.settings.general, legalCompanyName: source.legalCompanyName },
    contact: {
      ...before.settings.contact,
      email: source.email,
      phone: source.phone,
      city: source.city,
      country: source.country,
    },
    email: {
      ...before.settings.email,
      notificationRecipients: before.settings.email.notificationRecipients.length
        ? before.settings.email.notificationRecipients
        : [source.email],
    },
    legal: {
      ...before.settings.legal,
      privacyPolicyUrl: before.settings.legal.privacyPolicyUrl || '/privacy-policy',
      cookiePolicyUrl: before.settings.legal.cookiePolicyUrl || '/cookie-policy',
    },
  });
  if (args.includes('--apply')) {
    await mkdir('.data/content-backups', { recursive: true });
    await writeFile(
      `.data/content-backups/company-contact-${randomUUID()}.json`,
      JSON.stringify(before, null, 2),
    );
    await service.save(settings, before.version, 'content-import:owner-company-contact');
    console.log('Company contact settings saved; existing brand and other settings preserved.');
  } else
    console.log(
      JSON.stringify(
        {
          mode: 'preview',
          legalCompanyName: settings.general.legalCompanyName,
          contact: settings.contact,
        },
        null,
        2,
      ),
    );
} finally {
  await db.$disconnect();
}
