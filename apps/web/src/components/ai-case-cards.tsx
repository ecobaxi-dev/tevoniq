import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import { aiCaseStudies, aiCaseCopy, aiCaseStudyHref } from '@/content/ai-case-studies';
import './ai-case-studies.css';

export function AiCaseCards({
  locale,
  exclude,
  serviceSlug = 'ai-augmented-development',
}: {
  locale: Locale;
  exclude?: string;
  serviceSlug?: string;
}) {
  const c = aiCaseCopy[locale];
  return (
    <div className="ai-case-cards">
      {aiCaseStudies
        .filter((s) => s.slug !== exclude && s.serviceSlug === serviceSlug)
        .map((study) => {
          const t = study.translations[locale];
          return (
            <article className="ai-case-card" key={study.slug}>
              <a href={aiCaseStudyHref(locale, study.slug)} className="ai-case-card-link">
                <div className="ai-case-card-image">
                  <Image
                    src={study.cover}
                    alt=""
                    width={study.images.cover.width}
                    height={study.images.cover.height}
                    unoptimized
                    sizes="(max-width: 767px) 100vw, 33vw"
                  />
                  <span>{t.sector}</span>
                </div>
                <div className="ai-case-card-body">
                  <span className="ai-case-card-label">{c.label}</span>
                  <h3>{t.title}</h3>
                  <div className="ai-case-card-metric">
                    <strong dir="ltr">{study.metrics[0]!.value}</strong>
                    <span>{study.metrics[0]!.labels[locale]}</span>
                  </div>
                  <span className="ai-case-card-read">
                    {c.read}
                    <ArrowUpRight size={21} aria-hidden="true" />
                  </span>
                </div>
              </a>
            </article>
          );
        })}
    </div>
  );
}
