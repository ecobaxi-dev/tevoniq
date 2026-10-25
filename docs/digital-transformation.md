# Digital transformation service

The published `/[locale]/services/digital-transformation` service has a dedicated presentation in English, Arabic and Turkish. The existing service API controls publication, metadata, breadcrumbs and related service/project records. No migration or new environment variable is required.

## Current presentation

The page retains the hero, transformation overview, five service offerings, six case studies, four benefits, nine challenges, seven delivery stages, nine expertise tabs with 57 list items, a technology catalogue, FAQ and the existing contact form.

At the user's request, the client-story/logo section, external adoption framework, recognition/compliance section, expert profiles, quotations, report feature and external organization profile have been removed. The overview no longer contains attributed market statistics or outbound links. The technology catalogue uses plain platform names rather than another company's partnership badges. Related-service links are restricted to existing internal service routes. The sticky navigation includes only rendered sections.

No external publication links or source references are rendered in this service or its six case-detail pages. The case descriptions retain a brief statement that they are not TEVONIQ-delivered projects. The separate AI development service keeps its existing attribution and links.

The original media provenance remains in [the internal asset manifest](digital-transformation-assets.json); it is not rendered on the site. Previously imported media that is no longer used is not displayed.

## Maintenance

Localized service copy lives in `apps/web/src/content/digital-transformation.json`; the hero and technology names in `digital-transformation-assets.json`; internal service links in `digital-transformation-links.json`; and case narratives in `digital-case-studies.json`.

`digital-transformation-service.tsx` and its stylesheet render the page. `digital-expertise.tsx` implements accessible vertical tabs with Up/Down wrapping and Home/End navigation. Native FAQ controls support mouse and keyboard. Contact submissions use the existing lead infrastructure, with an internal contact-page fallback.

## Verification

Browser checks passed in English and Arabic at desktop widths and Arabic/Turkish at phone widths. Removed sections were absent, all remaining service/detail links stayed on the site, source-publication references were absent, and the nine expertise tabs and six case studies remained functional. No page errors or horizontal overflow were recorded. Two retained images with embedded publisher marks were replaced by locally authored SVG diagrams; their dimensions, rendering and gallery paths were checked. The final production build succeeded, all 182 repository tests passed, and TypeScript, ESLint and formatting checks passed.
