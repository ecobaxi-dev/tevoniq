'use client';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { websiteDesigns, designImage, type DesignLocale } from '@/content/website-designs';
export function WebsiteGallery({ locale }: { locale: DesignLocale }) {
  const ar = locale === 'ar';
  const [sector, setSector] = useState('all');
  return (
    <>
      <div
        className="design-filters"
        role="group"
        aria-label={ar ? 'تصفية النماذج' : 'Filter designs'}
      >
        <button aria-pressed={sector === 'all'} onClick={() => setSector('all')}>
          {ar ? 'جميع التصاميم' : 'All designs'}
        </button>
        {websiteDesigns.map((d) => (
          <button
            key={d.slug}
            aria-pressed={sector === d.sector}
            onClick={() => setSector(d.sector)}
          >
            {d[locale].name}
          </button>
        ))}
      </div>
      <div className="design-grid">
        {websiteDesigns
          .filter((d) => sector === 'all' || sector === d.sector)
          .map((d, i) => {
            const c = d[locale];
            return (
              <article key={d.slug} className={`design-card design-card--${d.sector}`}>
                <Link href={`/${locale}/website-designs/${d.slug}`} className="design-card-image">
                  <Image
                    src={designImage(`preview-${locale}-${d.slug}`)}
                    alt={c.name}
                    width={1400}
                    height={900}
                    loading="lazy"
                    sizes="(max-width: 760px) 100vw, 50vw"
                  />
                  <span>
                    {ar ? 'معاينة تصميم' : 'Design preview'} / {String(i + 1).padStart(2, '0')}
                  </span>
                  <strong>{c.brand}</strong>
                </Link>
                <div>
                  <h2>{c.name}</h2>
                  <p>{c.summary}</p>
                  <p className="design-fit">{c.audience}</p>
                  <div className="design-actions">
                    <Link className="design-button" href={`/${locale}/website-designs/${d.slug}`}>
                      {ar ? 'التفاصيل والإمكانات' : 'Details & capabilities'} ↗
                    </Link>
                    <a href={`/previews/${locale}/${d.slug}`}>
                      {ar ? 'جرّب التصميم' : 'Try the design'} ←
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
