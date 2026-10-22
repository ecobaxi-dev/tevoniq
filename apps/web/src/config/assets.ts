/** Supplied originals only. Paths, intrinsic dimensions, and roles are managed here. */
export type AssetUsage = 'logo' | 'icon' | 'artwork' | 'reference';
export type ImageAsset<Usage extends AssetUsage = AssetUsage> = Readonly<{
  src: `/brand/${string}`;
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'webp' | 'avif' | 'svg' | 'ico';
  hasAlpha: boolean;
  usage: Usage;
}>;
export type LogoAsset = ImageAsset<'logo'> & Readonly<{ surface: 'light' | 'dark' }>;

function png<Usage extends AssetUsage>(
  filename: string,
  width: number,
  height: number,
  hasAlpha: boolean,
  usage: Usage,
): ImageAsset<Usage> {
  return { src: `/brand/${filename}`, width, height, format: 'png', hasAlpha, usage };
}

/** One entry per inspected file. Reference sheets are not standalone public artwork. */
export const assetCatalog = {
  wordmark: { ...png('logo.png', 1254, 1254, true, 'logo'), surface: 'light' },
  horizontalLogo: { ...png('Hlogo.png', 1672, 941, true, 'logo'), surface: 'light' },
  brandIcon: png('icon.png', 1254, 1254, true, 'icon'),
  homeMockup: png('mainpage.png', 1672, 941, false, 'reference'),
  colorPalette: png('colorplate.png', 1448, 1086, false, 'reference'),
  typography: png('tevo1.png', 1448, 1086, false, 'reference'),
  controls: png('tevo2.png', 1448, 1086, false, 'reference'),
  backgroundGuidelines: png('tevo3.png', 1448, 1086, false, 'reference'),
  cardsAndSections: png('tevo4.png', 1448, 1086, false, 'reference'),
} as const;

type Artwork = ImageAsset<'artwork'>;
type Reference = ImageAsset<'reference'>;
export type BrandAssetRegistry = Readonly<{
  logo: Readonly<{
    primary: LogoAsset;
    horizontal: LogoAsset;
    /** Dark-colored wordmark for a LIGHT surface, not a dark-background variant. */
    dark: LogoAsset | null;
    light: LogoAsset | null;
    monochrome: LogoAsset | null;
  }>;
  icons: Readonly<{ brand: ImageAsset<'icon'> }>;
  favicon: Readonly<{ primary: ImageAsset<'icon'> | null; fallback: ImageAsset<'icon'> }>;
  hero: Readonly<{ home: Artwork | null }>;
  backgrounds: Readonly<{ space: Artwork | null; light: Artwork | null }>;
  gradients: Readonly<{ blueCyan: Artwork | null; navy: Artwork | null }>;
  serviceImages: Readonly<Record<string, Artwork | undefined>>;
  technologyImages: Readonly<Record<string, Artwork | undefined>>;
  uiReference: Readonly<{ home: Reference; controls: Reference; cardsAndSections: Reference }>;
  brandGuidelines: Readonly<{ colors: Reference; typography: Reference; backgrounds: Reference }>;
}>;

/** Null/empty slots mean NOT SUPPLIED. Never substitute mockups or generated replacements. */
export const brandAssets: BrandAssetRegistry = {
  logo: {
    primary: assetCatalog.wordmark,
    horizontal: assetCatalog.horizontalLogo,
    dark: assetCatalog.wordmark,
    light: null,
    monochrome: null,
  },
  icons: { brand: assetCatalog.brandIcon },
  favicon: { primary: null, fallback: assetCatalog.brandIcon },
  hero: { home: null },
  backgrounds: { space: null, light: null },
  gradients: { blueCyan: null, navy: null },
  serviceImages: {},
  technologyImages: {},
  uiReference: {
    home: assetCatalog.homeMockup,
    controls: assetCatalog.controls,
    cardsAndSections: assetCatalog.cardsAndSections,
  },
  brandGuidelines: {
    colors: assetCatalog.colorPalette,
    typography: assetCatalog.typography,
    backgrounds: assetCatalog.backgroundGuidelines,
  },
};

export type LogoVariant = keyof BrandAssetRegistry['logo'];
export function resolveLogoAsset(variant: LogoVariant = 'primary'): LogoAsset {
  return brandAssets.logo[variant] ?? brandAssets.logo.primary;
}

export function resolveFaviconAsset(): ImageAsset<'icon'> {
  return brandAssets.favicon.primary ?? brandAssets.favicon.fallback;
}
