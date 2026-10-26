'use client';
import Image from 'next/image';
import Link from 'next/link';
import { approvedArabicHeroActions } from '@/content/home-presentation';
import { brandAssets } from '@/config/assets';
import { ArrowRight, Play, UsersRound, Cpu, Leaf, ClipboardCheck } from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import { Modal, UIProvider, ButtonLink } from '@tevoniq/ui';
import type { referenceHeroCopy } from '@/content/reference-hero';
const icons = [UsersRound, Cpu, Leaf];
const arabicIcons = [UsersRound, Cpu, ClipboardCheck];
export function ReferenceHero({
  locale,
  copy,
}: {
  locale: Locale;
  copy: (typeof referenceHeroCopy)[Locale] & { videoUrl?: string };
}) {
  return (
    <section className="artwork-hero" data-locale={locale} aria-labelledby="home-title">
      <Image
        className="artwork-hero-image"
        src={locale === 'ar' ? '/brand/hero-ar-background.webp' : brandAssets.uiReference.home.src}
        width={brandAssets.uiReference.home.width}
        height={brandAssets.uiReference.home.height}
        alt=""
        sizes="100vw"
        preload
        unoptimized
      />
      <UIProvider theme="dark" direction={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="artwork-hero-copy">
          {locale !== 'ar' && <p className="reference-eyebrow">{copy.eyebrow}</p>}
          <h1 id="home-title">
            {copy.title}
            {locale !== 'ar' && <span>{copy.accent}</span>}
          </h1>
          {locale === 'ar' && <p className="reference-tagline">{copy.accent}</p>}
          <p className="reference-description">{copy.body}</p>
        </div>
        <div className="artwork-hero-actions">
          {locale === 'ar' ? (
            <>
              <Link className="reference-start" href="/ar/contact?intent=quote">
                <span>{copy.start}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="reference-explore" href="/ar/services">
                <span>{approvedArabicHeroActions.explore}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <a className="reference-start" href="#solutions">
              <span>{copy.start}</span>
              <ArrowRight size={20} aria-hidden="true" />
            </a>
          )}
          {locale !== 'ar' && copy.videoUrl && (
            <Modal
              title={copy.watch}
              description={copy.body}
              closeLabel={copy.close}
              trigger={
                <button type="button" className="reference-video">
                  <Play size={20} aria-hidden="true" />
                  <span>{copy.watch}</span>
                </button>
              }
            >
              <video
                controls
                playsInline
                preload="none"
                src={copy.videoUrl}
                aria-label={copy.watch}
                style={{ width: '100%' }}
              />
              <ButtonLink href={`/${locale}/contact`}>{copy.contact}</ButtonLink>
            </Modal>
          )}
        </div>
        <ul className="artwork-hero-values">
          {copy.values.map((value, index) => {
            const Icon = (locale === 'ar' ? arabicIcons : icons)[index] ?? Cpu;
            return (
              <li key={value.title}>
                <Icon aria-hidden="true" />
                <div>
                  <strong>{value.title}</strong>
                  <span>{value.body}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </UIProvider>
    </section>
  );
}
