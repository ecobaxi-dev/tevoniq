import 'server-only';
import { cache } from 'react';
import { pageDocumentSchema, type BuilderCard } from '@tevoniq/validation';
import { env } from './env';
import { fetchPublicContent } from './public-content-cache';
import { isRetiredPublicPath } from '@tevoniq/types';
export const getBuiltPage = cache(async (path: string, locale: string) => {
  if (isRetiredPublicPath(path)) return null;
  const response = await fetchPublicContent(
    `${env.API_URL}/pages/resolve?${new URLSearchParams({ path, locale })}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw Error('Page content is temporarily unavailable');
  const value = (await response.json()) as {
    id: string;
    document: unknown;
    cards: Record<string, BuilderCard[]>;
    turnstileSiteKey: string | null;
  };
  return { ...value, document: pageDocumentSchema.parse(value.document) };
});
export async function builtPageSitemap() {
  const response = await fetchPublicContent(`${env.API_URL}/pages/sitemap`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw Error('Page sitemap unavailable');
  return (
    (await response.json()) as { items: { path: string; locale: string; updatedAt: string }[] }
  ).items;
}
