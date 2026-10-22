import { Controller, Get, Param, Inject, Header } from '@nestjs/common';
import { localeSchema, publicNavigationSchema } from '@tevoniq/validation';
import { DatabaseService } from '../database/database.service.js';
import { parse } from '../cms/content-policy.js';
@Controller('navigation')
export class PublicNavigationController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  @Get(':locale')
  @Header('Cache-Control', 'no-store')
  async get(@Param('locale') raw: string) {
    const locale = parse(localeSchema, raw);
    const rows = await this.db.adminRecord.findMany({
      where: {
        module: { in: ['navigation', 'translations'] },
        language: locale,
        status: 'published',
        deletedAt: null,
      },
      select: { id: true, title: true, module: true, data: true },
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: 200,
    });
    const items = [],
      labels: Record<string, string> = {};
    for (const row of rows) {
      const data = row.data as Record<string, unknown>;
      if (
        row.module === 'translations' &&
        typeof data.key === 'string' &&
        data.key.startsWith('navigation.labels.') &&
        typeof data.value === 'string' &&
        data.value.trim()
      ) {
        labels[data.key.slice('navigation.labels.'.length)] = data.value;
      }
      if (row.module !== 'navigation') continue;
      const item = {
        id: row.id,
        label: row.title,
        href: data.href,
        group: typeof data.group === 'string' ? data.group : '',
        order: Number(data.order || 0),
      };
      const result = publicNavigationSchema.shape.items.element.safeParse(item);
      if (result.success) items.push(result.data);
    }
    return publicNavigationSchema.parse({ items, labels });
  }
}
