'use client';
import { useRef, useState } from 'react';
import { Input, Textarea, Checkbox, Button } from '@tevoniq/ui';
import { MAX_CV_BYTES, applicationSubmitSchema } from '@tevoniq/validation';
import { Turnstile } from '@/components/turnstile';
import { careersCopy } from '@/content/careers';
export function ApplicationForm({ slug, locale, siteKey }: { slug: string; locale: 'en' | 'tr' | 'ar'; siteKey: string | null }) {
  const copy = careersCopy[locale];
  const submissionId = useRef('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [sent, setSent] = useState(false), [token, setToken] = useState(''), [resetKey, setResetKey] = useState(0);
  if (sent) return <section id="apply" className="career-apply"><h2>{copy.apply}</h2><p role="status">{copy.success}</p></section>;
  return <section id="apply" className="career-apply"><h2>{copy.apply}</h2><p>{copy.privacy}</p>
    <form onSubmit={async (event) => {
      event.preventDefault(); if (busy) return;
      setError('');
      const form = new FormData(event.currentTarget), cv = form.get('cv');
      if (!(cv instanceof File) || !cv.size || cv.size > MAX_CV_BYTES || !/\.pdf$/i.test(cv.name)) { setError(copy.fileError); return; }
      submissionId.current ||= crypto.randomUUID();
      const payload = applicationSubmitSchema.safeParse({
        submissionId: submissionId.current, jobSlug: slug,
        ...Object.fromEntries(['name', 'email', 'phone', 'location', 'linkedIn', 'portfolio', 'coverLetter', 'website'].map((key) => [key, String(form.get(key) || '')])),
        consent: form.get('consent') === 'on', turnstileToken: token,
      });
      if (!payload.success) { setError(payload.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · ')); return; }
      setBusy(true);
      try {
        const body = new FormData(); body.set('payload', JSON.stringify(payload.data)); body.set('cv', cv);
        const response = await fetch('/api/careers/apply', { method: 'POST', body });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || copy.error);
        setSent(true);
      } catch (e) { setError(e instanceof Error ? e.message : copy.error); setToken(''); setResetKey((v) => v + 1); }
      finally { setBusy(false); }
    }}>
      <fieldset disabled={busy}>
        <div className="career-form-grid">
          <Input name="name" label={copy.name} autoComplete="name" maxLength={180} required />
          <Input name="email" label={copy.email} type="email" autoComplete="email" maxLength={254} required />
          <Input name="phone" label={copy.phone} type="tel" autoComplete="tel" maxLength={60} />
          <Input name="location" label={copy.location} autoComplete="address-level2" maxLength={180} required />
          <Input name="linkedIn" label={copy.linkedIn} type="url" maxLength={2048} placeholder="https://www.linkedin.com/in/…" />
          <Input name="portfolio" label={copy.portfolio} type="url" maxLength={2048} placeholder="https://…" />
        </div>
        <Textarea name="coverLetter" label={copy.coverLetter} maxLength={15000} rows={6} />
        <label className="career-file">{copy.cv}<input name="cv" type="file" accept="application/pdf,.pdf" required aria-describedby="cv-help" /></label>
        <p id="cv-help">{copy.cvHelp}</p>
        <div className="career-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <Checkbox name="consent" label={copy.consent} required />
        {siteKey && <Turnstile siteKey={siteKey} action="careers" onToken={setToken} resetKey={resetKey} />}
        {error && <p role="alert" className="career-error">{error}</p>}
        <Button type="submit" loading={busy} disabled={!!siteKey && !token}>{copy.submit}</Button>
      </fieldset>
    </form>
  </section>;
}
