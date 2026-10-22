import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { siteSettingsSchema, migrateOrganization, type SiteSettings } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import type { Prisma } from '../generated/prisma/client.js';
export const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';
@Injectable()
export class SiteSettingsService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  async read() {
    const row = await this.db.adminRecord.findUnique({
      where: { id: SETTINGS_ID },
      select: { data: true, version: true, updatedAt: true },
    });
    if (row)
      return {
        settings: siteSettingsSchema.parse(row.data),
        version: row.version,
        updatedAt: row.updatedAt.toISOString(),
      };
    const legacy = await this.db.adminRecord.findFirst({
      where: {
        module: 'site-settings',
        status: 'published',
        deletedAt: null,
        data: { path: ['key'], equals: 'organization' },
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      select: { data: true },
    });
    const settings = migrateOrganization(legacy?.data ?? {});
    const leads = await this.db.leadSettings.findUnique({
      where: { id: 'default' },
      select: { value: true },
    });
    const prior =
      leads?.value && typeof leads.value === 'object' && !Array.isArray(leads.value)
        ? leads.value.notificationRecipients
        : undefined;
    if (Array.isArray(prior)) {
      const parsed = siteSettingsSchema.shape.email.safeParse({ notificationRecipients: prior });
      if (parsed.success)
        settings.email.notificationRecipients = parsed.data.notificationRecipients;
    }
    return { settings, version: 0, updatedAt: null };
  }
  async save(settings: SiteSettings, version: number, actorId: string) {
    const data = siteSettingsSchema.parse(settings) as unknown as Prisma.InputJsonValue;
    try {
      return await this.db.$transaction(
        async (tx) => {
          if (version === 0) {
            await tx.adminRecord.create({
              data: {
                id: SETTINGS_ID,
                module: 'site-settings',
                title: 'Site Settings',
                status: 'published',
                language: 'en',
                data,
                createdById: actorId,
                updatedById: actorId,
              },
            });
          } else {
            const changed = await tx.adminRecord.updateMany({
              where: { id: SETTINGS_ID, version },
              data: { data, version: { increment: 1 }, updatedById: actorId },
            });
            if (!changed.count)
              throw new ConflictException(
                'Settings changed in another session. Reload before saving.',
              );
          }
          await tx.cmsAudit.create({
            data: { actorId, entityId: SETTINGS_ID, action: 'settings.update' },
          });
          const row = await tx.adminRecord.findUniqueOrThrow({
            where: { id: SETTINGS_ID },
            select: { data: true, version: true, updatedAt: true },
          });
          return {
            settings: siteSettingsSchema.parse(row.data),
            version: row.version,
            updatedAt: row.updatedAt.toISOString(),
          };
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        ['P2002', 'P2034'].includes(String(error.code))
      )
        throw new ConflictException('Settings changed in another session. Reload before saving.');
      throw error;
    }
  }
}
