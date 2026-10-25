import Image from 'next/image';
import type { Locale } from '@tevoniq/types';
import { conceptArt, visualLabels, type ConceptArt } from '@/config/concept-art';
import './concept-visuals.css';
import { SolutionIllustration } from './solution-illustration';

export function ConceptVisual({
  art,
  locale,
  hero = false,
  animated = true,
}: {
  art: ConceptArt;
  locale: Locale;
  hero?: boolean;
  animated?: boolean;
}) {
  if (art.scene)
    return (
      <SolutionIllustration scene={art.scene} locale={locale} hero={hero} animated={animated} />
    );
  return (
    <figure className={`concept-visual${hero ? ' concept-visual--hero' : ''}`}>
      <Image
        src={art.src}
        alt={art.alt[locale]}
        width={1536}
        height={1024}
        sizes={
          hero
            ? '(max-width: 767px) 90vw, 45vw'
            : '(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw'
        }
        loading={hero ? 'eager' : 'lazy'}
      />
      <figcaption>{visualLabels[locale].caption}</figcaption>
    </figure>
  );
}
export function CatalogVisual({
  slug,
  locale,
  animated = true,
}: {
  slug: string;
  locale: Locale;
  animated?: boolean;
}) {
  const art = conceptArt(slug);
  return art ? <ConceptVisual art={art} locale={locale} animated={animated} /> : null;
}
