import { forwardPestoRegistration } from '@/lib/pesto-proxy';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  return forwardPestoRegistration(request, 'verify');
}
