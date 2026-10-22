import { getSiteSettings } from '@/lib/site-settings';
import { getAllSeoRoutes } from '@/lib/seo';
import { indexableRoute } from '@/lib/seo-core';
import { localeSchema } from '@tevoniq/validation';
import { getInsights } from '@/lib/insights';
import { insightsRss } from '@/lib/insight-format';
import { env } from '@/lib/env';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const locale = localeSchema.safeParse(new URL(request.url).searchParams.get('locale') || 'en');
  if (!locale.success) return new Response('Invalid language', { status: 400 });
  if (!(await getSiteSettings()).localization.enabledLanguages.includes(locale.data))
    return new Response('Language not enabled', { status: 404 });
  try {
    const [result, routes] = await Promise.all([
      getInsights({ locale: locale.data, limit: '100' }),
      getAllSeoRoutes(),
    ]);
    const allowed = new Set(
      routes
        .filter((r) => r.locale === locale.data && indexableRoute(r, env.SITE_URL))
        .map((r) => r.route),
    );
    result.items = result.items.filter((a) => allowed.has('/insights/blog/' + a.slug));
    return new Response(insightsRss(result.items, env.SITE_URL, locale.data), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response('Feed temporarily unavailable', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
