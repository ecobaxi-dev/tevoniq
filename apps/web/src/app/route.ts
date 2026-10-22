import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSiteSettings } from '@/lib/site-settings';
import { CONSENT_COOKIE, readConsent, consentFingerprint } from '@/lib/cookie-consent';
export async function GET() {
  const settings = await getSiteSettings(),
    jar = await cookies();
  let preferred = '';
  try {
    const raw = jar.get(CONSENT_COOKIE)?.value;
    const consent = readConsent(
      raw ? decodeURIComponent(raw) : null,
      consentFingerprint(settings.analytics, settings.legal),
    );
    if (consent?.categories.preferences) preferred = jar.get('tevoniq_language')?.value || '';
  } catch {
    /* Ignore malformed preference cookies. */
  }
  const language =
    settings.localization.enabledLanguages.find((l) => l === preferred) ||
    settings.localization.defaultLanguage;
  redirect('/' + language);
}
