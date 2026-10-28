import 'server-only';
import { cache } from 'react';
import { serviceListSchema, publicServiceSchema } from '@tevoniq/validation';
import type { Locale } from '@tevoniq/types';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
export class ServicesUnavailable extends Error {}
async function request(path: string) {
  try {
    const response = await fetchPublicContent(`${env.API_URL}/services${path}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new ServicesUnavailable();
    return (await response.json()) as unknown;
  } catch {
    throw new ServicesUnavailable('Services are unavailable');
  }
}
export async function getServices(locale: Locale, page: number, q: string, limit = 12) {
  const data = await request(
    `?${new URLSearchParams({ locale, page: String(page), q, limit: String(limit) })}`,
  );
  const parsed = serviceListSchema.safeParse(data);
  if (!parsed.success) throw new ServicesUnavailable();
  return parsed.data;
}
export const getService = cache(async (locale: Locale, slug: string) => {
  const data = await request(`/${encodeURIComponent(slug)}?locale=${locale}`);
  if (data === null) return null;
  const parsed = publicServiceSchema.safeParse(data);
  if (!parsed.success) throw new ServicesUnavailable();
  return parsed.data;
});
