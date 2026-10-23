'use client';
import Image from 'next/image';
import { brandAssets } from '@/config/assets';
import { ArrowRight, Play, UsersRound, Cpu, Leaf } from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import { Modal, UIProvider, ButtonLink } from '@tevoniq/ui';
import type { referenceHeroCopy } from '@/content/reference-hero';
const icons = [UsersRound, Cpu, Leaf];
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
        src={locale !== 'tr' ? '/brand/hero-ar-background.png' : brandAssets.uiReference.home.src}
        width={brandAssets.uiReference.home.width}
        height={brandAssets.uiReference.home.height}
        alt=""
        sizes="100vw"
        preload
        unoptimized
      />
      <UIProvider theme="dark" direction={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="artwork-hero-copy">
          <p className="reference-eyebrow">{copy.eyebrow}</p>
          <h1 id="home-title">
            {copy.title}
            <span>{copy.accent}</span>
          </h1>
          <p className="reference-description">{copy.body}</p>
        </div>
        <div className="artwork-hero-actions">
          <a className="reference-start" href="#solutions">
            <span>{copy.start}</span>
            <ArrowRight size={20} aria-hidden="true" />
          </a>
          {copy.videoUrl && (
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
            const Icon = icons[index] ?? Cpu;
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
