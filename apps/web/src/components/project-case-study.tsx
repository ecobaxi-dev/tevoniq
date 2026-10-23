import { Heading } from '@tevoniq/ui';
import Image from 'next/image';
import { Container, ButtonLink } from '@tevoniq/ui';
import type { PublicProject } from '@tevoniq/validation';
import { projectLabels } from '@/content/projects';

export function ProjectCaseStudy({ project }: { project: PublicProject }) {
  const p = project,
    l = projectLabels[p.locale];
  const sections = (['challenge', 'approach', 'solution', 'implementation'] as const).filter(
    (key) => p[key],
  );
  const date = p.projectDate
    ? new Intl.DateTimeFormat(p.locale, { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(
        new Date(p.projectDate),
      )
    : null;
  return (
    <article className="case-study">
      <header className={`case-hero ${p.heroImage ? 'has-image' : ''}`}>
        <Container>
          <nav className="project-breadcrumb" aria-label={l.back}>
            <a href={`/${p.locale}/projects`}>← {l.back}</a>
            <span aria-hidden="true">/</span>
            <span>{l.caseStudy}</span>
          </nav>
          <div className="case-hero-grid">
            <div className="case-hero-copy">
              <p className="tv-eyebrow">{p.featured ? l.featured : l.caseStudy}</p>
              <Heading as="h1">{p.title}</Heading>
              <p className="case-summary">{p.summary}</p>
              <dl className="case-facts">
                {p.clientLabel && (
                  <div>
                    <dt>{l.client}</dt>
                    <dd>{p.clientLabel}</dd>
                  </div>
                )}
                {(p.country || p.city) && (
                  <div>
                    <dt>{l.location}</dt>
                    <dd>{[p.city, p.country].filter(Boolean).join(', ')}</dd>
                  </div>
                )}
                {date && (
                  <div>
                    <dt>{l.date}</dt>
                    <dd>
                      <time dateTime={p.projectDate!}>{date}</time>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            {p.heroImage && (
              <figure className="case-hero-image">
                <Image
                  src={p.heroImage.url}
                  alt={p.heroImage.alt}
                  width={1200}
                  height={960}
                  unoptimized
                  loading="eager"
                />
                {p.heroImage.caption && <figcaption>{p.heroImage.caption}</figcaption>}
              </figure>
            )}
          </div>
        </Container>
      </header>
      {p.results.length > 0 && (
        <section className="case-results" aria-labelledby="project-results">
          <Container>
            <p id="project-results" className="tv-eyebrow">
              {l.results}
            </p>
            <dl>
              {p.results.map((r, i) => (
                <div key={i}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}
      <Container>
        <div className="case-body">
          <aside className="case-contents">
            <nav aria-label={l.contents}>
              <p className="tv-eyebrow">{l.contents}</p>
              {sections.map((key, i) => (
                <a key={key} href={`#project-${key}`}>
                  <span aria-hidden="true">0{i + 1}</span>
                  {l[key]}
                </a>
              ))}
              {p.gallery.length > 0 && <a href="#project-gallery">{l.gallery}</a>}
            </nav>
          </aside>
          <div className="case-narrative">
            {sections.map((key, i) => (
              <section key={key} id={`project-${key}`}>
                <p className="case-section-number" aria-hidden="true">
                  0{i + 1}
                </p>
                <Heading as="h2">{l[key]}</Heading>
                <p className="case-prose">{p[key]}</p>
              </section>
            ))}
            {p.technologies.length > 0 && (
              <section>
                <Heading as="h2">{l.technologies}</Heading>
                <ul className="project-tags">
                  {p.technologies.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </section>
            )}
            {p.testimonial && (
              <section className="case-quote">
                <p className="tv-eyebrow">{l.testimonial}</p>
                <blockquote>
                  <p>{p.testimonial}</p>
                  {p.testimonialAttribution && <footer>{p.testimonialAttribution}</footer>}
                </blockquote>
              </section>
            )}
          </div>
        </div>
      </Container>
      {p.gallery.length > 0 && (
        <section id="project-gallery" className="case-gallery">
          <Container>
            <Heading as="h2">{l.gallery}</Heading>
            <div>
              {p.gallery.map((img, i) => (
                <figure key={i}>
                  <a href={img.url} target="_blank" rel="noopener noreferrer">
                    <Image src={img.url} alt={img.alt} width={1200} height={800} unoptimized />
                  </a>
                  {img.caption && <figcaption>{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}
      {p.industries.length + p.services.length + p.solutions.length > 0 && (
        <section className="case-relations">
          <Container>
            <div>
              {(['industries', 'services', 'solutions'] as const).map(
                (key) =>
                  p[key].length > 0 && (
                    <section key={key}>
                      <Heading as="h2">{l[key]}</Heading>
                      <ul>
                        {p[key].map((r) => (
                          <li key={r.id}>
                            <a href={`/${p.locale}/${key}/${r.slug}`}>
                              {r.title}
                              <span aria-hidden="true">↗</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ),
              )}
            </div>
          </Container>
        </section>
      )}
      <section className="case-contact">
        <Container>
          <div>
            <p className="tv-eyebrow">TEVONIQ</p>
            <Heading as="h2">{l.contactTitle}</Heading>
            <p>{l.contactBody}</p>
            <ButtonLink href={`/${p.locale}/contact`}>{l.contact}</ButtonLink>
          </div>
        </Container>
      </section>
    </article>
  );
}
