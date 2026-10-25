import type { Locale } from '@tevoniq/types';

/** Arabic is the public entry language; an explicitly consented preference wins. */
export function entryLanguage(
  enabledLanguages: readonly Locale[],
  configuredDefault: Locale,
  preferred = '',
): Locale {
  return (
    enabledLanguages.find((language) => language === preferred) ??
    (enabledLanguages.includes('ar') ? 'ar' : configuredDefault)
  );
}
