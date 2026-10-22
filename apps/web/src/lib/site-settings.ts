import 'server-only';
import { cache } from 'react';
import { publicSiteSettingsSchema } from '@tevoniq/validation';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
export const getSiteSettings = cache(async () => {
  try {
    const response = await fetchPublicContent(env.API_URL + '/site-settings', {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error('Settings unavailable');
    return publicSiteSettingsSchema.parse(await response.json());
  } catch {
    return publicSiteSettingsSchema.parse({});
  }
});
