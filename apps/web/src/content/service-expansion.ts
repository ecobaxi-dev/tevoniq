import { isRetiredService, type Locale } from '@tevoniq/types';
import catalog from '../../../../content/service-expansion.json';
import type { NavigationGroup } from '@/config/navigation';

/** Shared with the CMS importer: links and editorial slugs must stay in sync. */
export function serviceNavigationGroups(locale: Locale): NavigationGroup[] {
  return catalog.groups.map((group) => ({
    id: group.id,
    label: group.labels[locale],
    items: group.services
      .filter((service) => !isRetiredService(service.slug))
      .map((service) => ({
        id: service.slug,
        label: service.translations[locale].title,
        description: service.translations[locale].summary,
        href: `/services/${service.slug}`,
      })),
  }));
}
