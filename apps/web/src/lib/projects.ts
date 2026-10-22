import 'server-only';
import { cache } from 'react';
import { projectListSchema, publicProjectSchema, projectFiltersSchema } from '@tevoniq/validation';
import type { projectQuerySchema } from '@tevoniq/validation';
import type { z } from 'zod';
import type { Locale } from '@tevoniq/types';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
async function request(path: string) {
  const response = await fetchPublicContent(`${env.API_URL}/projects${path}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Projects unavailable');
  return response.json() as Promise<unknown>;
}
export const getProject = cache(async (locale: Locale, slug: string) => {
  const value = await request(`/${encodeURIComponent(slug)}?locale=${locale}`);
  return value === null ? null : publicProjectSchema.parse(value);
});
export async function getProjects(query: z.infer<typeof projectQuerySchema>) {
  const params = new URLSearchParams(
    Object.entries(query)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  );
  return projectListSchema.parse(await request(`?${params}`));
}
export async function getProjectFilters(locale: Locale) {
  return projectFiltersSchema.parse(await request(`/filters?locale=${locale}`));
}
