import { Inject, Injectable } from '@nestjs/common';
import {
  searchTypes,
  type SearchRequest,
  type SearchResponse,
  type SearchResult,
  retiredLocalizedPaths,
} from '@tevoniq/types';
import { DatabaseService } from '../database/database.service.js';
import { projectContent } from '../projects/project-public.js';
import { searchExcerpt } from './search-excerpt.js';
export abstract class SearchProvider {
  abstract search(request: SearchRequest): Promise<SearchResponse>;
}
@Injectable()
export class PostgresSearchProvider extends SearchProvider {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {
    super();
  }
  async search({ q, locale, limit }: SearchRequest): Promise<SearchResponse> {
    if (!q) return { query: q, groups: [] };
    const rows = await this.db.$queryRaw<(SearchResult & { position: bigint })[]>`
      WITH matches AS (
        SELECT id, type, title, excerpt, url,
          row_number() OVER (PARTITION BY type ORDER BY
            ts_rank(vector, plainto_tsquery('simple', ${q})) DESC, title, id) AS position
        FROM public_search_documents
        WHERE locale = ${locale} AND vector @@ plainto_tsquery('simple', ${q})
          AND NOT (url = ANY(${retiredLocalizedPaths}::text[]))
      ) SELECT * FROM matches WHERE position <= ${limit + 1} ORDER BY type, position
    `;
    // Apply the same fail-closed identity and content validation as project detail pages.
    const projects = await this.db.project.findMany({
      where: {
        id: { in: rows.filter((r) => r.type === 'project').map((r) => r.id) },
        deletedAt: null,
      },
      include: { translations: true },
    });
    const allowed = new Set(projects.filter((p) => projectContent(p, locale)).map((p) => p.id));
    const safe = rows.filter((r) => r.type !== 'project' || allowed.has(r.id));
    return {
      query: q,
      groups: searchTypes.flatMap((type) => {
        const items = safe.filter((r) => r.type === type);
        return items.length
          ? [
              {
                type,
                hasMore: items.length > limit,
                items: items.slice(0, limit).map(({ id, type, title, excerpt, url }) => ({
                  id,
                  type,
                  title,
                  excerpt: searchExcerpt(excerpt, q),
                  url,
                })),
              },
            ]
          : [];
      }),
    };
  }
}
