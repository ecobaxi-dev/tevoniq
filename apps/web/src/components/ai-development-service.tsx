import { Container } from '@tevoniq/ui';
import type { Locale } from '@tevoniq/types';
import type { PublicService } from '@tevoniq/validation';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Code2,
  FileText,
  GitPullRequest,
  FlaskConical,
  Rocket,
  Sparkles,
  ScanLine,
  Workflow,
  Settings2,
  Bot,
  GraduationCap,
  ChartNoAxesCombined,
  ShieldCheck,
  Layers3,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { aiDevelopmentCopy } from '@/content/ai-development';
import { getLeadOptions } from '@/lib/lead-options';
import { faqData } from '@/lib/seo-core';
import { StructuredData } from './seo/json-ld';
import { LeadForm } from './lead-form';
import { ContentBlocks } from './content-blocks';
import './lead-form.css';
import './ai-development-service.css';

const consultingIcons = [ScanLine, Workflow, Settings2, Bot, GraduationCap, ChartNoAxesCombined];
const engineeringIcons = [FlaskConical, Workflow, Layers3, FileText];
const diagramIcons = [FileText, Code2, GitPullRequest, FlaskConical, Rocket];
const sectionIds = ['ai-services', 'ai-applications', 'ai-approach', 'ai-tools', 'ai-faq'];

