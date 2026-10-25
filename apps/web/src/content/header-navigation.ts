import type { Locale } from '@tevoniq/types';
import type { NavigationContent, NavigationItem } from '@/config/navigation';

/** Keep secondary destinations accessible while giving the header five clear entry points. */
export function headerNavigation(locale: Locale, content: NavigationContent): NavigationContent {
  if (locale === 'tr') return content;
  const items = structuredClone(content.items);
  const take = (href: string) => {
    const index = items.findIndex((item) => item.href === href);
    return index < 0 ? undefined : items.splice(index, 1)[0];
  };
  const home = take('/');
  const services = take('/services');
  const solutions = take('/solutions');
  const company = take('/company');
  const rename = (item: NavigationItem | undefined, before: string, after: string) => {
    if (item?.label === before) item.label = after;
  };
  if (locale === 'ar') {
    rename(services, 'الخدمات', 'خدماتنا');
    rename(solutions, 'الحلول', 'حلولنا');
    rename(company, 'الشركة', 'عن الشركة');
  } else rename(company, 'Company', 'About us');

  // Reuse published product labels where present, without duplicating their links.
  const products: NavigationItem = {
    id: 'products',
    label: locale === 'ar' ? 'منتجاتنا' : 'Products',
    href: '/pesto',
    menu: 'submenu',
    children: ['/pesto', '/advocas'].map((href) => {
      const existing = [...items, ...(company?.children ?? [])].find((item) => item.href === href);
      return (
        existing ?? { id: href.slice(1), href, label: href === '/pesto' ? 'Pesto' : 'Advocas' }
      );
    }),
  };
  const productPaths = new Set(products.children!.map((item) => item.href));
  const secondary = items.filter((item) => !productPaths.has(item.href));
  if (company) {
    company.menu = 'submenu';
    const children = [
      ...(company.children ?? []).filter((item) => !productPaths.has(item.href)),
      ...secondary.flatMap((item) => [
        item,
        ...(item.children ?? []),
        ...(item.groups?.flatMap((group) => group.items) ?? []),
      ]),
    ];
    company.children = [...new Map(children.map((item) => [item.href, item])).values()];
  }
  return {
    labels: {
      ...content.labels,
      quote: locale === 'ar' ? 'لنناقش احتياجك' : 'Let’s talk',
    },
    items: [home, services, solutions, products, company, ...(!company ? secondary : [])].filter(
      (item): item is NavigationItem => Boolean(item),
    ),
  };
}
