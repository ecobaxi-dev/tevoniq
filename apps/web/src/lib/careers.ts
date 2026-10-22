import 'server-only';
import { cache } from 'react';
import type { PublicJob } from '@tevoniq/validation';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
export type JobResults = { items: PublicJob[]; total: number; page: number; limit: number };
export async function getCareerJobs(query: Record<string, string> = {}): Promise<JobResults> {
  const response = await fetchPublicContent(
    `${env.API_URL}/careers?${new URLSearchParams(query)}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok)
    throw new Error('Job openings are temporarily unavailable. Please try again later.');
  return response.json();
}
export const getCareerJob = cache(
  async (slug: string): Promise<(PublicJob & { turnstileSiteKey: string | null }) | null> => {
    const response = await fetchPublicContent(
      `${env.API_URL}/careers/${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (response.status === 404 || response.status === 400) return null;
    if (!response.ok) throw new Error('Job opening is temporarily unavailable');
    return response.json();
  },
);
export async function careerSitemap() {
  const items: PublicJob[] = [];
  for (let page = 1; page <= 10000; page++) {
    const result = await getCareerJobs({ page: String(page), limit: '50' });
    items.push(...result.items);
    if (!result.items.length || items.length >= result.total) break;
  }
  return items;
}
