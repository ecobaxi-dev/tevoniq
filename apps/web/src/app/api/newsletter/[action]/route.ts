import { forwardNewsletter } from '@/lib/newsletter-proxy';
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (!['subscribe', 'confirm', 'unsubscribe'].includes(action)) return new Response(null, { status: 404 });
  return forwardNewsletter(request, `newsletter/${action}`);
}
