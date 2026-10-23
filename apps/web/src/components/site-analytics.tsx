'use client';
import { Heading } from '@tevoniq/ui';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Modal, UIProvider } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import type { PublicSiteSettings } from '@tevoniq/validation';
import { footerHref } from '@/content/footer';
import { cookieCopy } from '@/content/cookies';
import {
  CONSENT_KEY,
  allConsent,
  necessaryOnly,
  consentFingerprint,
  consentPermissions,
  permittedProviders,
  readConsent,
  type ConsentCategories,
  type ConsentRecord,
} from '@/lib/cookie-consent';
import { browserConsent, storeConsent, clearOptionalStorage } from '@/lib/cookie-storage';
import './site-analytics.css';
export function SiteAnalytics({
  analytics,
  legal,
  locale,
  nonce,
}: {
  analytics: PublicSiteSettings['analytics'];
  legal: PublicSiteSettings['legal'];
  locale: Locale;
  nonce?: string | undefined;
}) {
  const labels = cookieCopy[locale],
    pathname = usePathname();
  const fingerprint = consentFingerprint(analytics, legal);
  const [record, setRecord] = useState<ConsentRecord | null>(null),
    [loaded, setLoaded] = useState(false),
    [open, setOpen] = useState(false),
    [storageError, setStorageError] = useState(false);
  const [draft, setDraft] = useState<ConsentCategories>(necessaryOnly);
  const previousFingerprint = useRef(fingerprint),
    visitConsent = useRef<ConsentRecord | null>(null),
    running = useRef(permittedProviders(analytics, necessaryOnly));
  const currentRecord = record?.fingerprint === fingerprint ? record : null;
  const permissions = consentPermissions(currentRecord, legal);
  const sensitive = pathname.includes('/newsletter/');
  const providers = permittedProviders(
    analytics,
    loaded && !sensitive ? permissions : necessaryOnly,
  );
  useEffect(() => {
    if (
      previousFingerprint.current !== fingerprint &&
      Object.values(running.current).some(Boolean)
    ) {
      window.location.reload();
      return;
    }
    previousFingerprint.current = fingerprint;
    function synchronize() {
      const next =
          (visitConsent.current &&
            readConsent(JSON.stringify(visitConsent.current), fingerprint)) ||
          browserConsent(fingerprint),
        nextPermissions = consentPermissions(next, legal),
        nextProviders = permittedProviders(analytics, nextPermissions);
      if (
        Object.keys(running.current).some(
          (k) =>
            running.current[k as keyof typeof nextProviders] &&
            !nextProviders[k as keyof typeof nextProviders],
        )
      ) {
        clearOptionalStorage(nextPermissions);
        window.location.reload();
        return;
      }
      setRecord(next);
      setLoaded(true);
    }
    synchronize();
    const storage = (event: StorageEvent) => {
      if (event.key === CONSENT_KEY || event.key === null) synchronize();
    };
    const focus = () => synchronize();
    window.addEventListener('storage', storage);
    window.addEventListener('focus', focus);
    const timer = window.setInterval(synchronize, 60000);
    return () => {
      window.removeEventListener('storage', storage);
      window.removeEventListener('focus', focus);
      clearInterval(timer);
    };
  }, [fingerprint, analytics, legal]);
  useEffect(() => {
    if (sensitive && Object.values(running.current).some(Boolean)) {
      window.location.reload();
      return;
    }
    running.current = providers;
  }, [sensitive, providers]);
  const privacy = footerHref(locale, legal.privacyPolicyUrl || '/privacy-policy'),
    policy = footerHref(locale, legal.cookiePolicyUrl || '/cookie-policy');
  function save(categories: ConsentCategories) {
    const now = Date.now(),
      next: ConsentRecord = {
        version: 1,
        categories: { ...categories, necessary: true },
        fingerprint,
        updatedAt: now,
        expiresAt: now + legal.cookieConsentDays * 86400000,
      };
    const stored = storeConsent(next);
    visitConsent.current = stored ? null : next;
    setStorageError(!stored);
    clearOptionalStorage(categories);
    const allowed = permittedProviders(analytics, categories);
    const revoke = Object.keys(running.current).some(
      (k) => running.current[k as keyof typeof allowed] && !allowed[k as keyof typeof allowed],
    );
    setRecord(next);
    setOpen(false);
    if (revoke) {
      // Even if all storage is blocked, the URL opt-out survives this reload and keeps scripts off.
      const url = new URL(window.location.href);
      if (!stored) url.searchParams.set('optionalCookies', 'off');
      window.location.replace(url.href);
    }
  }
  useEffect(() => {
    const reopen = () => {
      setDraft(currentRecord?.categories || necessaryOnly);
      setOpen(true);
    };
    window.addEventListener('tevoniq-open-cookie-settings', reopen);
    return () => window.removeEventListener('tevoniq-open-cookie-settings', reopen);
  }, [currentRecord]);
  const optOut =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('optionalCookies') === 'off';
  const notice =
    legal[
      ({ en: 'cookieNoticeEn', tr: 'cookieNoticeTr', ar: 'cookieNoticeAr' } as const)[locale]
    ] || labels.notice;
  return (
    <UIProvider theme="dark" direction={locale === 'ar' ? 'rtl' : 'ltr'}>
      {!optOut && (
        <>
          {providers.googleTagManager && (
            <Script
              nonce={nonce}
              id="site-gtm"
              strategy="afterInteractive"
            >{`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});var gtm=document.createElement('script');gtm.async=true;gtm.src='https://www.googletagmanager.com/gtm.js?id=${analytics.googleTagManager}';document.head.appendChild(gtm);`}</Script>
          )}
          {providers.googleAnalytics && (
            <>
              <Script
                nonce={nonce}
                src={`https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalytics}`}
                strategy="afterInteractive"
              />
              <Script
                nonce={nonce}
                id="site-ga"
                strategy="afterInteractive"
              >{`window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config','${analytics.googleAnalytics}');`}</Script>
            </>
          )}
          {providers.microsoftClarity && (
            <Script
              nonce={nonce}
              id="site-clarity"
              strategy="afterInteractive"
            >{`window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments);};var clarityScript=document.createElement('script');clarityScript.async=true;clarityScript.src='https://www.clarity.ms/tag/${analytics.microsoftClarity}';document.head.appendChild(clarityScript);`}</Script>
          )}
          {providers.metaPixel && (
            <Script
              nonce={nonce}
              id="site-meta"
              strategy="afterInteractive"
            >{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');window.fbq('init','${analytics.metaPixel}');window.fbq('track','PageView');`}</Script>
          )}
        </>
      )}
      <Modal
        title={labels.settings}
        description={labels.stored}
        closeLabel={labels.close}
        open={open}
        onOpenChange={(value) => {
          if (value) setDraft(currentRecord?.categories || necessaryOnly);
          setOpen(value);
        }}
        trigger={
          <button className="site-cookie-preferences" type="button">
            {labels.settings}
          </button>
        }
        footer={
          <div className="cookie-actions">
            <button type="button" onClick={() => save(necessaryOnly)}>
              {labels.reject}
            </button>
            <button type="button" onClick={() => save(draft)}>
              {labels.save}
            </button>
          </div>
        }
      >
        {legal.privacyInformation && (
          <section aria-label={labels.privacy}>
            <Heading as="h3">{labels.privacy}</Heading>
            <p style={{ whiteSpace: 'pre-line' }}>{legal.privacyInformation}</p>
          </section>
        )}
        {legal.cookiePolicyInformation && (
          <section aria-label={labels.policy}>
            <Heading as="h3">{labels.policy}</Heading>
            <p style={{ whiteSpace: 'pre-line' }}>{legal.cookiePolicyInformation}</p>
          </section>
        )}
        <div className="cookie-categories">
          {(['necessary', 'analytics', 'marketing', 'preferences'] as const).map((category) => (
            <label className="cookie-category" key={category}>
              <span>
                <strong>{labels[category]}</strong>
                <span>{labels[`${category}Text`]}</span>
                {category === 'necessary' && <em>{labels.always}</em>}
              </span>
              <input
                type="checkbox"
                aria-label={labels[category]}
                checked={draft[category]}
                disabled={category === 'necessary'}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    [category]: e.target.checked,
                    necessary: true,
                  }))
                }
              />
            </label>
          ))}
        </div>
        <div className="cookie-policy-links">
          <a href={privacy}>{labels.privacy}</a>
          <a href={policy}>{labels.policy}</a>
        </div>
      </Modal>
      {loaded && !currentRecord && !open && (
        <section className="site-cookie-banner" aria-label={labels.settings}>
          <div>
            <Heading as="h2">{labels.title}</Heading>
            <p>{notice}</p>
            <div className="cookie-policy-links">
              <a href={privacy}>{labels.privacy}</a>
              <a href={policy}>{labels.policy}</a>
            </div>
          </div>
          <div className="cookie-actions">
            <button type="button" onClick={() => save(necessaryOnly)}>
              {labels.reject}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(necessaryOnly);
                setOpen(true);
              }}
            >
              {labels.manage}
            </button>
            <button type="button" onClick={() => save(allConsent)}>
              {labels.accept}
            </button>
          </div>
        </section>
      )}
      {storageError && (
        <p className="cookie-storage-note" role="status">
          {labels.storageError}
        </p>
      )}
    </UIProvider>
  );
}
