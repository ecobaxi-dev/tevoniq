# Projects / Case Studies

Public routes are `/projects` and `/projects/[slug]`, redirecting to English, with localized EN/TR/AR pages. `/admin/projects` manages project records through the existing CMS sessions, proxy, roles and audit system. No sample projects or client claims are seeded or automatically published.

## Editorial fields

The editor supports title, slug, internal client name, client visibility, industry/service/solution relationships, country, city, project date, hero image, ordered gallery, challenge, approach, solution, implementation, technologies, results, testimonial and author, featured/publication flags, ordering and localized SEO.

Hero and gallery fields accept approved HTTPS image URLs or local PNG/JPEG/WebP/AVIF paths, with required alt text, optional captions and previews. Images are rendered without a server-side remote-image fetch proxy. This module does not add a file-upload storage provider. Empty image slots use an abstract CSS card treatment rather than fabricated project imagery.

## Client confidentiality

| `clientVisibility`                      | Public behavior                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `PRIVATE` (database/API/editor default) | No client label or testimonial attribution.                                                                            |
| `ANONYMOUS`                             | Shows the approved localized descriptor, such as “Regional Hospitality Company”; testimonials use the same descriptor. |
| `PUBLIC`                                | Shows the real client name and approved testimonial author.                                                            |

Client visibility controls identity, independently of project publication. A PRIVATE identity can accompany a published case study. Projects default to unpublished, unreviewed and unfeatured. Publication requires a reviewed project and at least one complete published translation. A published translation requires title, summary, challenge, solution and SEO metadata. Anonymous publication additionally requires a descriptor; public identity requires a client name.

Public APIs use an explicit field allowlist. They never return `clientName`, internal testimonial authors for non-public identities, creator/updater fields or raw database rows. The same privacy projection protects public project listings, detail, saved previews and project references in Services, Solutions and Industries. Public reads are `no-store`; draft/unreviewed/missing-language projects return 404.

For non-public client identities, validation rejects the stored client name in public titles, slugs, narrative, results, technologies, SEO, media URLs, alt text or captions. Checks normalize casing, punctuation and URL encoding. The reader also fails closed if legacy/direct database edits bypass validation. Personal testimonial attribution is omitted for PRIVATE and ANONYMOUS identities.

Editors must still review content and imagery for other identifying details, aliases, people, logos and embedded image metadata. Text matching cannot recognize identities visible in pixels or infer every indirect identifier. The publication review checkbox explicitly covers content, client visibility and images.

## Relationships and presentation

`ProjectService` adds a many-to-many Service relationship. Existing `IndustryProject` and `SolutionProject` joins are reused with separate `projectSortOrder` columns, preserving ordering when either CMS module edits its side. Membership changes increment the other editor's version to reject stale writes. Foreign keys and composite keys prevent dangling or duplicate links; deleting a project preserves related Services, Solutions and Industries.

The public catalog combines industry, service and solution filters, search, featured filtering and pagination. Only independently eligible related records qualify. Cards use CMS imagery, approved client labels, location and a case-study link. Detail pages include a hero, project facts, result metrics, section navigation, narrative, technology tags, testimonial, gallery, related records and contact CTA. Optional content is omitted when empty. SEO includes canonical links, eligible hreflang links, OpenGraph image metadata and escaped breadcrumb JSON-LD; the site's existing global indexing policy remains in effect.

Listing privacy checks occur before pagination/counting, including legacy content. This favors confidentiality for the current editorial catalog over relying solely on stored publication flags.

## Migration and verification

`20260909000100_projects` expands existing Project records without replacing IDs or links; client visibility defaults to PRIVATE. Existing records missing the new publication content remain editable but are excluded by the public projection until completed.

- `npm run db:generate` and `npm run db:deploy` generate the client and apply the migration.
- `npm test` includes confidentiality, defaults, anonymous/public requirements, malicious/accidental identity strings, media, dates, relationship filters and stale updates.
- `npm run typecheck`, frontend build and lint check the implementation.
- `node tests/projects.live.mjs` runs opt-in local PostgreSQL/API/browser tests. Defaults: API `http://localhost:4100/api/v1`, frontend `http://localhost:3300`. Start the frontend with matching `API_URL` and `SITE_URL`. Override via `PROJECTS_TEST_API_URL` / `PROJECTS_TEST_WEB_URL`. The script refuses remote/production targets, uses explicitly labeled development fixtures and removes its records/accounts afterward while retaining audit evidence. Run live suites sequentially.

Live evidence is written to `artifacts/projects-verification.json` and `artifacts/projects-*.png`.
