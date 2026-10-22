import 'server-only';
import { cache } from 'react';
import { z } from 'zod';
import { articleListSchema, publicArticleSchema, taxonomySchema } from '@tevoniq/validation';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
async function request(path: string) {
  const response = await fetchPublicContent(`${env.API_URL}/insights${path}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Insights unavailable');
  return response.json() as Promise<unknown>;
}
export async function getInsights(query: Record<string, string>) {
  return articleListSchema.parse(await request(`?${new URLSearchParams(query)}`));
}
export const getInsight = cache(async (locale: string, slug: string) => {
  const result = await request(`/${encodeURIComponent(slug)}?locale=${locale}`);
  return result === null
    ? null
    : z
        .object({ article: publicArticleSchema, related: z.array(publicArticleSchema) })
        .parse(result);
});
export async function getInsightTaxonomies(locale: string) {
  return z
    .object({ items: z.array(taxonomySchema) })
    .parse(await request(`/taxonomies?locale=${locale}`)).items;
}
export async function allInsights(locale: string) {
  const items = [] as z.infer<typeof publicArticleSchema>[];
  let page = 1;
  while (true) {
    const result = await getInsights({ locale, page: String(page++), limit: '100' });
    items.push(...result.items);
    if (!result.items.length || items.length >= result.total) return items;
  }
}
