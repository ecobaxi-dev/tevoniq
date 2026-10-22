import { CONSENT_COOKIE, CONSENT_KEY, readConsent, type ConsentRecord } from './cookie-consent';
export function browserConsent(fingerprint: string) {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(CONSENT_KEY);
  } catch {
    /* Storage may be unavailable. */
  }
  const local = readConsent(stored, fingerprint);
  if (local) return local;
  try {
    const cookie = document.cookie.split('; ').find((v) => v.startsWith(CONSENT_COOKIE + '='));
    return readConsent(
      cookie ? decodeURIComponent(cookie.slice(CONSENT_COOKIE.length + 1)) : null,
      fingerprint,
    );
  } catch {
    return null;
  }
}
export function storeConsent(record: ConsentRecord) {
  let stored = false;
  const value = JSON.stringify(record);
  try {
    localStorage.setItem(CONSENT_KEY, value);
    stored = true;
  } catch {
    /* Try a first-party cookie below. */
  }
  try {
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${Math.max(0, Math.floor((record.expiresAt - Date.now()) / 1000))}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    stored = stored || document.cookie.includes(CONSENT_COOKIE + '=');
  } catch {
    /* Current-document choice still works. */
  }
  window.dispatchEvent(new CustomEvent('tevoniq-consent-change', { detail: record.categories }));
  return stored;
}
function clearCookie(name: string) {
  const paths = new Set([
    '/',
    ...location.pathname.split('/').map((_, i, a) => a.slice(0, i + 1).join('/') || '/'),
  ]);
  const parts = location.hostname.split('.');
  const domains = [
    '',
    ...parts.map((_, i) => parts.slice(i).join('.')).filter((v) => v.includes('.')),
  ];
  for (const path of paths)
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; Path=${path}; SameSite=Lax${domain ? '; Domain=' + domain : ''}`;
}
export function clearOptionalStorage(categories: {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}) {
  for (const item of document.cookie.split('; ')) {
    const name = item.split('=')[0] || '';
    if (
      (!categories.analytics && /^(_ga(?:_|$)|_gid$|_gat|_clck$|_clsk$)/.test(name)) ||
      (!categories.marketing && /^(_fbp$|_fbc$)/.test(name)) ||
      (!categories.preferences && name === 'tevoniq_language')
    )
      clearCookie(name);
  }
  if (!categories.preferences)
    try {
      localStorage.removeItem('tevoniq-preferred-language');
    } catch {
      /* Storage unavailable. */
    }
}
export function rememberPreferredLanguage(language: string) {
  if (!['en', 'tr', 'ar'].includes(language)) return;
  try {
    const cookie = document.cookie.split('; ').find((v) => v.startsWith(CONSENT_COOKIE + '='));
    const raw =
      localStorage.getItem(CONSENT_KEY) ||
      (cookie ? decodeURIComponent(cookie.slice(CONSENT_COOKIE.length + 1)) : null);
    if (!raw) return;
    const record = JSON.parse(raw);
    const consent = readConsent(raw, record.fingerprint);
    if (!consent?.categories.preferences) return;
    localStorage.setItem('tevoniq-preferred-language', language);
    document.cookie = `tevoniq_language=${language}; Path=/; Max-Age=${Math.max(0, Math.floor((consent.expiresAt - Date.now()) / 1000))}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  } catch {
    /* Language switching remains available without optional storage. */
  }
}
