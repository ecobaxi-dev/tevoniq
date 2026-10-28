import { isRetiredService, isRetiredPublicPath, isRetiredCatalogLabel } from '@tevoniq/types';
export type DirectoryCard = { id: string; slug: string; title: string; summary: string };
export type DirectoryGroup = { id: string; label: string; items: DirectoryCard[] };
export type DirectoryNavigationGroup = { id: string; label: string; items: { href: string }[] };
/** Publication is supplied by the API. Navigation classifies it; it never creates service cards. */
export function groupServiceDirectory(
  items: DirectoryCard[],
  groups: DirectoryNavigationGroup[],
  fallback: string,
): DirectoryGroup[] {
  const allowed = items.filter(
    (item) =>
      !isRetiredService(item.slug) &&
      !isRetiredPublicPath(`/services/${item.slug}`) &&
      !isRetiredCatalogLabel(item.title),
  );
  const used = new Set<string>();
  const result: DirectoryGroup[] = groups.flatMap((group) => {
    const paths = new Set(group.items.map((item) => item.href));
    const matches = allowed.filter(
      (item) => !used.has(item.slug) && paths.has(`/services/${item.slug}`),
    );
    matches.forEach((item) => used.add(item.slug));
    return matches.length ? [{ id: group.id, label: group.label, items: matches }] : [];
  });
  const rest = allowed.filter((item) => !used.has(item.slug));
  if (rest.length) result.push({ id: 'other', label: fallback, items: rest });
  return result;
}
