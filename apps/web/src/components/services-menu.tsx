'use client';
import Image from 'next/image';
import { navigationVisuals } from '@/content/navigation-visuals';
import { Heading } from '@tevoniq/ui';

import { useId, useState } from 'react';
import Link from 'next/link';
import { NavigationMenu } from 'radix-ui';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import type { NavigationGroup } from '@/config/navigation';
import { localizedHref } from '@/config/navigation';

export function ServicesMenu({
  groups,
  locale,
  allLabel,
  onNavigate,
}: {
  groups: NavigationGroup[];
  locale: Locale;
  allLabel: string;
  onNavigate: () => void;
}) {
  const [selected, setSelected] = useState(groups[0]?.id ?? '');
  const id = useId();
  const active = groups.find((group) => group.id === selected) ?? groups[0];
  const visual =
    locale !== 'tr' && active && Object.hasOwn(navigationVisuals, active.id)
      ? navigationVisuals[active.id as keyof typeof navigationVisuals]
      : undefined;
  const featured =
    visual && active?.items.some((item) => item.href === visual.href) ? visual : undefined;
  const itemCount = active?.items.length ?? 0;
  return (
    <div className="site-services-menu">
      <div className="site-services-categories" role="group" aria-label={allLabel}>
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            aria-pressed={active?.id === group.id}
            aria-controls={`${id}-content`}
            onClick={() => setSelected(group.id)}
          >
            <span>{group.label}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="site-services-content" id={`${id}-content`}>
        <header>
          <Heading as="h2">{active?.label}</Heading>
          <NavigationMenu.Link asChild>
            <Link href={localizedHref(locale, '/services')} onClick={onNavigate}>
              {allLabel}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </NavigationMenu.Link>
        </header>
        <ul aria-label={active?.label} data-item-count={itemCount}>
          {active?.items.map((item) => (
            <li key={item.id}>
              <NavigationMenu.Link asChild>
                <Link href={localizedHref(locale, item.href)} onClick={onNavigate}>
                  <span className="site-services-name">
                    {item.label}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                  <span className="site-services-summary">{item.description}</span>
                </Link>
              </NavigationMenu.Link>
            </li>
          ))}
          {featured && (locale === 'ar' || locale === 'en') && (
            <li
              className="site-services-feature"
              data-layout={itemCount === 1 || itemCount % 2 === 0 ? 'banner' : 'tile'}
            >
              <NavigationMenu.Link asChild>
                <Link
                  href={localizedHref(locale, featured.href)}
                  onClick={onNavigate}
                  className="site-services-feature-link"
                >
                  <span className="site-services-feature-image">
                    <Image
                      src={featured.src}
                      alt=""
                      width={560}
                      height={373}
                      unoptimized
                      loading="lazy"
                      sizes="(min-width: 1280px) 340px, 0px"
                    />
                  </span>
                  <span className="site-services-feature-copy">
                    <strong>{featured[locale].title}</strong>
                    <span>
                      {featured[locale].caption}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </NavigationMenu.Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
