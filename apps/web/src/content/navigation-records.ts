import type { NavigationContent, NavigationItem } from '@/config/navigation';
import type { z } from 'zod';
import type { publicNavigationSchema } from '@tevoniq/validation';
export function applyNavigationRecords(
  base: NavigationContent,
  records: z.infer<typeof publicNavigationSchema>,
): NavigationContent {
  const result = structuredClone(base);
  for (const [key, value] of Object.entries(records.labels)) {
    if (Object.hasOwn(result.labels, key))
      result.labels[key as keyof NavigationContent['labels']] = value;
  }
  const seen = new Set<string>();
  for (const record of [...records.items].sort((a, b) => a.order - b.order)) {
    if (seen.has(record.href)) continue;
    seen.add(record.href);
    const all = result.items.flatMap((item) => [
      item,
      ...(item.children ?? []),
      ...(item.groups?.flatMap((group) => group.items) ?? []),
    ]);
    const existing = all.find((item) => item.href === record.href);
    if (existing) {
      existing.label = record.label;
      continue;
    }
    const item: NavigationItem = { id: record.id, label: record.label, href: record.href };
    if (!record.group || record.group === 'main') result.items.push(item);
    else {
      const parent = result.items.find((item) => item.id === record.group);
      if (parent) {
        parent.menu ??= 'submenu';
        (parent.children ??= []).push(item);
      }
    }
  }
  return result;
}
