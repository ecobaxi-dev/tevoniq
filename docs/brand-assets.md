# TEVONIQ asset registry

All nine files in `apps/web/public/brand/` were visually inspected and their dimensions, format, alpha channel, and SHA-256 fingerprints read without modifying any file. All are sRGB PNGs. Dimensions below describe the full original canvas, including transparent padding, not the visible logo bounds.

| File           | Dimensions (px) | Alpha channel | Registry reference                                        | Classification                                                             |
| -------------- | --------------- | ------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| logo.png       | 1254 × 1254     | Yes           | `brandAssets.logo.primary`, `.dark`                       | Dark wordmark with tagline on a square transparent canvas; light surface   |
| Hlogo.png      | 1672 × 941      | Yes           | `brandAssets.logo.horizontal`                             | Horizontal icon/wordmark lockup with supplied light effects; light surface |
| icon.png       | 1254 × 1254     | Yes           | `brandAssets.icons.brand`, `brandAssets.favicon.fallback` | Blue/cyan/gold brand symbol                                                |
| mainpage.png   | 1672 × 941      | No            | `brandAssets.uiReference.home`                            | Complete homepage mockup with embedded English text, buttons, and branding |
| colorplate.png | 1448 × 1086     | No            | `brandAssets.brandGuidelines.colors`                      | Color palette guideline sheet                                              |
| tevo1.png      | 1448 × 1086     | No            | `brandAssets.brandGuidelines.typography`                  | Typography guideline sheet                                                 |
| tevo2.png      | 1448 × 1086     | No            | `brandAssets.uiReference.controls`                        | Buttons, inputs, navigation, and icon reference sheet                      |
| tevo3.png      | 1448 × 1086     | No            | `brandAssets.brandGuidelines.backgrounds`                 | Background and gradient contact sheet; no standalone backgrounds           |
| tevo4.png      | 1448 × 1086     | No            | `brandAssets.uiReference.cardsAndSections`                | Card/section reference sheet with unverified sample statistics             |

## Central API

`apps/web/src/config/assets.ts` is the only application source for paths and intrinsic dimensions. `assetCatalog` has one entry per file. `brandAssets` provides semantic references and explicitly typed optional slots. Multiple references reuse the same descriptor; no duplicate files are created.

`logo.dark` describes the color of the supplied wordmark, not a logo for a dark background. No standalone light or monochrome logo has been supplied. The white marks visible inside mockups are not separate logo files and must not be extracted or recolored.

## Missing assets and fallbacks

| Slot                                     | Current value | Behavior                                                                                            |
| ---------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| `logo.light`, `logo.monochrome`          | `null`        | `BrandLogo` resolves to the official primary logo on its required light surface                     |
| `favicon.primary`                        | `null`        | Metadata links directly to the original brand icon PNG; no ICO or resized derivatives are generated |
| `hero.home`                              | `null`        | `BrandImage` omits the image; retain the section's existing background color                        |
| `backgrounds.space`, `backgrounds.light` | `null`        | No background image; retain existing brand color tokens                                             |
| `gradients.blueCyan`, `gradients.navy`   | `null`        | No supplied standalone gradient bitmap; omit the image                                              |
| `serviceImages`, `technologyImages`      | Empty maps    | Missing keys return `undefined`; `BrandImage` renders nothing                                       |

The large brand icon is a functional favicon fallback, not a purpose-designed small-size favicon. Its original canvas and padding are preserved.

Do not use `mainpage.png` as a live hero: embedded text cannot be translated by the CMS and its buttons are pixels, not controls. Do not use `tevo3.png` as a full background or crop it into new assets. The card mockup's figures are not verified facts. Reference descriptors have the `reference` usage and are excluded from the public `BrandImage` component's accepted asset type.

## Rendering

```tsx
import { brandAssets } from '@/config/assets';
import { BrandImage, BrandLogo } from '@/components/brand-image';

// Requesting the missing light variant safely uses the original on a light surface.
<BrandLogo variant="light" />;

// Currently renders nothing; supplying an official hero later needs only a registry change.
<BrandImage asset={brandAssets.hero.home} alt="" />;
```

`BrandImage` uses Next.js Image with registered intrinsic dimensions, proportional CSS sizing (`width: 100%; height: auto`), and `object-fit: contain`. Logos and brand icons use `unoptimized` to serve original bytes without generated resized/re-encoded variants. Normal responsive browser display does not alter the source image. Original transparent padding is retained; no cropping, stretching, filters, or color changes are applied. Use a sized parent to control layout. Other supplied artwork can use Next.js optimization and the `sizes` prop. Loading is lazy by default; the existing above-the-fold logo explicitly loads eagerly.

Alternative text for future meaningful artwork must come from translated CMS content; use `alt=""` for decorative imagery. Reference descriptions here are developer documentation, not public business copy.

## Adding or replacing an official asset

1. Place the approved original in `public/brand/` without editing existing originals.
2. Inspect its format, intrinsic dimensions, transparency, and intended usage.
3. Add/update its descriptor in `assetCatalog` and point the semantic registry slot to it.
4. For logos, set `surface` to the required light or dark background. `BrandLogo` uses this metadata automatically.
5. Update this inventory and run lint, type checking, build, and the frontend smoke test.

Reference sheets remain reference-only unless an appropriate standalone official file is provided. Do not create visual replacements from them.
