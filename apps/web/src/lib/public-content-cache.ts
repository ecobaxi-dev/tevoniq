import 'server-only';
import { pruneRetiredCatalog } from '@tevoniq/types';

/**
 * Published CMS content is shared by every visitor. Keep it in Next's data
 * cache briefly and clear it as soon as an editor saves through the CMS proxy.
 * Never use this helper for a request that can contain a session, PII, search
 * terms, form input, or any other visitor-specific value.
 */
export const PUBLIC_CONTENT_CACHE_TAG = 'cms-public-content';
export const PUBLIC_CONTENT_REVALIDATE_SECONDS = 300;

export async function fetchPublicContent(input: string, init: RequestInit = {}) {
  const response = await fetch(input, {
    ...init,
    next: {
      revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
      tags: [PUBLIC_CONTENT_CACHE_TAG],
    },
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('json')) return response;
  const value = pruneRetiredCatalog(await response.json());
  if (value === undefined) return new Response(null, { status: 404 });
  const headers = new Headers(response.headers);
  for (const name of ['content-length', 'content-encoding', 'etag']) headers.delete(name);
  return Response.json(value, { status: response.status, headers });
}
