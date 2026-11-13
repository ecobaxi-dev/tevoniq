import { trustedClientHeaders } from '@/lib/client-ip';
import { boundedRequestBody, RequestBodyError } from '@/lib/bounded-request-body';
import { env } from '@/lib/env';
const MAX_BODY = 7 * 1024 * 1024;
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(env.SITE_URL).origin)
    return Response.json({ message: 'Invalid origin' }, { status: 403 });
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('multipart/form-data;'))
    return Response.json({ message: 'Expected form data' }, { status: 400 });
  try {
    const body = await boundedRequestBody(request.body, MAX_BODY, AbortSignal.timeout(60000));
    const headers: Record<string, string> = {
      'Content-Type': type,
      Origin: new URL(env.SITE_URL).origin,
    };
    // Only enable this for a header overwritten by your trusted ingress; arbitrary forwarded headers are ignored.
    Object.assign(headers, trustedClientHeaders(request));
    const response = await fetch(`${env.API_URL}/leads/submit`, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
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
    return Response.json(
      { message: 'Unable to submit right now. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
