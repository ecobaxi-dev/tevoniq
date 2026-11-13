import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

/** Configure only a header overwritten by the trusted ingress. Never forward caller-supplied signatures. */
export function trustedClientHeaders(
  request: Request,
  config: Record<string, string | undefined> = process.env,
): Record<string, string> {
  const header = config.LEAD_CLIENT_IP_HEADER?.toLowerCase();
  const secret = config.LEAD_PROXY_SECRET;
  if (!header || !/^[a-z0-9-]+$/.test(header) || !secret || secret.length < 32) return {};
  const raw = request.headers.get(header)?.trim();
  if (!raw) return {};
  let ip = raw;
  if (header === 'x-forwarded-for') {
    // Explicit trusted hop count only; do not guess which part of an arbitrary chain is safe.
    const hops = Number(config.LEAD_TRUSTED_PROXY_HOPS);
    const chain = raw.split(',').map((value) => value.trim());
    if (
      !Number.isInteger(hops) ||
      hops < 1 ||
      hops > 10 ||
      chain.length < hops ||
      chain.some((value) => !isIP(value))
    )
      return {};
    ip = chain[chain.length - hops]!;
  }
  if (!isIP(ip)) return {};
  return {
    'x-lead-client-ip': ip,
    'x-lead-ip-signature': createHmac('sha256', secret).update(ip).digest('hex'),
  };
}
