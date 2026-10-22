'use client';
import { rememberPreferredLanguage } from '@/lib/cookie-storage';
import { useCallback, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Globe2, Check } from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import { footerCopy } from '@/content/footer';
import { Turnstile } from './turnstile';

export function FooterLanguage({
  locale,
  enabledLanguages = ['en', 'tr', 'ar'],
}: {
  locale: Locale;
  enabledLanguages?: Locale[];
}) {
  const pathname = usePathname(),
    router = useRouter();
  return (
    <label className="footer-language">
      <Globe2 size={17} aria-hidden="true" />
      <span className="tv-sr-only">{footerCopy[locale].language}</span>
      <select
        value={locale}
        onChange={(e) => {
          const language = e.target.value;
          if (!enabledLanguages.includes(language as Locale)) return;
          rememberPreferredLanguage(language);
          router.push(
            pathname.replace(/^\/(en|tr|ar)(?=\/|$)/, '/' + language) +
              window.location.search +
              window.location.hash,
          );
        }}
      >
        {enabledLanguages.map((language) => (
          <option key={language} value={language} lang={language}>
            {{ en: 'English', tr: 'Türkçe', ar: 'العربية' }[language]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FooterNewsletter({
  locale,
  siteKey,
  available,
}: {
  locale: Locale;
  siteKey: string | null;
  available: boolean;
}) {
  const copy = footerCopy[locale];
  const [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState('');
  const [token, setToken] = useState(''),
    [reset, setReset] = useState(0);
  const onToken = useCallback((value: string) => setToken(value), []);
  if (done)
    return (
      <p className="footer-success" role="status">
        <Check size={20} aria-hidden="true" />
        {copy.success}
      </p>
    );
  return (
    <form
      className="footer-newsletter-form"
      aria-label={copy.newsletter}
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || !available) return;
        const data = new FormData(e.currentTarget);
        setBusy(true);
        setError('');
        try {
          const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.get('email'),
              language: locale,
              source: 'footer',
              consent: data.get('consent') === 'on',
              website: data.get('website'),
              turnstileToken: token,
            }),
          });
          if (!response.ok) throw new Error('Subscription failed');
          setDone(true);
        } catch {
          setError(copy.error);
          setToken('');
          setReset((n) => n + 1);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy || !available}>
        <label className="tv-sr-only" htmlFor="footer-email">
          {copy.email}
        </label>
        <div className="footer-email-row">
          <input
            id="footer-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder={copy.placeholder}
            dir="auto"
          />
          <button type="submit" disabled={!!siteKey && !token} aria-busy={busy}>
            {busy ? '…' : copy.subscribe}
            <ArrowRight size={18} aria-hidden="true" className="tv-directional" />
          </button>
        </div>
        <label className="footer-consent">
          <input type="checkbox" name="consent" required />
          <span>{copy.consent}</span>
        </label>
        <label className="footer-honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        {siteKey && (
          <Turnstile siteKey={siteKey} action="newsletter" onToken={onToken} resetKey={reset} />
        )}
      </fieldset>
      {!available && (
        <p className="footer-form-message" role="status">
          {copy.unavailable}
        </p>
      )}
      {error && (
        <p className="footer-form-message" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
