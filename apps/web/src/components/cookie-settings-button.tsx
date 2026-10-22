'use client';
import type { Locale } from '@tevoniq/types';
import { cookieCopy } from '@/content/cookies';
export function CookieSettingsButton({ locale }: { locale: Locale }) {
  return (
    <button
      className="policy-cookie-button"
      type="button"
      onClick={() => window.dispatchEvent(new Event('tevoniq-open-cookie-settings'))}
    >
      {cookieCopy[locale].settings}
    </button>
  );
}
