'use client';
import { useCallback, useState } from 'react';
import type { SectionCopy, BuilderLocale } from '@tevoniq/validation';
import { Turnstile } from '@/components/turnstile';
export function NewsletterSection({
  copy,
  pageId,
  sectionId,
  locale,
  preview,
  siteKey,
}: {
  copy: SectionCopy<'Newsletter'>;
  pageId: string;
  sectionId: string;
  locale: BuilderLocale;
  preview: boolean;
  siteKey: string | null;
}) {
  const [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState(''),
    [token, setToken] = useState(''),
    [reset, setReset] = useState(0);
  const onToken = useCallback((v: string) => setToken(v), []);
  const label = { en: 'Email address', tr: 'E-posta adresi', ar: 'البريد الإلكتروني' }[locale],
    failure = {
      en: 'Unable to subscribe. Please try again.',
      tr: 'Abone olunamadı. Lütfen tekrar deneyin.',
      ar: 'تعذر الاشتراك. يرجى المحاولة مرة أخرى.',
    }[locale];
  if (done) return <p role="status">{{ en: 'If confirmation is needed, check your email to confirm your subscription.', tr: 'Onay gerekiyorsa aboneliğinizi onaylamak için e-postanızı kontrol edin.', ar: 'إذا كان التأكيد مطلوبًا، تحقق من بريدك الإلكتروني لتأكيد اشتراكك.' }[locale]}</p>;
  return (
    <form
      className="pb-newsletter"
      onSubmit={async (e) => {
        e.preventDefault();
        if (preview || busy) return;
        const data = new FormData(e.currentTarget);
        setBusy(true);
        setError('');
        try {
          const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageId,
              sectionId,
              locale,
              email: data.get('email'),
              name: data.get('name'),
              consent: data.get('consent') === 'on',
              website: data.get('website'),
              turnstileToken: token,
            }),
          });
          if (!response.ok) throw Error(failure);
          setDone(true);
        } catch {
          setError(failure);
          setToken('');
          setReset((n) => n + 1);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy || preview}>
        <label>{{ en: 'Name (optional)', tr: 'Ad (isteğe bağlı)', ar: 'الاسم (اختياري)' }[locale]}<input name="name" maxLength={180} autoComplete="name" /></label>
        <label>
          {label}
          <input type="email" name="email" required maxLength={254} autoComplete="email" />
        </label>
        <label className="pb-consent">
          <input type="checkbox" name="consent" required />
          {copy.consentLabel}
        </label>
        <label className="pb-honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        {siteKey && !preview && (
          <Turnstile siteKey={siteKey} action="newsletter" onToken={onToken} resetKey={reset} />
        )}
        <button className="pb-button" type="submit">
          {busy ? '…' : copy.buttonLabel || 'Subscribe'}
        </button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      {preview && <small>Preview only — subscriptions are disabled.</small>}
    </form>
  );
}
