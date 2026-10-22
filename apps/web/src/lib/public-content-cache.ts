import 'server-only';

/**
 * Published CMS content is shared by every visitor. Keep it in Next's data
 * cache briefly and clear it as soon as an editor saves through the CMS proxy.
 * Never use this helper for a request that can contain a session, PII, search
 * terms, form input, or any other visitor-specific value.
 */
export const PUBLIC_CONTENT_CACHE_TAG = 'cms-public-content';
export const PUBLIC_CONTENT_REVALIDATE_SECONDS = 300;

export function fetchPublicContent(input: string, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    next: {
      revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
      tags: [PUBLIC_CONTENT_CACHE_TAG],
    },
  });
}
