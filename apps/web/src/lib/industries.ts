import 'server-only';
import { cache } from 'react';
import { publicIndustrySchema, industryListSchema } from '@tevoniq/validation';
import type { Locale } from '@tevoniq/types';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
async function request(path: string) {
  const response = await fetchPublicContent(`${env.API_URL}/industries${path}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Industries unavailable');
  return response.json() as Promise<unknown>;
}
export const getIndustry = cache(async (locale: Locale, slug: string) => {
  const value = await request(`/${encodeURIComponent(slug)}?locale=${locale}`);
  return value === null ? null : publicIndustrySchema.parse(value);
});
export async function getIndustries(query: {
  locale: Locale;
  page: number;
  q: string;
  featured?: string | undefined;
  service?: string | undefined;
}) {
  const params = new URLSearchParams({
    locale: query.locale,
    page: String(query.page),
    q: query.q,
  });
  if (query.featured) params.set('featured', query.featured);
  if (query.service) params.set('service', query.service);
  return industryListSchema.parse(await request(`?${params}`));
}
