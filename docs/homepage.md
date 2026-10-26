# Homepage CMS

`/en`, `/tr` and `/ar` load their published copy and hero from `GET /api/v1/home/:locale`. The original copy in `src/content/home.ts` and `reference-hero.ts` is now a bootstrap source for importing an initial homepage, not a public fallback. If an editor unpublishes a language it returns 404; an API failure uses the page error boundary rather than republishing old text.

## Editing

Use **Admin → Homepage** (`/admin/home`). Select a language, edit fields, save a draft, then publish. A draft never changes the published snapshot. Publication requires `pages.publish`; draft updates require `pages.update`. Saves use optimistic version checks, serializable transactions and an audit entry. Successful CMS writes invalidate the public content cache.

The hero video is optional. Add an HTTPS video URL or an uploaded `/media/` video path to enable the control. Without a URL, the website hides the video button. Branding and artwork remain unchanged. Interface labels and the supplemental technology diagrams continue to use the existing localized component resources.

Initial local import (does not overwrite existing homepages):

```sh
npm run build
node scripts/import-homepage.mjs --apply
```

## Collections

- Industries use the validated public localized industry list.
- Projects use the public privacy projection and must be verified, published and featured; at most three appear.
- Insights use published/scheduled articles whose publication date has arrived, newest first, at most three.
- Partners use published, non-archived records for the exact language with **Partnership verified and approved for public display** checked in Admin → Partners. At most twelve appear, also on the company partners page.

Empty or unavailable optional collections are hidden. Records are never fabricated to fill a section. Public data is cached with the shared CMS content tag and expires immediately after a successful CMS proxy write; direct database imports require cache invalidation or a web restart in production.

Verification: `tests/home.test.mjs`, `tests/home-cms.test.mjs`, `tests/home.live.mjs` and the homepage Playwright suite. The live test creates isolated temporary records, verifies all four collection types appear/disappear as publication changes, and deletes its records in `finally`.

## Approved Arabic SME hero — October 2026

The owner approved the headline “حلول رقمية تنظّم أعمالك”, a smaller separate tagline “تقنيات متقدمة لغد أكثر ذكاءً”, and company-voice SME copy. The three value labels now describe direct communication, practical solutions and clear delivery steps. The approved copy is centralized in `home-presentation.ts`; Arabic bootstrap content uses it, and exact old bootstrap fields from existing CMS records are upgraded for presentation in both the public page and home editor. Custom CMS text, media settings and non-Arabic content remain preserved. No database write or re-import is required. Unpublished home content still stays unpublished. The other homepage redesign sections remain proposals.

The owner subsequently selected the clear white header. Arabic and English headers now group navigation into Home, Services, Solutions, Products and Company, while retaining secondary destinations under Company and preserving the footer navigation. Published custom labels and service groups are retained. Turkish navigation is unchanged. The Arabic hero omits its small eyebrow label and shows two actions: “لنناقش احتياجك” to `/ar/contact?intent=quote` and “استكشف الخدمات” to `/ar/services`. Existing Arabic “ابدأ الآن” CMS text is upgraded through the same presentation adapter; custom button copy remains editable. The video setting is retained, but the Arabic hero displays only the two approved actions.

## SME service cards

Arabic and English homepages now show four code-owned service cards after the product entries: business websites, work management systems, automation/integrations and dashboards/reports. These replace the old six-card solutions section in those languages; `#solutions` stays valid for existing links. The Turkish section is unchanged. Each card includes an original interface illustration, a clearly labelled hypothetical example, native expandable delivery details and a localized contact link. No client claims or results are added. No database content is overwritten; previous CMS solution copy is retained but no longer rendered in the Arabic/English homepage section. Edit these cards in `src/content/home-services.ts`. The public CMS home publication boundary remains unchanged.

The pre-change version is saved in remote tag `checkpoint/pre-sme-service-cards-20261026` at `6e37f1a`. See [rollback instructions](home-service-cards-rollback-ar.md); prefer reverting the implementation commit over discarding later unrelated work.

## Product entry order

The owner approved this order: header, hero, Pesto entry, Al Muhamoon / Advocas entry, then the four service cards. `AdvocasHomeEntry` uses the supplied transparent PNG unchanged at `public/brand/advocas-logo.png`, with a teal treatment matching Pesto's three-column banner layout. It links internally to the localized Advocas page and to contact for platform development. The previous English homepage Advocas showcase is replaced by this single banner; the full product page remains available. Existing Pesto downloads, activation and trial content are unchanged. No Turkish product entry is added.
