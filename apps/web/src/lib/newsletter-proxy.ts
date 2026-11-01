import { boundedRequestBody, RequestBodyError } from '@/lib/bounded-request-body';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { env } from '@/lib/env';
export async function forwardNewsletter(request: Request, path = 'pages/newsletter') {
  if (request.headers.get('origin') !== new URL(env.SITE_URL).origin)
    return Response.json({ message: 'Invalid origin' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return Response.json({ message: 'Expected JSON' }, { status: 400 });
  try {
    const body = await boundedRequestBody(request.body, 8192);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Origin: new URL(env.SITE_URL).origin,
    };
    const trusted = process.env.LEAD_CLIENT_IP_HEADER,
      secret = process.env.LEAD_PROXY_SECRET,
      ip = trusted ? request.headers.get(trusted) : null;
    if (secret && ip && isIP(ip)) {
      headers['x-lead-client-ip'] = ip;
      headers['x-lead-ip-signature'] = createHmac('sha256', secret).update(ip).digest('hex');
    }
    const response = await fetch(`${env.API_URL}/${path}`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    return Response.json(await response.json(), {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof RequestBodyError)
      return Response.json(
        { message: 'Invalid, oversized or timed out request body' },
        {
          status: error.code === 'large' ? 413 : error.code === 'timeout' ? 408 : 400,
          headers: { 'Cache-Control': 'private, no-store' },
        },
      );
    return Response.json({ message: 'Subscription service unavailable' }, { status: 503 });
  }
}
