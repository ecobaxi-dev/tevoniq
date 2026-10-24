import { createHmac, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

const path = '/api/pesto/transport-check';
const candidates = ['cf-connecting-ip', 'true-client-ip', 'x-real-ip', 'x-forwarded-for'];
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

// A temporary operator diagnostic. It never calls the API, database or mail service.
export function checkPestoTransport(
  request: Request,
  config: { enabled: boolean; secret?: string | undefined; now?: number },
) {
  const reject = (status: number) =>
    Response.json({ code: 'transport_check_unavailable' }, { status, headers });
  if (!config.enabled || !config.secret || config.secret.length < 32) return reject(404);
  const url = new URL(request.url);
  const timestamp = request.headers.get('x-pesto-check-time') ?? '';
  const nonce = request.headers.get('x-pesto-check-nonce') ?? '';
  const signature = request.headers.get('x-pesto-check-signature') ?? '';
  if (
    request.method !== 'POST' ||
    url.pathname !== path ||
    url.search ||
    request.headers.has('origin') ||
    request.headers.has('cookie') ||
    request.headers.get('transfer-encoding') ||
    ![null, '0'].includes(request.headers.get('content-length')) ||
    !/^\d{10}$/.test(timestamp) ||
    !/^[a-f0-9]{64}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(signature) ||
    Math.abs((config.now ?? Date.now()) / 1000 - Number(timestamp)) > 120
  )
    return reject(403);
  const mac = (value: string) => createHmac('sha256', config.secret!).update(value).digest('hex');
  const context = `pesto-transport-v1\nPOST\n${path}\n${timestamp}\n${nonce}`;
  if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(mac(context), 'hex')))
    return reject(403);
  const observations = candidates.map((name) => {
    const raw = request.headers.get(name);
    // No raw client address or arbitrary reflected header is returned or logged.
    const values = raw !== null && raw.length <= 1024 ? raw.split(',').map((v) => v.trim()) : [];
    const singleIp = values.length === 1 && isIP(values[0]!) !== 0;
    return {
      name,
      present: raw !== null,
      count: values.length,
      singleIp,
      digest: singleIp ? mac(`pesto-transport-ip-v1\n${nonce}\n${name}\n${values[0]}`) : null,
    };
  });
  const payload = Buffer.from(
    JSON.stringify({ version: 1, nonce, timestamp, observations }),
  ).toString('base64');
  return Response.json(
    { payload, signature: mac(`pesto-transport-response-v1\n${payload}`) },
    { headers },
  );
}
