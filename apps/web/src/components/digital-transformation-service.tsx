import Image from 'next/image';
import { Container } from '@tevoniq/ui';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Compass,
  Cpu,
  Search,
  Bot,
  Code2,
  Layers3,
  BarChart3,
  Cloud,
  TrendingUp,
} from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import type { PublicService } from '@tevoniq/validation';
import copy from '@/content/digital-transformation.json';
import assets from '@/content/digital-transformation-assets.json';
import links from '@/content/digital-transformation-links.json';
import { DigitalExpertise } from './digital-expertise';
import { AiCaseCards } from './ai-case-cards';
import { LeadForm } from './lead-form';
import { ContentBlocks } from './content-blocks';
import { getLeadOptions } from '@/lib/lead-options';
import { faqData } from '@/lib/seo-core';
import { StructuredData } from './seo/json-ld';
import './digital-transformation-service.css';
import './lead-form.css';
const ids = [
  'digital-services',
  'digital-cases',
  'digital-benefits',
  'digital-challenges',
  'digital-roadmap',
  'digital-expertise',
  'digital-faq',
];
const icons = [Compass, Cpu, Search, Bot, Code2];
export async function DigitalTransformationService({
  service,
  locale,
}: {
  service: PublicService;
  locale: Locale;
}) {
  const c = copy[locale],
    options = await getLeadOptions(locale).catch(() => null),
    related = service.blocks.filter(
      (b) => b.type === 'related-services' || b.type === 'related-projects',
    );
  return (
    <div className="digital-transformation" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <StructuredData data={faqData(c.faq)} />
      <section className="digital-hero" aria-labelledby="digital-title">
        <Container className="digital-hero-grid">
          <div>
            <p className="digital-eyebrow">{c.eyebrow}</p>
            <h1 id="digital-title">{c.title}</h1>
            <p className="digital-hero-subtitle">{c.subtitle}</p>
            <p className="digital-intro">{c.intro}</p>
            <a className="digital-button" href="#digital-contact">
              {c.cta}
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </div>
          <figure>
            <Image
              src={assets.hero}
              alt={c.subtitle}
              width={942}
              height={628}
              unoptimized
              priority
            />
          </figure>
        </Container>
      </section>
      <nav className="digital-nav" aria-label={c.title}>
        <Container>
          {c.nav.map((n, i) => (
            <a href={`#${ids[i]}`} key={n}>
              {n}
            </a>
          ))}
        </Container>
      </nav>

      <section className="digital-section" aria-labelledby="digital-overview-title">
        <Container>
          <div className="digital-overview">
            <div className="digital-heading">
              <p className="digital-eyebrow">STRATEGY × TECHNOLOGY</p>
              <h2 id="digital-overview-title">{c.overview}</h2>
              <p>{c.overviewBody}</p>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="digital-services"
        className="digital-section digital-dark"
        aria-labelledby="digital-services-title"
      >
        <Container>
          <div className="digital-heading">
            <p className="digital-eyebrow">01 / SERVICES</p>
            <h2 id="digital-services-title">{c.servicesTitle}</h2>
          </div>
          <div className="digital-service-grid">
            {c.services.map((s, i) => {
              const Icon = icons[i]!;
              return (
                <article key={s.title}>
                  <Icon size={30} strokeWidth={1.4} aria-hidden="true" />
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
      <section id="digital-cases" className="digital-section" aria-labelledby="digital-cases-title">
        <Container>
          <div className="digital-heading">
            <p className="digital-eyebrow">02 / CASE STUDIES</p>
            <h2 id="digital-cases-title">{c.casesTitle}</h2>
            <p className="digital-disclosure">{c.casesNotice}</p>
          </div>
          <AiCaseCards locale={locale} serviceSlug="digital-transformation" />
        </Container>
      </section>
      <section
        id="digital-benefits"
        className="digital-section digital-tint"
        aria-labelledby="digital-benefits-title"
      >
        <Container>
          <div className="digital-heading">
            <p className="digital-eyebrow">03 / BUSINESS VALUE</p>
            <h2 id="digital-benefits-title">{c.benefitsTitle}</h2>
          </div>
          <div className="digital-benefits">
            {c.benefits.map((b, i) => {
              const Icon = [Layers3, BarChart3, Cloud, TrendingUp][i]!;
              return (
                <article key={b.title}>
                  <Icon size={32} strokeWidth={1.3} aria-hidden="true" />
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </article>
              );
            })}
          </div>
          <a href="#digital-contact" className="digital-button">
            {c.cta}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </Container>
      </section>

      <section
        id="digital-challenges"
        className="digital-section digital-tint"
        aria-labelledby="digital-challenges-title"
      >
        <Container>
          <div className="digital-heading">
            <p className="digital-eyebrow">04 / CHALLENGES</p>
            <h2 id="digital-challenges-title">{c.challengesTitle}</h2>
          </div>
          <div className="digital-challenges">
            {c.challenges.map((item, i) => (
              <article key={item.title}>
                <span>0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section
        id="digital-roadmap"
        className="digital-section"
        aria-labelledby="digital-roadmap-title"
      >
        <Container>
          <div className="digital-heading">
            <p className="digital-eyebrow">05 / ROADMAP</p>
            <h2 id="digital-roadmap-title">{c.roadmapTitle}</h2>
          </div>
          <ol className="digital-roadmap">
            {c.steps.map((s, i) => (
              <li key={s.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <section
        id="digital-expertise"
        className="digital-section digital-dark"
        aria-labelledby="digital-expertise-title"
      >
        <Container>
          <div className="digital-heading">
            <p className="digital-eyebrow">06 / EXPERTISE</p>
            <h2 id="digital-expertise-title">{c.expertiseTitle}</h2>
          </div>
          <DigitalExpertise groups={c.expertise} label={c.expertiseTitle} />
          <a className="digital-text-link" href={`/${locale}/services`}>
            {c.allServices}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </Container>
      </section>
      <section className="digital-section" aria-labelledby="digital-partners-title">
        <Container>
          <div className="digital-heading">
            <h2 id="digital-partners-title">{c.partnersTitle}</h2>
          </div>
          <ul className="digital-logos digital-partner-logos">
            {assets.partners.map((a) => (
              <li key={a.name}>
                <Cpu size={24} strokeWidth={1.4} aria-hidden="true" />
                <span>{a.name}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        id="digital-faq"
        className="digital-section digital-tint"
        aria-labelledby="digital-faq-title"
      >
        <Container>
          <div className="digital-heading">
            <p className="digital-eyebrow">08 / FAQ</p>
            <h2 id="digital-faq-title">{c.faqTitle}</h2>
          </div>
          <div className="digital-faq">
            {c.faq.map((q) => (
              <details key={q.question}>
                <summary>
                  {q.question}
                  <ChevronDown size={20} aria-hidden="true" />
                </summary>
                <p>{q.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
      <section className="digital-section" aria-labelledby="digital-links-title">
        <Container>
          <div className="digital-heading">
            <h2 id="digital-links-title">{c.linksTitle}</h2>
          </div>
          <ul className="digital-related-links">
            {links
              .filter((link) => link.slug)
              .map((link) => (
                <li key={link.titles.en}>
                  <a href={`/${locale}/services/${link.slug}`}>
                    {link.titles[locale]}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </li>
              ))}
          </ul>
        </Container>
      </section>
      <section
        id="digital-contact"
        className="digital-section digital-dark"
        aria-labelledby="digital-contact-title"
      >
        <Container className="digital-contact">
          <div>
            <p className="digital-eyebrow">LET’S TRANSFORM TOGETHER</p>
            <h2 id="digital-contact-title">{c.contactTitle}</h2>
            <p>{c.contactBody}</p>
            <ul>
              {c.contactPoints.map((point) => (
                <li key={point}>
                  <Check size={18} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="digital-contact-form">
            {options ? (
              <LeadForm type="contact" locale={locale} options={options} />
            ) : (
              <a className="digital-button" href={`/${locale}/contact`}>
                {c.cta}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            )}
          </div>
        </Container>
      </section>
      {related.length > 0 && (
        <ContentBlocks
          blocks={related}
          relatedServices={service.relatedServices}
          relatedProjects={service.relatedProjects}
          locale={locale}
        />
      )}
    </div>
  );
}
