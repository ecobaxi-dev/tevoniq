import 'server-only';
import { cache } from 'react';
import {
  companyContentSchema,
  defaultCompanyContent,
  publicHomeSchema,
  publicTeamProfilesSchema,
  type companySlugSchema,
} from '@tevoniq/validation';
import type { z } from 'zod';
import type { Locale } from '@tevoniq/types';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
export const getCompany = cache(async (locale: Locale, slug: z.infer<typeof companySlugSchema>) => {
  try {
    const response = await fetchPublicContent(`${env.API_URL}/company/${slug}?locale=${locale}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Company content unavailable');
    return companyContentSchema.parse(await response.json());
  } catch {
    // A failed CMS request must never restore content that an editor unpublished.
    return undefined;
  }
});
export { defaultCompanyContent };
export const getPublishedTeam = cache(async (locale: Locale) => {
  const response = await fetchPublicContent(
    `${env.API_URL}/company/team/profiles?locale=${locale}`,
    {
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!response.ok) throw new Error('Team profiles unavailable');
  return publicTeamProfilesSchema.parse(await response.json()).items;
});
export const getPublishedPartners = cache(async (locale: Locale) => {
  const response = await fetchPublicContent(`${env.API_URL}/home/${locale}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Partners unavailable');
  return publicHomeSchema.parse(await response.json()).partners;
});
