import { type NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const development = process.env.NODE_ENV === 'development';
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://www.facebook.com https://connect.facebook.net https://challenges.cloudflare.com${development ? ' ws: http://localhost:*' : ''}`,
    'frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com',
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  response.headers.set('Cache-Control', 'private, no-store');
  if (new URL(process.env.SITE_URL || request.url).protocol === 'https:')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  if (/^\/(?:admin|auth)(?:\/|$)/.test(request.nextUrl.pathname))
    response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
export const config = {
  matcher: ['/((?!api/|_next/|media/|brand/|fonts/|favicon.ico|robots.txt|sitemap.xml|rss.xml).*)'],
};
