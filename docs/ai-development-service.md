# AI-augmented development service

The existing `/[locale]/services/ai-augmented-development` route now has a dedicated Arabic, English and Turkish presentation. Publication, route validation, metadata, breadcrumbs and related CMS records continue through the existing service API.

## Presentation

- Split hero with an original, code-rendered development workflow illustration.
- Engineering principles, sticky section links, challenge/response comparison, six consulting capabilities and four engineering capabilities.
- Three explicitly illustrative application scenarios, four adoption stages with outcomes, tool categories and delivery governance.
- Native keyboard-accessible FAQ disclosures and matching FAQ structured data.
- Existing contact lead form and submission infrastructure, with a localized contact-page fallback when lead options are unavailable. No new endpoint or form submission mechanism.

The visual reference was https://www.n-ix.com/ai-augmented-development-services/, inspected with REA (desktop screenshot and accessibility tree). Its split hero, alternating sections, service grids, lifecycle progression and FAQ informed the layout. The service hero uses native HTML/CSS and existing Lucide icons. The later case-study addition below contains locally hosted reference media and reported project metrics, kept separate from TEVONIQ’s own claims.

The localized presentation text is maintained in `apps/web/src/content/ai-development.ts`, and the layout in `apps/web/src/components/ai-development-service.tsx` and its stylesheet. This dedicated presentation replaces generic CMS body blocks on this one service; CMS related-services and related-projects blocks remain rendered. The service record must remain published. No data migration or new environment variable is needed.

## Verification

TypeScript passed. Local browser scenarios verified Arabic at 320px and 390px, English at 1440px, and Turkish at 390px: HTTP 200, one H1, all section anchors, six consulting cards, four stages, a rendered contact form and FAQ opening/closing by mouse and keyboard. Each tested viewport had document width equal to viewport width and no captured page errors. No form was submitted during verification. Native FAQ disclosures need no client script; hover transitions honor reduced-motion preferences.

## Typography and complete case studies

The hero lead is separately rendered in blue Geologica with a scoped font face using the existing OFL font asset. It stays on one line; the remaining hero text has its own scale. Section titles use the full content width, a smaller editorial scale and a single line on desktop (1024px and above), while retaining readable wrapping on phones. Scoped ID specificity overrides the public heading rules without changing other services. Contrast was improved for small labels and muted text.

Three case studies from the reference service page are reproduced as dedicated `/[locale]/insights/case-studies/[slug]` pages. English preserves all four core source sections with neutral delivery-team naming; Arabic and Turkish translations cover client background, business challenge, implementation and reported value. Client context, technologies and expertise are retained. The source’s reported metrics are labeled as external engagement results, not TEVONIQ delivery results. Source-publication links remain available.

The user explicitly confirmed rights of use on 2026-10-25. Six original WebP images are served locally; asset sources and SHA-256 digests are recorded in `ai-case-studies-assets.json`. The case pages were inspected through browser DOM/media inventory. No video, source or iframe element was found in the three source case-study pages; no video was invented or substituted. Main navigation, contact form, client logos and unrelated related-blog content from the source site are outside the case-study content and use the existing TEVONIQ site components instead.

Data lives in `apps/web/src/content/ai-case-studies.json`, localized labels in the adjacent `.ts` file, and cards/detail styling in the `ai-case-*` components. The existing sitemap now includes all nine localized study URLs while respecting enabled languages and CMS indexing policies. Unknown study slugs return 404. This addition requires no database migration or new environment variables.

Final verification: production workspace build and all 182 repository tests passed. Browser checks covered all three detail pages in Arabic, English and Turkish, desktop widths of 1024px/1440px and phone widths of 320px/390px. All six images loaded, section links resolved, unknown slugs returned 404, and no horizontal overflow or page errors were recorded. Automated WCAG checks reported no violations in the English service section and Arabic case-detail page. ESLint and Prettier passed for the changed code.
