import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDown,
  Check,
  MapPin,
  Monitor,
  Workflow,
  Sparkles,
  Layers3,
  Plus,
  Aperture,
} from 'lucide-react';
import type { CompanyContent } from '@tevoniq/validation';
import { aboutCopy, type AboutLocale } from '@/content/about';
import './about-studio.css';

const icons = [Monitor, Layers3, Workflow, Sparkles];
const paths = [
  '/website-designs',
  '/work-systems',
  '/automation-demos',
  '/services/ai-machine-learning',
];

export function AboutStudio({ locale, content }: { locale: AboutLocale; content: CompanyContent }) {
  const c = aboutCopy[locale];
  return (
    <div className="about-studio">
      <section className="about-studio-hero" aria-labelledby="about-title">
        <div className="about-studio-grid" aria-hidden="true" />
        <div className="about-studio-wrap about-studio-hero-layout">
          <div className="about-studio-hero-copy">
            <p className="about-studio-eyebrow">
              <span />
              {c.label}
            </p>
            <h1 id="about-title">
              {c.title}
              <span>{c.accent}</span>
            </h1>
            <p className="about-studio-lead">{c.intro}</p>
            <div className="about-studio-actions">
              <Link className="about-studio-button" href={`/${locale}/contact`}>
                {c.contact}
                <ArrowUpRight aria-hidden="true" size={19} />
              </Link>
              <a className="about-studio-text-link" href="#about-thinking">
                {c.discover}
                <ArrowDown aria-hidden="true" size={18} />
              </a>
            </div>
            <p className="about-studio-location">
              <MapPin aria-hidden="true" size={16} />
              {c.location}
              <span aria-hidden="true">/</span>
              {locale === 'ar' ? 'فكر هندسي. أثر عملي.' : 'Engineering thought. Practical purpose.'}
            </p>
          </div>
          <fieldset className="about-workbench">
            <legend>{c.board}</legend>
            <div className="about-workbench-top">
              <Aperture size={21} aria-hidden="true" />
              <span>{c.boardHint}</span>
              <span className="about-workbench-light" aria-hidden="true" />
            </div>
            <div className="about-workbench-controls">
              {c.stages.map((stage, i) => (
                <label key={stage.title} className="about-stage-control">
                  <input type="radio" name="about-stage" value={i} defaultChecked={i === 0} />
                  <span>
                    <b aria-hidden="true">0{i + 1}</b>
                    {stage.title}
                  </span>
                </label>
              ))}
            </div>
            {c.stages.map((stage, i) => (
              <div className={`about-workbench-panel about-panel-${i}`} key={stage.title}>
                <div className="about-workbench-map" aria-hidden="true">
                  <div className="about-workbench-orbit" />
                  <div className="about-workbench-core">
                    <span>TEVONIQ</span>
                    <b>0{i + 1}</b>
                  </div>
                  {stage.nodes.map((node, n) => (
                    <span className={`about-map-node about-node-${n}`} key={node}>
                      {node}
                      <i />
                    </span>
                  ))}
                  <span className="about-map-caption">IDEA → STRUCTURE → PURPOSE</span>
                </div>
                <div className="about-workbench-description">
                  <span className="about-workbench-tag">{stage.tag}</span>
                  <p>{stage.text}</p>
                </div>
                <dl className="about-workbench-io">
                  <div>
                    <dt>{c.input}</dt>
                    <dd>{stage.input}</dd>
                  </div>
                  <div>
                    <dt>{c.output}</dt>
                    <dd>
                      <Check size={15} aria-hidden="true" />
                      {stage.output}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </fieldset>
        </div>
        <div className="about-studio-hero-bottom" aria-hidden="true">
          <span>TEVONIQ</span>
          <span>HUMAN NEEDS / ENGINEERING / USEFUL TECHNOLOGY</span>
          <span>↓</span>
        </div>
      </section>
      <section
        id="about-thinking"
        className="about-studio-manifesto about-studio-wrap"
        aria-labelledby="about-thinking-title"
      >
        <div className="about-studio-section-label">
          <span>01</span>
          <p>{c.statementLabel}</p>
        </div>
        <div>
          <h2 id="about-thinking-title">{c.statement}</h2>
          <p>{c.statementText}</p>
        </div>
      </section>
      <section className="about-studio-principles" aria-labelledby="about-principles-title">
        <div className="about-studio-wrap">
          <div className="about-studio-section-label">
            <span>02</span>
            <p>{c.principlesLabel}</p>
          </div>
          <h2 id="about-principles-title">{c.principlesTitle}</h2>
          <div className="about-principle-list">
            {c.principles.map(([title, text], i) => (
              <details key={title} open={i === 0}>
                <summary>
                  <span className="about-principle-index" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <h3>{title}</h3>
                  <Plus size={23} aria-hidden="true" />
                </summary>
                <p>{text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="about-studio-focus about-studio-wrap" aria-labelledby="about-focus-title">
        <div className="about-studio-section-label">
          <span>03</span>
          <p>{c.focusLabel}</p>
        </div>
        <h2 id="about-focus-title">{c.focusTitle}</h2>
        <div className="about-focus-grid">
          {c.services.map(([title, text, action], i) => {
            const Icon = icons[i]!;
            return (
              <article className={`about-focus-card about-focus-${i}`} key={title}>
                <div className="about-focus-art" aria-hidden="true">
                  <div />
                  <Icon size={43} strokeWidth={1.25} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link href={`/${locale}${paths[i]}`}>
                  {action}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
      <section className="about-studio-identity" aria-labelledby="about-identity-title">
        <div className="about-studio-wrap">
          <div className="about-studio-section-label">
            <span>04</span>
            <p>{c.identityLabel}</p>
          </div>
          <h2 id="about-identity-title">{c.identityTitle}</h2>
          <div className="about-identity-layout">
            <div className="about-identity-coordinate">
              <MapPin size={30} aria-hidden="true" />
              <dl>
                <div>
                  <dt>{c.hq}</dt>
                  <dd>{c.location}</dd>
                </div>
                <div>
                  <dt>{c.market}</dt>
                  <dd>{c.marketValue}</dd>
                </div>
              </dl>
              <span aria-hidden="true">IST / TEVONIQ</span>
            </div>
            <div className="about-identity-copy">
              <h3>{c.foundation}</h3>
              <p>{c.foundationText}</p>
              <details className="about-company-record">
                <summary>
                  {c.companyRecord}
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <div>
                  <p>{content.intro}</p>
                  {content.foundingYear !== null && (
                    <p>
                      {locale === 'ar' ? 'سنة التأسيس' : 'Founded'}: {content.foundingYear}
                    </p>
                  )}
                  {content.geographicCoverage && <p>{content.geographicCoverage}</p>}
                  {content.sections.map((s, i) => (
                    <section key={i}>
                      <h4>{s.title}</h4>
                      <p>{s.body}</p>
                    </section>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>
      <section className="about-studio-closing" aria-labelledby="about-closing-title">
        <div className="about-studio-wrap">
          <span className="about-closing-cross" aria-hidden="true">
            +
          </span>
          <p className="about-studio-eyebrow">{c.closingLabel}</p>
          <h2 id="about-closing-title">{c.closingTitle}</h2>
          <p>{c.closingText}</p>
          <div className="about-studio-actions">
            <Link className="about-studio-button" href={`/${locale}/contact`}>
              {c.closingLink}
              <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <Link className="about-studio-text-link" href={`/${locale}/work-systems`}>
              {c.closingSecondary}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
