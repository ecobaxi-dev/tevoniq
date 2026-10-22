import Link from 'next/link';
import { notFound } from 'next/navigation';
import { localeSchema } from '@tevoniq/validation';
import { leadCopy } from '@/content/leads';
import { getLeadOptions } from '@/lib/lead-options';
import { getSiteSettings } from '@/lib/site-settings';
import { LeadForm } from './lead-form';
import './lead-form.css';
export async function ContactPage({
  locale: raw,
  type,
}: {
  locale: string;
  type: 'contact' | 'quote';
}) {
  const parsed = localeSchema.safeParse(raw);
  if (!parsed.success) notFound();
  const locale = parsed.data,
    copy = leadCopy[locale],
    quote = type === 'quote';
  const [options, settings] = await Promise.all([
    getLeadOptions(locale).catch(() => null),
    getSiteSettings(),
  ]);
  const address = [
    settings.contact.streetAddress,
    settings.contact.city,
    settings.contact.region,
    settings.contact.postalCode,
    settings.contact.country
      ? new Intl.DisplayNames([locale], { type: 'region' }).of(settings.contact.country)
      : '',
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <main id="main-content" className="lead-page">
      <header className="lead-hero">
        <p className="lead-eyebrow">TEVONIQ / {quote ? copy.sendQuote : copy.send}</p>
        <h1>{quote ? copy.quote : copy.contact}</h1>
        <p>{quote ? copy.quoteIntro : copy.contactIntro}</p>
      </header>
      <div className="lead-layout">
        <aside>
          <span className="lead-accent" />
          <h2>{copy.context}</h2>
          <p>{copy.contextBody}</p>
          <address className="lead-contact-details">
            {settings.general.legalCompanyName && (
              <p>
                <bdi>{settings.general.legalCompanyName}</bdi>
              </p>
            )}
            {settings.contact.email && (
              <a href={`mailto:${settings.contact.email}`}>
                <bdi>{settings.contact.email}</bdi>
              </a>
            )}
            {settings.contact.phone && (
              <a href={`tel:${settings.contact.phone.replace(/[^+\d]/g, '')}`}>
                <bdi>{settings.contact.phone}</bdi>
              </a>
            )}
            {address && <p>{address}</p>}
          </address>
          <Link href={`/${locale}/${quote ? 'contact' : 'request-quote'}`}>
            {quote ? copy.contactLink : copy.quoteLink}
          </Link>
        </aside>
        <section className="lead-card" aria-label={quote ? copy.sendQuote : copy.send}>
          {options ? (
            <LeadForm type={type} locale={locale} options={options} />
          ) : (
            <p role="alert">{copy.unavailable}</p>
          )}
        </section>
      </div>
    </main>
  );
}
