import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDown,
  Check,
  Plus,
  MoveUpRight,
  ScanLine,
  Fingerprint,
  Layers3,
  CircleCheck,
  FileCheck2,
} from 'lucide-react';
import type { CompanyContent } from '@tevoniq/validation';
import { whyCompanyCopy, type WhyCompanyLocale } from '@/content/why-company';
import './why-company.css';
const fileIcons = [Fingerprint, Layers3, ScanLine, FileCheck2];
export function WhyCompany({
  locale,
  content,
}: {
  locale: WhyCompanyLocale;
  content: CompanyContent;
}) {
  const c = whyCompanyCopy[locale];
  return (
    <div className="why-company">
      <section className="why-company-hero" aria-labelledby="why-company-title">
        <div className="why-company-wrap why-company-hero-layout">
          <div className="why-company-hero-copy">
            <p className="why-company-kicker">
              <span />
              {c.eyebrow}
            </p>
            <h1 id="why-company-title">
              {c.title}
              <span>{c.accent}</span>
            </h1>
            <p className="why-company-intro">{c.intro}</p>
            <div className="why-company-actions">
              <Link href={`/${locale}/contact`} className="why-company-button">
                {c.contact}
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <a href="#why-deliverables" className="why-company-text-link">
                {c.explore}
                <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="why-project-file">
            <div className="why-file-background" aria-hidden="true" />
            <div className="why-file-sheet">
              <div className="why-file-top">
                <span className="why-file-brand">TEVONIQ</span>
                <span className="why-file-status">
                  <i aria-hidden="true" />
                  {c.fileStatus}
                </span>
              </div>
              <h2>{c.fileLabel}</h2>
              <p>{c.fileSub}</p>
              <ol>
                {c.fileItems.map(([label, text], i) => {
                  const Icon = fileIcons[i]!;
                  return (
                    <li key={label}>
                      <span className="why-file-icon">
                        <Icon size={19} aria-hidden="true" />
                      </span>
                      <div>
                        <b>{label}</b>
                        <span>{text}</span>
                      </div>
                      <span className="why-file-number" aria-hidden="true">
                        0{i + 1}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div className="why-file-foot">
                <CircleCheck size={17} aria-hidden="true" />
                <span>{c.fileNote}</span>
              </div>
            </div>
            <div className="why-file-seal" aria-hidden="true">
              <MoveUpRight size={27} />
              <span>
                CLARITY
                <br />
                BY DESIGN
              </span>
            </div>
          </div>
        </div>
        <div className="why-company-hero-line" aria-hidden="true">
          <span>01 / UNDERSTAND</span>
          <i />
          <span>02 / DEFINE</span>
          <i />
          <span>03 / REVIEW</span>
          <i />
          <span>04 / HANDOVER</span>
        </div>
      </section>
      <section
        id="why-deliverables"
        className="why-company-proof why-company-wrap"
        aria-labelledby="why-proof-title"
      >
        <div className="why-company-section-head">
          <p className="why-company-kicker">{c.proofLabel}</p>
          <h2 id="why-proof-title">{c.proofTitle}</h2>
        </div>
        <div className="why-reason-list">
          {c.reasons.map((r, i) => (
            <article key={r.title} className="why-reason">
              <span className="why-reason-number" aria-hidden="true">
                0{i + 1}
              </span>
              <div className="why-reason-copy">
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
              <div className="why-reason-artifact">
                <span>{c.evidence}</span>
                <h4>
                  <FileCheck2 size={18} aria-hidden="true" />
                  {r.artifact}
                </h4>
                <ul>
                  {r.bullets.map((b) => (
                    <li key={b}>
                      <Check size={14} aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="why-company-examples" aria-labelledby="why-examples-title">
        <div className="why-company-wrap">
          <div className="why-company-section-head">
            <p className="why-company-kicker">{c.examplesLabel}</p>
            <h2 id="why-examples-title">{c.examplesTitle}</h2>
            <p>{c.examplesHint}</p>
          </div>
          <fieldset className="why-example-selector">
            <legend>{c.examplesHint}</legend>
            <div className="why-example-controls">
              {c.examples.map((e, i) => (
                <label key={e.tab}>
                  <input name="why-example" type="radio" value={i} defaultChecked={i === 0} />
                  <span>
                    <b aria-hidden="true">0{i + 1}</b>
                    {e.tab}
                  </span>
                </label>
              ))}
            </div>
            {c.examples.map((e, i) => (
              <div key={e.tab} className={`why-example-panel why-example-${i}`}>
                <div className="why-example-visual">
                  <span className="why-example-badge">{c.exampleBadge}</span>
                  <div className="why-example-diagram" aria-hidden="true">
                    <div className="why-example-scan" />
                    <span className="why-example-diagram-title">
                      TEVONIQ / {String(i + 1).padStart(2, '0')}
                    </span>
                    {e.labels.map((label, n) => (
                      <div className={`why-diagram-node why-diagram-node-${n}`} key={label}>
                        <i />
                        <span>{label}</span>
                        <Check size={16} />
                      </div>
                    ))}
                  </div>
                  <p className="why-example-question-label">{c.startQuestion}</p>
                  <p className="why-example-question">{e.question}</p>
                </div>
                <div className="why-example-detail">
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                  <h4>{c.deliverables}</h4>
                  <ul>
                    {e.outputs.map((o) => (
                      <li key={o}>
                        <Check size={17} aria-hidden="true" />
                        {o}
                      </li>
                    ))}
                  </ul>
                  <details className="why-example-boundary">
                    <summary>
                      {c.scopeNote}
                      <Plus size={16} aria-hidden="true" />
                    </summary>
                    <p>{e.boundary}</p>
                  </details>
                  <Link href={`/${locale}${e.href}`} className="why-company-button">
                    {e.action}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </fieldset>
        </div>
      </section>
      <section className="why-company-fit why-company-wrap" aria-labelledby="why-fit-title">
        <div>
          <p className="why-company-kicker">{c.fitLabel}</p>
          <h2 id="why-fit-title">{c.fitTitle}</h2>
          <p>{c.fitText}</p>
        </div>
        <ol>
          {c.fitPoints.map(([title, text], i) => (
            <li key={title}>
              <span aria-hidden="true">0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="why-company-ai" aria-labelledby="why-ai-title">
        <div className="why-company-wrap">
          <div className="why-ai-symbol" aria-hidden="true">
            <Fingerprint size={52} strokeWidth={1} />
            <span>AI + ENGINEERING</span>
          </div>
          <div>
            <p className="why-company-kicker">{c.aiLabel}</p>
            <h2 id="why-ai-title">{c.aiTitle}</h2>
            <p>{c.aiText}</p>
          </div>
        </div>
      </section>
      <section className="why-company-faq why-company-wrap" aria-labelledby="why-faq-title">
        <div className="why-company-section-head">
          <p className="why-company-kicker">{c.faqLabel}</p>
          <h2 id="why-faq-title">{c.faqTitle}</h2>
        </div>
        <div className="why-faq-list">
          {c.faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                <h3>{q}</h3>
                <Plus size={21} aria-hidden="true" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <details className="why-company-record">
          <summary>
            {c.record}
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
      </section>
      <section className="why-company-closing">
        <div className="why-company-wrap">
          <div>
            <h2>{c.closingTitle}</h2>
            <p>{c.closingText}</p>
          </div>
          <div className="why-company-actions">
            <Link href={`/${locale}/contact`} className="why-company-button">
              {c.closingAction}
              <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <Link href={`/${locale}/company/about`} className="why-company-text-link">
              {c.about}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
