import { getSiteSettings } from '@/lib/site-settings';
/* eslint-disable @next/next/no-img-element -- Published company logo is a validated URL, rendered without an image proxy. */
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Github,
  Globe2,
} from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import { organizationSettingsSchema } from '@tevoniq/validation';
import type { NavigationContent } from '@/config/navigation';
import { getOrganization } from '@/lib/seo';
import { env } from '@/lib/env';
import { fetchPublicContent } from '@/lib/public-content-cache';
import { footerCopy, footerHref, configuredSocialLinks } from '@/content/footer';
import { BrandLogo } from './brand-image';
import { FooterLanguage, FooterNewsletter } from './footer-controls';
import './site-footer.css';

export async function SiteFooter({
  locale,
  navigation,
}: {
  locale: Locale;
  navigation: NavigationContent;
}) {
  const [settings, newsletter, publicSettings] = await Promise.all([
    getOrganization().catch(() => organizationSettingsSchema.parse({})),
    fetchPublicContent(env.API_URL + '/newsletter/config', {
      signal: AbortSignal.timeout(4000),
    })
      .then(async (r) => {
        if (!r.ok) return null;
        const data: unknown = await r.json();
        if (!data || typeof data !== 'object' || !('turnstileSiteKey' in data)) return null;
        return data.turnstileSiteKey === null || typeof data.turnstileSiteKey === 'string'
          ? { siteKey: data.turnstileSiteKey }
          : null;
      })
      .catch(() => null),
    getSiteSettings(),
  ]);
  const copy = footerCopy[locale],
    name = settings.companyName || 'TEVONIQ';
  const description =
    settings[
      (
        { en: 'footerDescriptionEn', tr: 'footerDescriptionTr', ar: 'footerDescriptionAr' } as const
      )[locale]
    ] || copy.description;
  const socials = configuredSocialLinks(settings.socialProfiles);
  const legal = [
    { id: 'privacy', label: copy.privacy, href: settings.privacyPolicyUrl || '/privacy-policy' },
    { id: 'terms', label: copy.terms, href: settings.termsUrl },
    { id: 'cookies', label: copy.cookies, href: settings.cookiePolicyUrl || '/cookie-policy' },
  ].map((link) => ({
    ...link,
    href:
      link.href ||
      navigation.items
        .find((item) => item.id === 'legal')
        ?.children?.find((item) => item.id === link.id)?.href ||
      '',
  }));
  const contact = navigation.items.find((item) => item.id === 'contact');
  const address = [
    settings.streetAddress,
    settings.addressLocality,
    settings.addressRegion,
    settings.postalCode,
    settings.addressCountry,
  ]
    .filter(Boolean)
    .join(', ');
  const icons = { LinkedIn: Linkedin, Instagram, Facebook, YouTube: Youtube, GitHub: Github };
  const renderLegal = () =>
    legal.map((item) => (
      <li key={item.id}>
        {item.href ? (
          <a href={footerHref(locale, item.href)}>{item.label}</a>
        ) : (
          <span className="footer-unconfigured">{item.label}</span>
        )}
      </li>
    ));
  return (
    <footer className="site-footer" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="site-footer-inner">
        <section className="footer-newsletter" aria-labelledby="footer-newsletter-title">
          <div>
            <p className="footer-eyebrow">{copy.eyebrow}</p>
            <h2 id="footer-newsletter-title">{copy.newsletter}</h2>
            <p className="footer-newsletter-text">{copy.newsletterText}</p>
          </div>
          <FooterNewsletter
            locale={locale}
            siteKey={newsletter?.siteKey || null}
            available={!!newsletter}
          />
        </section>
        <div className="footer-main">
          <div className="footer-brand">
            <a
              className="footer-brand-logo"
              href={footerHref(locale, '/')}
              aria-label={navigation.labels.home}
            >
              {publicSettings.brand.logoLight || settings.logo ? (
                <img
                  src={publicSettings.brand.logoLight || settings.logo}
                  alt={name}
                  width={176}
                  height={99}
                  loading="lazy"
                />
              ) : (
                <BrandLogo variant="horizontal" />
              )}
            </a>
            <p>{description}</p>
            {publicSettings.general.tagline && <p>{publicSettings.general.tagline}</p>}
            {!!socials.length && (
              <nav className="footer-social" aria-label={copy.social}>
                {socials.map((social) => {
                  const Icon = icons[social.name as keyof typeof icons] || Globe2;
                  return (
                    <a
                      key={social.href}
                      href={social.href}
                      aria-label={social.name}
                      title={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.name === 'X' ? (
                        <span aria-hidden="true" className="footer-x">
                          𝕏
                        </span>
                      ) : (
                        <Icon size={18} aria-hidden="true" />
                      )}
                    </a>
                  );
                })}
              </nav>
            )}
          </div>
          <nav className="footer-columns" aria-label={copy.footer}>
            {['solutions', 'services', 'company', 'insights'].map((id) => {
              const group = navigation.items.find((item) => item.id === id);
              if (!group) return null;
              return (
                <div className="footer-link-group" key={id}>
                  <h2>{id === 'insights' ? copy.resources : group.label}</h2>
                  <ul>
                    {(group.children?.length ? group.children : [group]).map((item) => (
                      <li key={item.id}>
                        <a href={footerHref(locale, item.href)}>{item.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <div className="footer-link-group">
              <h2>{copy.legal}</h2>
              <ul>{renderLegal()}</ul>
            </div>
            <div className="footer-link-group footer-contact">
              <h2>{copy.contact}</h2>
              <address>
                {publicSettings.contact.salesEmail && (
                  <a href={'mailto:' + publicSettings.contact.salesEmail}>
                    <bdi>{publicSettings.contact.salesEmail}</bdi>
                  </a>
                )}
                {publicSettings.contact.supportEmail && (
                  <a href={'mailto:' + publicSettings.contact.supportEmail}>
                    <bdi>{publicSettings.contact.supportEmail}</bdi>
                  </a>
                )}
                {publicSettings.contact.whatsApp && (
                  <a
                    href={'https://wa.me/' + publicSettings.contact.whatsApp.slice(1)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                )}
                {publicSettings.contact.latitude !== null &&
                  publicSettings.contact.longitude !== null && (
                    <a
                      href={
                        'https://www.google.com/maps?q=' +
                        publicSettings.contact.latitude +
                        ',' +
                        publicSettings.contact.longitude
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ en: 'View map', tr: 'Haritayı görüntüle', ar: 'عرض الخريطة' }[locale]}
                    </a>
                  )}
                {settings.email && (
                  <a href={'mailto:' + settings.email}>
                    <Mail size={16} aria-hidden="true" />
                    <bdi>{settings.email}</bdi>
                  </a>
                )}
                {settings.phone && (
                  <a href={'tel:' + settings.phone.replace(/[^+\d]/g, '')}>
                    <Phone size={16} aria-hidden="true" />
                    <bdi>{settings.phone}</bdi>
                  </a>
                )}
                {address && (
                  <p>
                    <MapPin size={16} aria-hidden="true" />
                    <span>{address}</span>
                  </p>
                )}
              </address>
              {contact && (
                <a className="footer-contact-cta" href={footerHref(locale, contact.href)}>
                  {copy.contactCta}
                  <ArrowUpRight size={17} className="tv-directional" aria-hidden="true" />
                </a>
              )}
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {settings.legalName || name}. {copy.rights}
          </p>
          <ul className="footer-legal-inline">{renderLegal()}</ul>
          <FooterLanguage
            locale={locale}
            enabledLanguages={publicSettings.localization.enabledLanguages}
          />
        </div>
      </div>
    </footer>
  );
}
