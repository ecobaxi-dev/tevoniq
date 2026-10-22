import { forwardNewsletter } from '@/lib/newsletter-proxy';
export async function POST(request: Request) { return forwardNewsletter(request); }
