import { boundedRequestBody, RequestBodyError } from '@/lib/bounded-request-body';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { MAX_CV_BYTES } from '@tevoniq/validation';
import { env } from '@/lib/env';
export async function POST(request: Request) {
  const noStore = { 'Cache-Control': 'no-store' };
  if (request.headers.get('origin') !== new URL(env.SITE_URL).origin)
    return Response.json({ message: 'Invalid origin' }, { status: 403, headers: noStore });
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('multipart/form-data;'))
    return Response.json({ message: 'Expected form data' }, { status: 400, headers: noStore });
  try {
    const body = await boundedRequestBody(
      request.body,
      MAX_CV_BYTES + 100 * 1024,
      AbortSignal.timeout(60000),
    );
    const headers: Record<string, string> = {
      'Content-Type': type,
      Origin: new URL(env.SITE_URL).origin,
    };
    const trustedHeader = process.env.LEAD_CLIENT_IP_HEADER,
      secret = process.env.LEAD_PROXY_SECRET;
    const ip = trustedHeader ? request.headers.get(trustedHeader)?.trim() : undefined;
    if (ip && secret && isIP(ip)) {
      headers['x-lead-client-ip'] = ip;
      headers['x-lead-ip-signature'] = createHmac('sha256', secret).update(ip).digest('hex');
    }
    const response = await fetch(`${env.API_URL}/careers/apply`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    return Response.json(await response.json(), { status: response.status, headers: noStore });
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
      { status: 503, headers: noStore },
    );
  }
}
