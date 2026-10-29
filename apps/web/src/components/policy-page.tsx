import { Heading } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import { assistantConfig } from '@/lib/site-assistant-core';
import { env } from '@/lib/env';
import { getSiteSettings } from '@/lib/site-settings';
import { cookieCopy } from '@/content/cookies';
import { CookieSettingsButton } from './cookie-settings-button';
import './policy-page.css';
export async function PolicyPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: 'privacy' | 'cookies';
}) {
  const settings = await getSiteSettings(),
    copy = cookieCopy[locale];
  const providers = [
    ['Google Analytics', settings.analytics.googleAnalytics],
    ['Microsoft Clarity', settings.analytics.microsoftClarity],
    ['Meta Pixel', settings.analytics.metaPixel],
    ['Google Tag Manager', settings.analytics.googleTagManager],
  ]
    .filter(([, value]) => value)
    .map(([name]) => name);
  return (
    <main id="main-content" className="policy-page">
      <header>
        <p>{settings.general.siteName}</p>
        <Heading as="h1">{kind === 'privacy' ? copy.privacy : copy.policy}</Heading>
        <p>{kind === 'privacy' ? copy.privacyIntro : copy.cookieIntro}</p>
      </header>
      <div className="policy-content">
        {kind === 'privacy' ? (
          <>
            <section>
              <Heading as="h2">{copy.dataTitle}</Heading>
              <p>{copy.dataText}</p>
            </section>
            <section>
              <Heading as="h2">{copy.choicesTitle}</Heading>
              <p>{copy.choicesText}</p>
              <CookieSettingsButton locale={locale} />
            </section>
            {locale !== 'tr' && !!assistantConfig({ ...process.env, SITE_URL: env.SITE_URL }) && (
              <section id="ai-assistant-privacy">
                <Heading as="h2">
                  {locale === 'ar'
                    ? 'المساعد الذكي ومعالجة الرسائل'
                    : 'AI assistant and message processing'}
                </Heading>
                <p>
                  {locale === 'ar'
                    ? 'بعد موافقتك على استخدام المساعد، تُرسل رسالتك وسياق محدود من المحادثة ومقتطفات من محتوى الموقع إلى Cloudflare لإعداد الإجابة. يحتفظ الموقع بحالة المحادثة مؤقتًا أثناء فتح المساعد، ولا يحفظ نصها في قاعدة بيانات أو ملفات ارتباط أو تخزين محلي. يمكنك مسح الجلسة ببدء محادثة جديدة أو إغلاق المساعد. لا تشارك كلمات مرور أو بيانات مالية أو معلومات حساسة.'
                    : 'After you consent to using the assistant, your message, limited conversation context and website excerpts are sent to Cloudflare to generate an answer. The website keeps temporary conversation state while the assistant is open and does not store the transcript in its database, cookies or local storage. Start a new conversation or close the assistant to clear this state. Do not share passwords, financial data or sensitive information.'}
                </p>
              </section>
            )}
            {settings.legal.privacyInformation && (
              <section>
                <Heading as="h2">{copy.policyDetails}</Heading>
                <p>{settings.legal.privacyInformation}</p>
              </section>
            )}
            {settings.contact.email && (
              <section>
                <Heading as="h2">{copy.contact}</Heading>
                {settings.general.legalCompanyName && <p>{settings.general.legalCompanyName}</p>}
                <a href={'mailto:' + settings.contact.email}>{settings.contact.email}</a>
              </section>
            )}
          </>
        ) : (
          <>
            <section>
              <Heading as="h2">{copy.settings}</Heading>
              <div className="policy-categories">
                {(['necessary', 'analytics', 'marketing', 'preferences'] as const).map(
                  (category) => (
                    <article key={category}>
                      <Heading as="h3">{copy[category]}</Heading>
                      <p>{copy[`${category}Text`]}</p>
                      {category === 'necessary' && <strong>{copy.always}</strong>}
                    </article>
                  ),
                )}
              </div>
            </section>
            <section>
              <Heading as="h2">{copy.providers}</Heading>
              {providers.length ? (
                <ul>
                  {providers.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              ) : (
                <p>{copy.none}</p>
              )}
            </section>
            <section>
              <Heading as="h2">{copy.retentionTitle}</Heading>
              <p>
                {copy.retention} {settings.legal.cookieConsentDays} {copy.days}
              </p>
              <p>{copy.withdraw}</p>
              <CookieSettingsButton locale={locale} />
            </section>
            {settings.legal.cookiePolicyInformation && (
              <section>
                <Heading as="h2">{copy.policyDetails}</Heading>
                <p>{settings.legal.cookiePolicyInformation}</p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
