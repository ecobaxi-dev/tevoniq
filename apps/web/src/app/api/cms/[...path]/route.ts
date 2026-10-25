import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { PUBLIC_CONTENT_CACHE_TAG } from '@/lib/public-content-cache';
const COOKIE = 'tevoniq_cms_session';
const MAX_BODY = 100 * 1024;
async function bodyText(request: Request, upload = false): Promise<string | ArrayBuffer> {
  if (
    !request.headers
      .get('content-type')
      ?.startsWith(upload ? 'multipart/form-data;' : 'application/json')
  )
    throw new Error('Expected JSON');
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > (upload ? 51 * 1024 * 1024 : MAX_BODY)) {
      await reader.cancel();
      throw new Error('Body too large');
    }
    chunks.push(value);
  }
  return upload
    ? new Uint8Array(Buffer.concat(chunks)).buffer
    : Buffer.concat(chunks).toString('utf8');
}
async function handle(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const route = path.join('/');
  const method = request.method;
  const allowed =
    (method === 'GET' &&
      /^pesto\/customers(?:\/(?:verified|pending)\/[a-f0-9-]{36})?$/.test(route)) ||
    ((method === 'GET' || method === 'POST') && route === 'pesto/purchases') ||
    (method === 'POST' && /^pesto\/purchases\/[a-f0-9-]{36}\/revoke$/.test(route)) ||
    ((method === 'GET' || method === 'PUT') && route === 'site-settings') ||
    (method === 'GET' && /^newsletter(?:\/export)?$/.test(route)) ||
    (method === 'PUT' && /^newsletter\/[a-f0-9-]{36}$/.test(route)) ||
    (method === 'GET' &&
      /^careers\/(?:jobs(?:\/[a-f0-9-]{36})?|applications(?:\/[a-f0-9-]{36}(?:\/(?:history|cv))?)?)$/.test(
        route,
      )) ||
    (method === 'POST' && /^careers\/(?:jobs|applications\/[a-f0-9-]{36}\/notes)$/.test(route)) ||
    (method === 'PUT' &&
      /^careers\/(?:jobs\/[a-f0-9-]{36}|applications\/[a-f0-9-]{36}\/status)$/.test(route)) ||
    (method === 'GET' && route === 'auth/sessions') ||
    (method === 'POST' &&
      /^auth\/(forgot-password|reset-password|logout-all|(?:sessions|users)\/[a-f0-9-]{36}\/revoke)$/.test(
        route,
      )) ||
    (method === 'GET' && /^media-library(?:\/[a-f0-9-]{36})?$/.test(route)) ||
    (method === 'POST' && /^media-library\/(?:upload|[a-f0-9-]{36}\/state)$/.test(route)) ||
    (method === 'PUT' && /^media-library\/[a-f0-9-]{36}$/.test(route)) ||
    (method === 'GET' && /^page-builder(?:\/options|\/[a-f0-9-]{36})?$/.test(route)) ||
    (method === 'POST' && /^page-builder(?:\/preview|\/[a-f0-9-]{36}\/state)?$/.test(route)) ||
    (method === 'PUT' && /^page-builder\/[a-f0-9-]{36}$/.test(route)) ||
    (method === 'POST' && route === 'leads/bulk') ||
    (method === 'GET' &&
      /^leads(?:\/settings|\/[a-f0-9-]{36}(?:\/activity|\/attachments\/[a-f0-9-]{36})?)?$/.test(
        route,
      )) ||
    (method === 'PUT' && /^leads\/(settings|[a-f0-9-]{36})$/.test(route)) ||
    (method === 'POST' && /^leads\/[a-f0-9-]{36}\/(notes|archive|retry-email)$/.test(route)) ||
    (method === 'GET' &&
      /^admin\/(dashboard|references|users|roles|audit|search|trash|records\/[a-z-]+)$/.test(
        route,
      )) ||
    (method === 'POST' &&
      /^admin\/(users|records\/[a-z-]+(?:\/bulk)?|restore\/[a-z]+\/[a-f0-9-]{36})$/.test(route)) ||
    (method === 'PUT' &&
      /^admin\/(users\/[a-f0-9-]{36}|records\/[a-z-]+\/[a-f0-9-]{36})$/.test(route)) ||
    (method === 'GET' && /^insights(?:\/taxonomies|\/[a-f0-9-]{36})?$/.test(route)) ||
    (method === 'POST' && /^insights(?:\/taxonomies)?$/.test(route)) ||
    (method === 'PUT' && /^insights\/(?:taxonomies\/)?[a-f0-9-]{36}$/.test(route)) ||
    ((method === 'GET' || method === 'PUT') &&
      /^company\/(about|why-tevoniq|team|partners|careers)$/.test(route)) ||
    (method === 'GET' &&
      /^(auth\/me|services(?:\/[a-f0-9-]{36})?|(?:solutions|industries|projects)(?:\/[a-f0-9-]{36}(?:\/(preview|audit))?)?)$/.test(
        route,
      )) ||
    (method === 'POST' &&
      /^(auth\/(login|logout)|services|solutions|industries|projects)$/.test(route)) ||
    ((method === 'PUT' || method === 'DELETE') &&
      /^(services|solutions|industries|projects)\/[a-f0-9-]{36}$/.test(route));
  if (!allowed && !((method === 'GET' || method === 'PUT') && /^home\/(en|tr|ar)$/.test(route)))
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  if (method !== 'GET' && request.headers.get('origin') !== new URL(env.SITE_URL).origin)
    return NextResponse.json({ message: 'Invalid request origin' }, { status: 403 });
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!['auth/login', 'auth/forgot-password', 'auth/reset-password'].includes(route) && !token)
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const upload = route === 'media-library/upload';
  let body: string | ArrayBuffer | undefined;
  if (method !== 'GET') {
    try {
      body = await bodyText(request, upload);
    } catch {
      return NextResponse.json({ message: 'Invalid or oversized JSON body' }, { status: 400 });
    }
  }
  try {
    const trusted = process.env.LEAD_CLIENT_IP_HEADER;
    const secret = process.env.LEAD_PROXY_SECRET;
    const ip = trusted ? request.headers.get(trusted)?.trim() : undefined;
    const clientHeaders: Record<string, string> = {};
    if (secret && ip && isIP(ip)) {
      clientHeaders['x-lead-client-ip'] = ip;
      clientHeaders['x-lead-ip-signature'] = createHmac('sha256', secret).update(ip).digest('hex');
    }
    const result = await fetch(`${env.API_URL}/cms/${route}${new URL(request.url).search}`, {
      method,
      headers: {
        ...clientHeaders,
        'Content-Type': upload ? request.headers.get('content-type')! : 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body } : {}),
      cache: 'no-store',
      signal: AbortSignal.timeout(upload ? 60000 : 10000),
    });
    if (
      result.ok &&
      (/^leads\/[a-f0-9-]{36}\/attachments\/[a-f0-9-]{36}$/.test(route) ||
        /^careers\/applications\/[a-f0-9-]{36}\/cv$/.test(route))
    ) {
      return new NextResponse(await result.arrayBuffer(), {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': result.headers.get('content-disposition') || 'attachment',
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "sandbox; default-src 'none'",
        },
      });
    }
    if (route === 'newsletter/export' && result.ok) {
      return new NextResponse(await result.text(), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"',
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    const payload = (await result.json()) as Record<string, unknown>;
    let response: NextResponse;
    // This BFF route is the editor's write path. A publish or unpublish must
    // be visible on the next public request, so do a blocking expiration
    // rather than serving stale-while-revalidate content after a write.
    if (method !== 'GET' && result.ok && !route.startsWith('auth/') && !route.startsWith('pesto/'))
      revalidateTag(PUBLIC_CONTENT_CACHE_TAG, { expire: 0 });
    if (route === 'auth/login' && result.ok) {
      if (typeof payload.token !== 'string' || !/^[a-f0-9]{64}$/.test(payload.token))
        throw new Error('Invalid session');
      response = NextResponse.json({ ok: true });
      response.cookies.set(COOKIE, payload.token, {
        httpOnly: true,
        secure: new URL(env.SITE_URL).protocol === 'https:',
        sameSite: 'strict',
        path: '/api/cms',
        maxAge: 8 * 3600,
      });
    } else response = NextResponse.json(payload, { status: result.status });
    if (
      (['auth/logout', 'auth/logout-all', 'auth/reset-password'].includes(route) && result.ok) ||
      result.status === 401
    )
      response.cookies.set(COOKIE, '', {
        httpOnly: true,
        sameSite: 'strict',
        secure: new URL(env.SITE_URL).protocol === 'https:',
        path: '/api/cms',
        maxAge: 0,
      });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    return NextResponse.json(
      { message: 'CMS API is unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
