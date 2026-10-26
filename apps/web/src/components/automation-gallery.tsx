'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { automationCases, type AutomationLocale } from '@/content/automation-cases';
export function AutomationGallery({ locale }: { locale: AutomationLocale }) {
  const ar = locale === 'ar';
  const [filter, setFilter] = useState('all');
  return (
    <>
      <div
        className="design-filters"
        role="group"
        aria-label={ar ? 'تصفية نماذج الأتمتة' : 'Filter automation demos'}
      >
        <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          {ar ? 'جميع النماذج' : 'All demos'}
        </button>
        {automationCases.map((item) => (
          <button
            key={item.slug}
            aria-pressed={filter === item.slug}
            onClick={() => setFilter(item.slug)}
          >
            {item[locale].name}
          </button>
        ))}
      </div>
      <div className="design-grid">
        {automationCases
          .filter((item) => filter === 'all' || filter === item.slug)
          .map((item) => {
            const c = item[locale];
            return (
              <article className="design-card" key={item.slug}>
                <a
                  className="design-card-image automation-card-image"
                  href={`/previews/${locale}/automation/${item.slug}`}
                >
                  <Image
                    unoptimized
                    src={`/brand/automation-demos/${locale}-${item.slug}.webp`}
                    alt={c.name}
                    width={1440}
                    height={960}
                    loading="lazy"
                  />
                  <span>{ar ? 'محاكاة تفاعلية' : 'Interactive simulation'}</span>
                </a>
                <div>
                  <h2>{c.name}</h2>
                  <p>{c.audience}</p>
                  <div className="automation-card-tags">
                    <span>{ar ? 'شروط واضحة' : 'Clear rules'}</span>
                    <span>{ar ? 'مراجعة وموافقة' : 'Review & approval'}</span>
                    <span>{ar ? 'منع التكرار' : 'Duplicate protection'}</span>
                  </div>
                  <div className="design-actions">
                    <Link
                      className="design-button"
                      href={`/${locale}/automation-demos/${item.slug}`}
                    >
                      {ar ? 'الفائدة وإمكانات الربط' : 'Value & integration options'} ↗
                    </Link>
                    <a href={`/previews/${locale}/automation/${item.slug}`}>
                      {ar ? 'جرّب المسار' : 'Try the flow'} ←
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
