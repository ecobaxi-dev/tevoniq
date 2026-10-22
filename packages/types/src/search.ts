import type { Locale } from './index.js';
export const searchTypes = [
  'service',
  'solution',
  'industry',
  'project',
  'blog',
  'resource',
  'page',
] as const;
export type SearchType = (typeof searchTypes)[number];
export interface SearchRequest {
  q: string;
  locale: Locale;
  limit: number;
}
export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  excerpt: string;
  url: string;
}
export interface SearchResponse {
  query: string;
  groups: { type: SearchType; items: SearchResult[]; hasMore: boolean }[];
}
