import { checkPestoTransport } from '@/lib/pesto-transport-check';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  return checkPestoTransport(request, {
    enabled: process.env.PESTO_TRANSPORT_DIAGNOSTICS_ENABLED === 'true',
    secret: process.env.LEAD_PROXY_SECRET,
  });
}
