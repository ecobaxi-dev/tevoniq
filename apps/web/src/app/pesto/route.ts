import { getSiteSettings } from '@/lib/site-settings';

export async function GET(request: Request) {
  const settings = await getSiteSettings();
  return new Response(null, {
    status: 307,
    headers: {
      Location: `/${settings.localization.defaultLanguage}/pesto${new URL(request.url).search}`,
    },
  });
}
