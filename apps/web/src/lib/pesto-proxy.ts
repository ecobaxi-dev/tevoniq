import 'server-only';
import { env } from '@/lib/env';
import { forwardPesto, type PestoOperation } from './pesto-proxy-core';

export function forwardPestoRegistration(request: Request, operation: PestoOperation) {
  return forwardPesto(request, operation, {
    enabled:
      process.env.PESTO_PUBLIC_ENROLLMENT_ENABLED === 'true' &&
      (operation !== 'activate' || process.env.PESTO_PUBLIC_PURCHASE_ENABLED === 'true'),
    siteUrl: env.SITE_URL,
    apiUrl: env.API_URL,
    ipHeader: process.env.PESTO_CLIENT_IP_HEADER,
    proxySecret: process.env.LEAD_PROXY_SECRET,
  });
}
