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
