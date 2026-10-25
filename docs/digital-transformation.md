# Digital transformation service

The published `/[locale]/services/digital-transformation` service now has a dedicated presentation in English, Arabic and Turkish. The existing service API still controls publication, metadata, breadcrumbs and CMS related-service/project records. No database migration or new environment variable is required.

## Reference and scope

Reference: https://www.n-ix.com/digital-transformation/, inspected in a browser on 2026-10-25. The user explicitly requested the full page and had confirmed rights of use earlier in this session. Asset URLs, local paths, sizes and SHA-256 hashes are recorded in [the asset manifest](digital-transformation-assets.json).

The implementation includes:

- Split hero with the original image and sticky section navigation, adapted to TEVONIQ’s navy/blue identity.
- Twelve source-client logos, overview and attributed market indicators, the external APEX framework and its reported adoption figures, and two adapted expert perspectives.
- Five consulting/implementation offerings, six full case studies, four business benefits, a source-report feature, nine digital challenges and seven transformation stages.
- Nine accessible expertise tabs containing all 57 source list items, 18 source-partner logos, 12 recognition/compliance cards with original publication links, the source organization’s published profile and four source technology leaders.
- Five native FAQ disclosures with corresponding structured data, all 29 related-service links, and the existing TEVONIQ lead form with a contact-page fallback when options are unavailable.

Source-owned client relationships, partner badges, certifications, recognitions, people and performance figures are explicitly presented as external material. They are not represented as TEVONIQ credentials or delivery results. The main service offering and contact journey are adapted for TEVONIQ. Links to existing equivalent service pages stay internal; source-only related topics retain their original external links.

The source report is requested through its publisher’s form. The local feature links to that original request flow and does not claim to download or email a PDF. No embedded video, iframe, video source element or direct video URL was observed in the service page or its six case-study pages. No video or customer testimonial was invented; the two quotations are expert perspectives actually present in the source.

## Case studies

Full English case narratives and localized Arabic/Turkish versions include background, challenge, implementation and reported outcomes, along with client context, technologies and expertise. The healthcare study also retains its separate delivery-approach section and both original diagrams. All six case covers and seven body images are local assets.

The new detail slugs under `/[locale]/insights/case-studies/` are:

- `telecom-customer-service-genai`
- `clinical-trial-modernization`
- `brand-protection-security`
- `media-platform-microservices`
- `retail-supply-chain`
- `retail-ai-prototyping`

The existing case-study renderer now supports multiple galleries and a service-specific return/contact link. Cards are filtered by service so the AI development page keeps its original three studies. The sitemap discovers the six additional studies in all enabled locales and retains existing CMS indexing policies.

## Source maintenance

- `apps/web/src/content/digital-transformation.json`: localized service copy, expertise lists and recognition descriptions.
- `apps/web/src/content/digital-transformation-assets.json`: local media, source links and people.
- `apps/web/src/content/digital-transformation-links.json`: all related-service links.
- `apps/web/src/content/digital-case-studies.json`: localized case narratives, metrics and image galleries.
- `apps/web/src/components/digital-transformation-service.tsx` and stylesheet: dedicated presentation.
- `apps/web/src/components/digital-expertise.tsx`: roving-focus vertical tabs. Up/Down wrap between tabs; Home/End move to the first/last tab. Only the selected locale’s expertise data is passed to this client component.

Native FAQ controls work with mouse and keyboard. Transitions respect reduced-motion preferences. Source assets are served directly from the repository rather than hotlinked or passed through an external image proxy. No contact form was submitted during verification.

## Verification

The production workspace build and all 182 repository tests passed. ESLint, Prettier and `git diff --check` passed for the changes. Browser scenarios exercised English at 1440px/320px, Arabic at 1440px/320px, and Turkish at 1024px/390px. Checks covered all nine expertise tabs and their 57 list items, click and keyboard selection including Home/End and wrapping Up/Down navigation, FAQ mouse/keyboard disclosure, anchor targets, six study cards, all local images, and a rendered contact form without submitting it.

All six detail pages were checked in each browser configuration, including section counts, the healthcare study’s additional approach and image, service-specific return links, loaded images and narrow-screen overflow. No page errors or document horizontal overflow were recorded. Automated WCAG checks reported no violations in the English/Arabic service content or the English healthcare detail page. The AI development page still displayed its three studies. Unknown study slugs returned 404, and all 18 new localized study URLs appeared in the sitemap.