export async function AiDevelopmentService({
  service,
  locale,
}: {
  service: PublicService;
  locale: Locale;
}) {
  const c = aiDevelopmentCopy[locale];
  const options = await getLeadOptions(locale).catch(() => null);
  const related = service.blocks.filter(
    (b) => b.type === 'related-services' || b.type === 'related-projects',
  );
  return (
    <div className="ai-development" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <StructuredData data={faqData(c.questions)} />
      <section className="ai-dev-hero" aria-labelledby="ai-dev-title">
        <Container className="ai-dev-hero-grid">
          <div>
            <p className="ai-dev-eyebrow">{c.eyebrow}</p>
            <h1 id="ai-dev-title">{c.title}</h1>
            <p className="ai-dev-intro">{c.intro}</p>
            <div className="ai-dev-actions">
              <a className="ai-dev-button" href="#ai-contact">
                {c.primary}
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
              <a className="ai-dev-button ai-dev-button--outline" href="#ai-approach">
                {c.secondary}
                <ArrowRight size={19} aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className="ai-dev-diagram" role="img" aria-label={c.diagramLabel}>
            <div className="ai-dev-diagram-bar" aria-hidden="true">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>TEVONIQ / ENGINEERING</span>
            </div>
            <div className="ai-dev-core" aria-hidden="true">
              <Sparkles size={36} strokeWidth={1.3} />
              <span>AI + HUMAN</span>
              <small>REVIEW · VALIDATE · DELIVER</small>
            </div>
            <ol aria-hidden="true">
              {c.diagram.map((label, i) => {
                const Icon = diagramIcons[i]!;
                return (
                  <li key={label}>
                    <span>
                      <Icon size={23} strokeWidth={1.4} />
                    </span>
                    <small>{label}</small>
                  </li>
                );
              })}
            </ol>
            <div className="ai-dev-code" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <b>
                <Check size={14} /> REVIEWED
              </b>
            </div>
          </figure>
        </Container>
      </section>
      <div className="ai-dev-principles">
        <Container>
          <ul>
            {c.principles.map((p) => (
              <li key={p}>
                <Check size={17} aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </Container>
      </div>
      <nav className="ai-dev-nav" aria-label={service.title}>
        <Container>
          {c.nav.map((label, i) => (
            <a key={label} href={`#${sectionIds[i]}`}>
              {label}
            </a>
          ))}
        </Container>
      </nav>
      <section className="ai-dev-section ai-dev-overview" aria-labelledby="ai-overview-title">
        <Container>
          <div className="ai-dev-section-heading">
            <p className="ai-dev-eyebrow">TEVONIQ / AI</p>
            <h2 id="ai-overview-title">{c.overview}</h2>
            <p>{c.overviewBody}</p>
          </div>
          <div className="ai-dev-comparison">
            <div className="ai-dev-comparison-head">
              <span>{c.challenge}</span>
              <span>{c.response}</span>
            </div>
            {c.comparisons.map((pair, i) => (
              <div className="ai-dev-comparison-row" key={pair.problem}>
                <p>
                  <small>0{i + 1}</small>
                  {pair.problem}
                </p>
                <p>
                  <Check size={20} aria-hidden="true" />
                  {pair.solution}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section
        id="ai-services"
        className="ai-dev-section ai-dev-tint"
        aria-labelledby="ai-consulting-title"
      >
        <Container>
          <div className="ai-dev-section-heading">
            <p className="ai-dev-eyebrow">01 / {c.nav[0]}</p>
            <h2 id="ai-consulting-title">{c.consulting}</h2>
            <p>{c.consultingIntro}</p>
          </div>
          <div className="ai-dev-service-grid">
            {c.consultingItems.map((item, i) => {
              const Icon = consultingIcons[i]!;
              return (
                <article className="ai-dev-card" key={item.title}>
                  <div className="ai-dev-card-top">
                    <Icon size={29} strokeWidth={1.4} aria-hidden="true" />
                    <small>0{i + 1}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
      <section className="ai-dev-section ai-dev-engineering" aria-labelledby="ai-engineering-title">
        <Container>
          <div className="ai-dev-section-heading">
            <p className="ai-dev-eyebrow">ENGINEERING</p>
            <h2 id="ai-engineering-title">{c.engineering}</h2>
            <p>{c.engineeringIntro}</p>
          </div>
          <div className="ai-dev-engineering-grid">
            {c.engineeringItems.map((item, i) => {
              const Icon = engineeringIcons[i]!;
              return (
                <article key={item.title}>
                  <Icon size={30} strokeWidth={1.3} aria-hidden="true" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
      <section id="ai-applications" className="ai-dev-section" aria-labelledby="ai-examples-title">
        <Container>
          <div className="ai-dev-section-heading">
            <p className="ai-dev-eyebrow">02 / {c.nav[1]}</p>
            <h2 id="ai-examples-title">{c.examples}</h2>
            <p>{c.exampleNote}</p>
          </div>
          <div className="ai-dev-example-grid">
            {c.exampleItems.map((item, i) => {
              const Icon = [BookOpen, GitPullRequest, FlaskConical][i]!;
              return (
                <article className="ai-dev-example" key={item.title}>
                  <div className="ai-dev-example-art" aria-hidden="true">
                    <span className="ai-dev-example-orbit" />
                    <Icon size={58} strokeWidth={1} />
                    <span className="ai-dev-example-badge">0{i + 1} / AI</span>
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
      <section
        id="ai-approach"
        className="ai-dev-section ai-dev-tint"
        aria-labelledby="ai-approach-title"
      >
        <Container>
          <div className="ai-dev-section-heading">
            <p className="ai-dev-eyebrow">03 / {c.nav[2]}</p>
            <h2 id="ai-approach-title">{c.approach}</h2>
            <p>{c.approachIntro}</p>
          </div>
          <ol className="ai-dev-stages">
            {c.stages.map((stage, i) => (
              <li key={stage.title}>
                <span className="ai-dev-stage-number">0{i + 1}</span>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.body}</p>
                  <div className="ai-dev-stage-output">
                    <span>{c.output}</span>
                    <strong>{stage.output}</strong>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <section id="ai-tools" className="ai-dev-section" aria-labelledby="ai-tools-title">
        <Container>
          <div className="ai-dev-section-heading">
            <p className="ai-dev-eyebrow">04 / {c.nav[3]}</p>
            <h2 id="ai-tools-title">{c.tools}</h2>
            <p>{c.toolsIntro}</p>
          </div>
          <div className="ai-dev-tools">
            {c.toolItems.map((item, i) => {
              const Icon = [Code2, Bot, Workflow][i]!;
              return (
                <article key={item.title}>
                  <Icon size={30} strokeWidth={1.4} aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
      <section className="ai-dev-section ai-dev-assurance" aria-labelledby="ai-assurance-title">
        <Container>
          <h2 id="ai-assurance-title">{c.assurance}</h2>
          <div>
            {c.assuranceItems.map((item, i) => {
              const Icon = [ShieldCheck, Settings2, GraduationCap][i]!;
              return (
                <article key={item.title}>
                  <Icon size={30} strokeWidth={1.4} aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
      <section id="ai-faq" className="ai-dev-section" aria-labelledby="ai-faq-title">
        <Container className="ai-dev-faq-layout">
          <div>
            <p className="ai-dev-eyebrow">05 / FAQ</p>
            <h2 id="ai-faq-title">{c.faq}</h2>
          </div>
          <div className="ai-dev-faq">
            {c.questions.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <ChevronDown size={20} aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
      <section
        id="ai-contact"
        className="ai-dev-section ai-dev-tint"
        aria-labelledby="ai-contact-title"
      >
        <Container className="ai-dev-contact">
          <div>
            <p className="ai-dev-eyebrow">LET’S BUILD TOGETHER</p>
            <h2 id="ai-contact-title">{c.contact}</h2>
            <p>{c.contactBody}</p>
            <aside>
              <h3>{c.contactAside}</h3>
              <ul>
                {c.contactPoints.map((p) => (
                  <li key={p}>
                    <Check size={18} aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
          <div className="ai-dev-contact-form">
            {options ? (
              <LeadForm type="contact" locale={locale} options={options} />
            ) : (
              <a className="ai-dev-button" href={`/${locale}/contact`}>
                {c.primary}
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
