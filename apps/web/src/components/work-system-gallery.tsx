'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { workSystems, type SystemLocale } from '@/content/work-systems';
export function WorkSystemGallery({ locale }: { locale: SystemLocale }) {
  const ar = locale === 'ar';
  const [filter, setFilter] = useState('all');
  return (
    <>
      <div
        className="design-filters"
        role="group"
        aria-label={ar ? 'تصفية الأنظمة' : 'Filter systems'}
      >
        <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          {ar ? 'جميع الأنظمة' : 'All systems'}
        </button>
        {workSystems.map((system) => (
          <button
            key={system.slug}
            aria-pressed={filter === system.slug}
            onClick={() => setFilter(system.slug)}
          >
            {system[locale].name}
          </button>
        ))}
      </div>
      <div className="design-grid">
        {workSystems
          .filter((system) => filter === 'all' || filter === system.slug)
          .map((system) => {
            const c = system[locale];
            return (
              <article className="design-card" key={system.slug}>
                <a
                  className="design-card-image system-card-image"
                  href={`/previews/${locale}/systems/${system.slug}`}
                >
                  <Image
                    src={`/brand/work-systems/${locale}-${system.slug}.webp`}
                    width={1440}
                    height={960}
                    sizes="(max-width:760px) 100vw,50vw"
                    alt={c.name}
                  />
                  <span>{ar ? 'نموذج نظام تفاعلي' : 'Interactive system preview'}</span>
                </a>
                <div>
                  <h2>{c.name}</h2>
                  <p>{c.audience}</p>
                  <div className="system-stage-pills">
                    {c.stages.map((stage) => (
                      <span key={stage}>{stage}</span>
                    ))}
                  </div>
                  <div className="design-actions">
                    <Link className="design-button" href={`/${locale}/work-systems/${system.slug}`}>
                      {ar ? 'التفاصيل ومسار العمل' : 'Details & workflow'} ↗
                    </Link>
                    <a href={`/previews/${locale}/systems/${system.slug}`}>
                      {ar ? 'جرّب النظام' : 'Try the system'} ←
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
    </>
  );
}
