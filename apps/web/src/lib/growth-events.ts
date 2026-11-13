import { growthPaths, growthFilms } from '../content/growth.ts';
export const leadMetricEvent = 'tevoniq:lead-received';
const safePaths = new Set([
  ...[
    'ai-augmented-development',
    'it-consulting',
    'digital-transformation',
    'custom-software-development',
    'software-product-engineering',
    'qa-automation',
    'mobile-application-development',
    'ui-ux-design',
    'business-automation',
    'erp-solutions',
    'iot-solutions',
    'ai-machine-learning',
    'cybersecurity',
    'network-infrastructure',
  ].map((slug) => `/services/${slug}`),
  ...growthPaths,
  ...growthFilms.map((film) => film.path),
  '/start',
  '/services',
  '/contact',
  '/request-quote',
  '/industries',
  '/insights',
  '/insights/blog',
  '/website-designs',
  '/work-systems',
  '/automation-demos',
  '/dashboard-demos',
]);
/** Do not send query values, visitor-entered text, contact details or unknown slugs. */
export function growthPage(pathname: string) {
  const path = pathname.split(/[?#]/)[0] || '/';
  const match = /^\/(ar|en|tr)(\/.*)?$/.exec(path);
  const locale = match?.[1] || 'other';
  const rest = match?.[2] || '/';
  const section = rest.split('/')[1] || 'home';
  const category = [
    'start',
    'services',
    'industries',
    'insights',
    'business',
    'guides',
    'website-designs',
    'work-systems',
    'automation-demos',
    'dashboard-demos',
    'showroom',
    'contact',
    'request-quote',
  ].includes(section)
    ? section
    : 'other';
  const safePath = safePaths.has(rest)
    ? rest
    : category === 'home'
      ? '/'
      : category === 'other'
        ? '/'
        : `/${category}`;
  return {
    locale,
    page_type: category,
    page_path: `/${locale}${safePath === '/' ? '' : safePath}`,
  };
}
export function growthLink(href: string, origin: string) {
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  const page = growthPage(url.pathname);
  if (
    ['website-designs', 'work-systems', 'automation-demos', 'dashboard-demos'].includes(
      page.page_type,
    )
  )
    return { event: 'demo_open', destination: page.page_path };
  if (page.page_type === 'contact' || page.page_type === 'request-quote')
    return { event: 'contact_open', destination: page.page_path };
  return null;
}

export function growthCampaign(search: string) {
  const query = new URLSearchParams(search);
  const allowed = {
    source: ['site', 'facebook', 'meta', 'google', 'linkedin', 'instagram', 'youtube', 'referral'],
    medium: ['social', 'paid_social', 'cpc', 'ppc', 'video', 'sector', 'guide', 'partner'],
    campaign: [
      'sme-start',
      'month1-website',
      'month1-requests',
      'month1-automation',
      'month1-dashboard',
      'professional-services',
      'small-retail',
      'business-website-cost',
      'when-to-replace-spreadsheets',
    ],
  };
  const result: Record<string, string> = {};
  for (const key of ['source', 'medium', 'campaign'] as const) {
    const value = query.get(`utm_${key}`);
    if (value && allowed[key].includes(value))
      result[key === 'campaign' ? 'campaign_name' : `campaign_${key}`] = value;
  }
  return result;
}
