# AI-augmented development service

The existing `/[locale]/services/ai-augmented-development` route now has a dedicated Arabic, English and Turkish presentation. Publication, route validation, metadata, breadcrumbs and related CMS records continue through the existing service API.

## Presentation

- Split hero with an original, code-rendered development workflow illustration.
- Engineering principles, sticky section links, challenge/response comparison, six consulting capabilities and four engineering capabilities.
- Three explicitly illustrative application scenarios, four adoption stages with outcomes, tool categories and delivery governance.
- Native keyboard-accessible FAQ disclosures and matching FAQ structured data.
- Existing contact lead form and submission infrastructure, with a localized contact-page fallback when lead options are unavailable. No new endpoint or form submission mechanism.

The visual reference was https://www.n-ix.com/ai-augmented-development-services/, inspected with REA (desktop screenshot and accessibility tree). Its split hero, alternating sections, service grids, lifecycle progression and FAQ informed the layout. All new assets are native HTML/CSS and existing Lucide icons; no reference artwork, client logos, testimonials, proprietary frameworks or performance statistics are included.

The localized presentation text is maintained in `apps/web/src/content/ai-development.ts`, and the layout in `apps/web/src/components/ai-development-service.tsx` and its stylesheet. This dedicated presentation replaces generic CMS body blocks on this one service; CMS related-services and related-projects blocks remain rendered. The service record must remain published. No data migration or new environment variable is needed.

## Verification

TypeScript passed. Local browser scenarios verified Arabic at 320px and 390px, English at 1440px, and Turkish at 390px: HTTP 200, one H1, all section anchors, six consulting cards, four stages, a rendered contact form and FAQ opening/closing by mouse and keyboard. Each tested viewport had document width equal to viewport width and no captured page errors. No form was submitted during verification. Native FAQ disclosures need no client script; hover transitions honor reduced-motion preferences.
