import Image from 'next/image';
import type { ImageAsset, LogoVariant } from '@/config/assets';
import { resolveLogoAsset } from '@/config/assets';

type BrandImageProps = {
  // Reference sheets cannot be passed to this public-facing renderer.
  asset: ImageAsset<'logo' | 'icon' | 'artwork'> | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
};

export function BrandImage({ asset, alt, className, eager = false, sizes }: BrandImageProps) {
  // Missing optional artwork occupies no image slot and never produces a broken URL.
  if (!asset) return null;
  return (
    <span className={className} style={{ display: 'block' }}>
      <Image
        src={asset.src}
        alt={alt}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        loading={eager ? 'eager' : 'lazy'}
        unoptimized={asset.usage === 'logo' || asset.usage === 'icon'}
        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
      />
    </span>
  );
}

export function BrandLogo({
  variant = 'primary',
  eager = false,
}: {
  variant?: LogoVariant;
  eager?: boolean;
}) {
  const asset = resolveLogoAsset(variant);
  // Supplied dark marks and missing-variant fallbacks need a light surface.
  // Preserve transparent padding: no cropping, filters, recoloring, or derivatives.
  return (
    <BrandImage
      asset={asset}
      alt="TEVONIQ — PREMIUM TECHNOLOGY"
      eager={eager}
      className={asset.surface === 'dark' ? 'bg-navy' : 'bg-white'}
    />
  );
}
