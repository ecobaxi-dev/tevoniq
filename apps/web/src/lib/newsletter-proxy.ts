import { trustedClientHeaders } from '@/lib/client-ip';
import { boundedRequestBody, RequestBodyError } from '@/lib/bounded-request-body';
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
    Object.assign(headers, trustedClientHeaders(request));
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
