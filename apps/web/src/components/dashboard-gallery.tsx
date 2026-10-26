'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dashboardModels, type DashboardLocale } from '@/content/dashboard-models';
export function DashboardGallery({ locale }: { locale: DashboardLocale }) {
  const ar = locale === 'ar';
  const [filter, setFilter] = useState('all');
  return (
    <>
      <div
        className="design-filters"
        role="group"
        aria-label={ar ? 'تصفية اللوحات' : 'Filter dashboards'}
      >
        <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          {ar ? 'جميع اللوحات' : 'All dashboards'}
        </button>
        {dashboardModels.map((model) => (
          <button
            key={model.slug}
            aria-pressed={filter === model.slug}
            onClick={() => setFilter(model.slug)}
          >
            {model[locale].name}
          </button>
        ))}
      </div>
      <div className="design-grid">
        {dashboardModels
          .filter((model) => filter === 'all' || filter === model.slug)
          .map((model) => {
            const c = model[locale];
            return (
              <article className="design-card" key={model.slug}>
                <a
                  className="design-card-image dashboard-card-image"
                  href={`/previews/${locale}/dashboards/${model.slug}`}
                >
                  <Image
                    unoptimized
                    src={`/brand/dashboard-demos/${locale}-${model.slug}.webp`}
                    alt={c.name}
                    width={1440}
                    height={960}
                    loading="lazy"
                  />
                  <span>{ar ? 'لوحة تفاعلية' : 'Interactive dashboard'}</span>
                </a>
                <div>
                  <h2>{c.name}</h2>
                  <p>{c.audience}</p>
                  <div className="dashboard-card-tags">
                    <span>{ar ? 'فلاتر مترابطة' : 'Connected filters'}</span>
                    <span>{ar ? 'رسوم محسوبة' : 'Calculated charts'}</span>
                    <span>{ar ? 'تفاصيل وتصدير' : 'Details & export'}</span>
                  </div>
                  <div className="design-actions">
                    <Link
                      className="design-button"
                      href={`/${locale}/dashboard-demos/${model.slug}`}
                    >
                      {ar ? 'الفائدة ومصادر البيانات' : 'Value & data sources'} ↗
                    </Link>
                    <a href={`/previews/${locale}/dashboards/${model.slug}`}>
                      {ar ? 'جرّب اللوحة' : 'Try the dashboard'} ←
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
