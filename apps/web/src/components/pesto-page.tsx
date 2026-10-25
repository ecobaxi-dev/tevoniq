import Image from 'next/image';
import {
  ArrowUpRight,
  Monitor,
  Smartphone,
  Check,
  Wifi,
  Utensils,
  Receipt,
  ShieldCheck,
  Mail,
  MessageCircle,
  Clock3,
} from 'lucide-react';
import { Container, ButtonLink, Heading } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import { pestoCopy, pestoSupport } from '@/content/pesto';
import './pesto-page.css';

export function PestoHomeEntry({ locale }: { locale: Locale }) {
  const c = pestoCopy[locale];
  return (
    <section className="pesto-home-entry" aria-labelledby="pesto-entry-title">
      <Container>
        <div className="pesto-entry-layout">
          <div className="pesto-entry-logo">
            <Image
              src="/brand/pesto-logo.png"
              width={2172}
              height={724}
              sizes="(max-width: 640px) 160px, 200px"
              alt="Pesto — Restaurant System"
            />
          </div>
          <div className="pesto-entry-copy">
            <Heading as="h2" id="pesto-entry-title">
              {c.homeTitle}
            </Heading>
            <p>{c.homeBody}</p>
          </div>
          <ButtonLink href={`/${locale}/pesto`} variant="gold-accent" className="pesto-entry-cta">
            {c.homeLink}
            <ArrowUpRight size={18} aria-hidden="true" />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export function PestoPage({ locale }: { locale: Locale }) {
  const c = pestoCopy[locale];
  return (
    <main id="main-content" className="pesto-page">
      <Container>
        <nav className="pesto-subnav" aria-label={c.explore}>
          <a className="pesto-wordmark" href="#overview" lang="en">
            Pesto<span>by TEVONIQ</span>
          </a>
          <div>
            {[
              ['overview', c.overview],
              ['downloads', c.downloads],
              ['activation', c.activation],
              ['support', c.support],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </div>
        </nav>
        <section id="overview" className="pesto-hero" aria-labelledby="pesto-title">
          <div className="pesto-hero-copy">
            <p className="pesto-kicker">{c.eyebrow}</p>
            <Heading as="h1" id="pesto-title">
              {c.headline.split('\n').map((line, i) => (
                <span key={line} className={i === 1 ? 'pesto-gold-text' : undefined}>
                  {line}
                </span>
              ))}
            </Heading>
            <p className="pesto-intro">{c.intro}</p>
            <div className="pesto-actions">
              <ButtonLink href="#downloads">
                {c.downloads}
                <ArrowUpRight size={18} aria-hidden="true" />
              </ButtonLink>
              <a className="pesto-text-link" href="#activation">
                {c.activation}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className="pesto-terminal">
            <div className="pesto-terminal-bar">
              <span lang="en">{c.terminal}</span>
              <Wifi size={19} aria-hidden="true" />
            </div>
            <div className="pesto-terminal-body">
              <div className="pesto-terminal-menu">
                <Utensils size={32} aria-hidden="true" />
                <span>{c.connected}</span>
                <div className="pesto-food-tile">
                  <Utensils size={40} aria-hidden="true" />
                  <span>{c.itemA}</span>
                </div>
                <div className="pesto-terminal-notice">
                  <Check size={17} aria-hidden="true" />
                  {c.kitchen}
                </div>
              </div>
              <div className="pesto-terminal-order">
                <Receipt size={21} aria-hidden="true" />
                <span className="pesto-terminal-title">{c.order}</span>
                <div className="pesto-terminal-line">
                  <span>2 ×</span>
                  {c.itemA}
                </div>
                <div className="pesto-terminal-line">
                  <span>1 ×</span>
                  {c.itemB}
                </div>
                <div className="pesto-terminal-payment">{c.cashier}</div>
              </div>
            </div>
            <figcaption>{c.preview}</figcaption>
          </figure>
        </section>
        <div className="pesto-release-strip">
          <Clock3 size={21} aria-hidden="true" />
          <strong>{c.status}</strong>
          <span>{c.statusBody}</span>
        </div>
        <section className="pesto-capabilities" aria-labelledby="pesto-capabilities-title">
          <div className="pesto-section-label">
            <p className="pesto-kicker">PESTO LITE</p>
            <Heading as="h2" id="pesto-capabilities-title">
              {c.capabilitiesTitle}
            </Heading>
          </div>
          <div>
            {c.capabilities.map(([title, body], i) => (
              <article className="pesto-capability" key={title}>
                <span className="pesto-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <div>
                  <Heading as="h3">{title}</Heading>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="downloads" className="pesto-downloads" aria-labelledby="pesto-downloads-title">
          <div className="pesto-section-heading">
            <p className="pesto-kicker">{c.downloads}</p>
            <Heading as="h2" id="pesto-downloads-title">
              {c.downloadTitle}
            </Heading>
            <p>{c.downloadBody}</p>
          </div>
          <div className="pesto-download-list">
            {[
              { Icon: Monitor, title: c.windows, body: c.windowsBody },
              { Icon: Smartphone, title: c.android, body: c.androidBody },
            ].map(({ Icon, title, body }) => (
              <article className="pesto-download" key={title}>
                <Icon size={34} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <span className="pesto-availability">{c.preparing}</span>
                  <Heading as="h3">{title}</Heading>
                  <p>{body}</p>
                </div>
                <button disabled type="button">
                  {c.unavailable}
                </button>
              </article>
            ))}
          </div>
        </section>
        <section
          id="activation"
          className="pesto-activation"
          aria-labelledby="pesto-activation-title"
        >
          <div>
            <ShieldCheck size={30} aria-hidden="true" />
            <p className="pesto-kicker">{c.activation}</p>
            <Heading as="h2" id="pesto-activation-title">
              {c.activationTitle}
            </Heading>
            <p>{c.activationBody}</p>
          </div>
          <ol>
            {c.steps.map(([title, body], i) => (
              <li key={title}>
                <span className="pesto-step" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <Heading as="h3">{title}</Heading>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="pesto-trial-note">{c.trialNote}</p>
        </section>
        <section className="pesto-details" aria-labelledby="pesto-details-title">
          <Heading as="h2" id="pesto-details-title">
            {c.detailsTitle}
          </Heading>
          {c.details.map(([title, body]) => (
            <article key={title}>
              <Heading as="h3">{title}</Heading>
              <p>{body}</p>
            </article>
          ))}
        </section>
        <section id="support" className="pesto-support" aria-labelledby="pesto-support-title">
          <div>
            <p className="pesto-kicker">TEVONIQ / PESTO</p>
            <Heading as="h2" id="pesto-support-title">
              {c.supportTitle}
            </Heading>
            <p>{c.supportBody}</p>
            <div className="pesto-actions">
              <ButtonLink href={pestoSupport.whatsapp}>
                <MessageCircle size={18} aria-hidden="true" />
                {c.whatsapp}
              </ButtonLink>
              <a className="pesto-text-link" href={pestoSupport.email}>
                <Mail size={18} aria-hidden="true" />
                {c.email}
              </a>
            </div>
            <a className="pesto-email-address" href={pestoSupport.email} dir="ltr">
              kallas.hossam@gmail.com
            </a>
          </div>
          <div className="pesto-faq">
            <Heading as="h3">{c.faqTitle}</Heading>
            {c.faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
