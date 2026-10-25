import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { entryLanguage } from '@/content/entry-language';
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
  const language = entryLanguage(
    settings.localization.enabledLanguages,
    settings.localization.defaultLanguage,
    preferred,
  );
  redirect('/' + language);
}
