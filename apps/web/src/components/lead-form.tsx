'use client';
import { Heading } from '@tevoniq/ui';

import { useState, useRef, useCallback } from 'react';
import { Button, Input, Select, Textarea, Checkbox } from '@tevoniq/ui';
import { leadSubmissionSchema, leadCountries } from '@tevoniq/validation';
import type { LeadOptions } from '@/lib/lead-options';
import { leadCopy } from '@/content/leads';
import { leadMetricEvent } from '@/lib/growth-events';
import { Turnstile } from './turnstile';
export function LeadForm({
  type,
  locale,
  options,
  initialMessage,
}: {
  type: 'contact' | 'quote';
  locale: 'en' | 'tr' | 'ar';
  options: LeadOptions;
  initialMessage?: string | undefined;
}) {
  const copy = leadCopy[locale],
    quote = type === 'quote';
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [reference, setReference] = useState(''),
    [token, setToken] = useState(''),
    [resetKey, setResetKey] = useState(0),
    [country, setCountry] = useState(''),
    [method, setMethod] = useState('email');
  const countries = leadCountries(locale);
  const contactCopy =
    locale === 'ar'
      ? {
          select: 'اختر بلدك',
          invalid: 'أدخل رقم هاتف صالحًا للبلد المختار، أو استخدم رمز الاتصال الدولي +.',
          country: 'اختر بلدًا من القائمة.',
          hint: 'يمكنك إدخال الرقم المحلي للبلد المختار، أو رقم دولي يبدأ بـ +.',
        }
      : {
          select: 'Select your country',
          invalid:
            'Enter a valid number for your country, or include the international calling code +.',
          country: 'Select a country from the list.',
          hint: 'Enter a local number for your selected country, or an international number starting with +.',
        };
  const id = useRef(''),
    form = useRef<HTMLFormElement>(null);
  const onToken = useCallback((value: string) => setToken(value), []);
  if (reference)
    return (
      <section className="lead-success" role="status">
        <span aria-hidden="true">✓</span>
        <Heading as="h2" className="tv-h2">
          {copy.success}
        </Heading>
        <p>{copy.successBody}</p>
        <p className="lead-reference">
          {copy.reference}: <bdi dir="ltr">{reference}</bdi>
        </p>
      </section>
    );
  return (
    <form
      ref={form}
      className="lead-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        setError('');
        setErrors({});
        const data = new FormData(event.currentTarget);
        if (!id.current) id.current = crypto.randomUUID();
        const params = new URLSearchParams(window.location.search);
        const value = {
          submissionId: id.current,
          type,
          language: locale,
          ...Object.fromEntries(
            [
              'name',
              'company',
              'email',
              'phone',
              'country',
              'subject',
              'message',
              'industry',
              'projectType',
              'budgetRange',
              'timeline',
              'projectDescription',
              'website',
            ].map((key) => [key, String(data.get(key) || '')]),
          ),
          preferredContactMethod: quote ? 'email' : method,
          servicesInterested: data.getAll('servicesInterested'),
          consent: data.get('consent') === 'on',
          sourcePage: window.location.pathname,
          utm: Object.fromEntries(
            ['source', 'medium', 'campaign', 'term', 'content'].flatMap((key) =>
              params.has(`utm_${key}`) ? [[key, params.get(`utm_${key}`)]] : [],
            ),
          ),
          turnstileToken: token,
        };
        const parsed = leadSubmissionSchema.safeParse(value);
        if (!parsed.success) {
          setErrors(
            Object.fromEntries(
              parsed.error.issues.map((i) => [
                String(i.path[0]),
                locale !== 'tr' && i.path[0] === 'phone'
                  ? contactCopy.invalid
                  : locale !== 'tr' && i.path[0] === 'country'
                    ? contactCopy.country
                    : i.message,
              ]),
            ),
          );
          setError(copy.error);
          return;
        }
        if (options.turnstileSiteKey && !token) {
          setError(copy.verification);
          return;
        }
        const files = data
          .getAll('attachments')
          .filter((f): f is File => f instanceof File && f.size > 0);
        if (
          files.length > options.maxAttachments ||
          files.some(
            (f) =>
              f.size > options.maxAttachmentBytes ||
              !['application/pdf', 'image/png', 'image/jpeg'].includes(f.type),
          )
        ) {
          setError(copy.attachmentsHint);
          return;
        }
        const payload = new FormData();
        payload.set('payload', JSON.stringify(parsed.data));
        for (const file of files) payload.append('attachments', file);
        setBusy(true);
        try {
          const response = await fetch('/api/leads', { method: 'POST', body: payload });
          const result = (await response.json()) as { reference?: string; message?: string };
          if (!response.ok || !result.reference)
            throw new Error(typeof result.message === 'string' ? result.message : copy.error);
          window.dispatchEvent(new CustomEvent(leadMetricEvent, { detail: type }));
          setReference(result.reference);
        } catch (e) {
          setError(e instanceof Error ? e.message : copy.error);
          setToken('');
          setResetKey((k) => k + 1);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        <div className="lead-form-grid">
          {(
            [
              'name',
              'company',
              'email',
              ...(locale === 'tr' ? (['phone', 'country'] as const) : []),
            ] as const
          ).map((key) => (
            <Input
              key={key}
              name={key}
              label={copy[key]}
              type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
              autoComplete={
                {
                  name: 'name',
                  company: 'organization',
                  email: 'email',
                  phone: 'tel',
                  country: 'country-name',
                }[key]
              }
              required={
                ['name', 'email', 'country'].includes(key) ||
                (key === 'phone' && (quote || method === 'phone'))
              }
              maxLength={{ name: 120, company: 160, email: 254, phone: 50, country: 100 }[key]}
              {...(errors[key] ? { error: errors[key] } : {})}
            />
          ))}
          {locale !== 'tr' && (
            <>
              <Select
                name="country"
                label={copy.country}
                required
                autoComplete="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                {...(errors.country ? { error: errors.country } : {})}
              >
                <option value="">{contactCopy.select}</option>
                {countries.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} (+{item.callingCode})
                  </option>
                ))}
              </Select>
              <Input
                name="phone"
                label={copy.phone}
                type="tel"
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                maxLength={50}
                required={quote || method === 'phone'}
                hint={`${country ? '+' + countries.find((item) => item.code === country)?.callingCode + ' · ' : ''}${contactCopy.hint}`}
                {...(errors.phone ? { error: errors.phone } : {})}
              />
            </>
          )}
        </div>
        {quote ? (
          <>
            <div className="lead-form-grid">
              <Input label={copy.industry} name="industry" required maxLength={160} />
              <Input label={copy.projectType} name="projectType" required maxLength={160} />
              <Input label={copy.timeline} name="timeline" required maxLength={160} />
              {!!options.budgetRanges.length && (
                <Select label={copy.budgetRange} name="budgetRange">
                  <option value="">{copy.optional}</option>
                  {options.budgetRanges.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            {!!options.services.length && (
              <fieldset className="lead-service-options">
                <legend>{copy.servicesInterested}</legend>
                {options.services.map((service) => (
                  <Checkbox
                    key={service.id}
                    name="servicesInterested"
                    value={service.id}
                    label={service.title}
                  />
                ))}
              </fieldset>
            )}
            <Textarea
              label={copy.projectDescription}
              name="projectDescription"
              rows={7}
              required
              maxLength={15000}
            />
            {options.attachmentsEnabled && (
              <Input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                name="attachments"
                label={copy.attachments}
                hint={copy.attachmentsHint}
              />
            )}
            <Checkbox name="consent" label={copy.consent} required />
          </>
        ) : (
          <>
            <Input label={copy.subject} name="subject" required maxLength={200} />
            <Textarea
              label={copy.message}
              name="message"
              rows={7}
              required
              maxLength={10000}
              defaultValue={initialMessage}
            />
            <Select
              name="preferredContactMethod"
              label={copy.preferredContactMethod}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="email">{copy.email}</option>
              <option value="phone">{copy.phone}</option>
            </Select>
          </>
        )}
        <div className="lead-honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        {options.turnstileSiteKey && (
          <Turnstile
            siteKey={options.turnstileSiteKey}
            action={type}
            onToken={onToken}
            resetKey={resetKey}
          />
        )}
        {error && (
          <div role="alert" className="lead-error">
            <p>{error}</p>
            {Object.entries(errors).map(([field, message]) => (
              <p key={field}>
                {copy[field as keyof typeof copy] || field}: {message}
              </p>
            ))}
          </div>
        )}
        <p className="lead-privacy">{copy.privacy}</p>
        <Button type="submit" loading={busy}>
          {busy ? copy.sending : quote ? copy.sendQuote : copy.send}
        </Button>
      </fieldset>
    </form>
  );
}
