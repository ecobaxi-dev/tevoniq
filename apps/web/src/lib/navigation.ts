import 'server-only';
import type { Locale } from '@tevoniq/types';
import { publicNavigationSchema } from '@tevoniq/validation';
import { getBootstrapNavigation } from '@/config/navigation';
import type { NavigationContent } from '@/config/navigation';
import { applyNavigationRecords } from '@/content/navigation-records';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
export async function getNavigation(locale: Locale): Promise<NavigationContent> {
  const base = getBootstrapNavigation(locale);
  try {
    const response = await fetchPublicContent(`${env.API_URL}/navigation/${locale}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error('Navigation overrides unavailable');
    return applyNavigationRecords(base, publicNavigationSchema.parse(await response.json()));
  } catch {
    return base;
  }
}
