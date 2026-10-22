import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
export const dynamic = 'force-dynamic';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/auth/', '/health', '/design-system'],
    },
    sitemap: new URL('/sitemap.xml', env.SITE_URL).href,
  };
}
