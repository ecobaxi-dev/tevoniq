import type { SearchResponse, SearchResult } from '@tevoniq/types';
import { growthSectors, growthGuides } from '../content/growth.ts';
const normal = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .toLocaleLowerCase();
/** Code-owned editorial pages join CMS results without editing the owner's database. */
export function addGrowthResults(
  response: SearchResponse,
  locale: string,
  query: string,
  limit = 8,
): SearchResponse {
  if ((locale !== 'ar' && locale !== 'en') || !query.trim()) return response;
  const words = normal(query).trim().split(/\s+/);
  const records: SearchResult[] = [
    ...growthSectors.map((item) => ({
      id: `sector-${item.slug}`,
      type: 'industry' as const,
      title: item[locale].name,
      excerpt: item[locale].intro,
      url: `/${locale}/business/${item.slug}`,
    })),
    ...growthGuides.map((item) => ({
      id: `guide-${item.slug}`,
      type: 'resource' as const,
      title: item[locale].title,
      excerpt: item[locale].summary,
      url: `/${locale}/guides/${item.slug}`,
    })),
  ].filter((item) => words.every((word) => normal(`${item.title} ${item.excerpt}`).includes(word)));
  const groups = response.groups.map((group) => ({ ...group, items: [...group.items] }));
  for (const record of records) {
    let group = groups.find((group) => group.type === record.type);
    if (!group) {
      group = { type: record.type, items: [], hasMore: false };
      groups.push(group);
    }
    if (!group.items.some((item) => item.url === record.url)) group.items.push(record);
  }
  return {
    ...response,
    groups: groups.map((group) => ({
      ...group,
      hasMore: group.hasMore || group.items.length > limit,
      items: group.items.slice(0, limit),
    })),
  };
}
