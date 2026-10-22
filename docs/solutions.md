# Solutions CMS

Solutions describe complete business outcomes. Services describe technical capabilities. They are separate database entities, controllers, routes and editorial records. Solutions refer to existing Services through ordered foreign-key relationships; service titles, translations and descriptions are never copied into Solutions.

## Routes and publication

- `/solutions` and `/solutions/[slug]` redirect to English.
- `/{en|tr|ar}/solutions` provides localized search, featured filtering and pagination. The API also accepts an eligible Service slug filter.
- `/{en|tr|ar}/solutions/[slug]` renders only an active Solution with `published=true`, `status=PUBLISHED`, and a published translation in the requested language. Missing translations do not fall back to English.
- `/admin/solutions` uses the existing CMS cookie proxy, sessions and backend guards. SUPER_ADMIN, ADMIN and CONTENT_MANAGER can manage records; EDITOR and VIEWER retain read-only access.
- `/api/v1/cms/solutions/:id/preview?locale=ar` is authenticated and `private, no-store`. The admin preview displays saved content using the public renderer. There is no public preview token or query bypass.
- `/api/v1/cms/solutions/:id/audit` returns paginated audit history, including history after deletion.

Activation, feature state and publication are independent. Featured drafts remain private. The write contract keeps `status` and `published` consistent; the public query checks both. Individual translation publication requires a hero, short description and SEO title/description. Empty optional sections are omitted by the editor; empty/ineligible relationship sections render nothing. Public reads use no-store so unpublication applies on the next request.

## Data model

`Solution` contains ID, unique slug, status, active/published/featured flags, sort order, optimistic version, timestamps and nullable creator/updater user references. `SolutionTranslation` has unique `(solutionId, locale)` membership, localized name/short description, publication flag, SEO metadata, structured blocks and its own timestamps.

Content is stored once in ordered, named sections wrapping the shared Services block payloads:

| Solution field/section          | Shared payload                                         |
| ------------------------------- | ------------------------------------------------------ |
| heroTitle / heroDescription     | `hero.content.title` / `hero.content.description`      |
| businessChallenge               | `overview` body                                        |
| solutionOverview                | `overview` body                                        |
| architecture / approach         | `overview` body                                        |
| includedServices                | relationship section, resolved from `SolutionService`  |
| capabilities                    | `capabilities` items                                   |
| businessBenefits                | `benefits` items                                       |
| implementationApproach          | `overview` body                                        |
| industries                      | relationship section, resolved from `SolutionIndustry` |
| case studies / related projects | relationship section, resolved from `SolutionProject`  |
| FAQ                             | `faq` question/answer items                            |
| CTA                             | `cta` title/body/label/internal destination            |

Each section has an `area` and a `content` block with a stable UUID. Section semantics belong to Solutions; validation, field controls and rendering reuse Services building blocks. One hero appears first; other sections are reorderable. No duplicated scalar page body is maintained alongside the blocks. Industry/project reference sections reuse the shared related-record payload and resolve through their respective join tables.

`SolutionService`, `SolutionIndustry` and `SolutionProject` each have a composite primary key, reverse lookup index, ordering index and cascading foreign keys. Deleting a Solution removes its translations and relationship rows, never its Services. Industries and Projects now have their own CMS modules and publication controls. Project references also enforce client confidentiality. Linked Industries must be active and globally published, with a published translation.

## Admin and audit

The editor supports draft save, create/edit/delete, global and per-language publish/unpublish, activate/deactivate, feature/unfeature, catalog order, section order, EN/TR/AR translation content and SEO. A searchable, paginated checkbox multiselect attaches existing Services; selected Services can be reordered. Inactive Services may be selected for planning but are excluded publicly until independently eligible. Searchable Industry and Project selectors attach existing records. Arabic content fields and private preview use RTL; JSON input remains LTR for readability.

All writes and audit events share one PostgreSQL transaction. Optimistic versions reject stale saves/deletes with 409. Duplicate slugs return 409; missing relationship IDs return a bounded 400 error and roll back the entire change. Slugs, arrays, blocks, locale uniqueness, text lengths and safe CTA paths are validated. The API JSON size limit and existing rate limits apply.

Audit events cover create, update, delete, publish/unpublish (global and localized), activate/deactivate, feature/unfeature, catalog/section ordering and relationship changes. Audit actor/entity IDs intentionally survive deletion, following existing CMS conventions.

## Seed and verification

`npm run db:seed` creates the ten owner-supplied example names as inactive, unpublished, unfeatured English development drafts. It adds no commercial description, capabilities, service links, projects or industry claims. Existing editorial changes are preserved on reruns. The development-only environment guard is unchanged.

`npm test` includes Solutions validation, publication policy, RBAC, slugs, relationship contracts and optimistic-concurrency tests alongside Services regressions. `node tests/solutions.live.mjs` runs opt-in real PostgreSQL/API/browser CRUD, all five roles, M:N relationships, SEO, private preview, audit, mobile/RTL, accessibility, publication and seed-idempotence verification. Start the built API on port 4000 and the built frontend on port 3200 with `SITE_URL=http://localhost:3200`; override the browser origin using `SOLUTIONS_TEST_WEB_URL`. The script requires the ten untouched draft seeds, refuses production/remote databases, creates clearly labeled temporary development records, and removes its records/accounts afterward while preserving audit evidence. Run live suites sequentially without concurrent CMS editing.

Public SEO includes localized titles/descriptions, canonical links, only eligible translation hreflang links, OpenGraph metadata and escaped `BreadcrumbList` JSON-LD. It adds no Product, rating, customer or certification claims. The site's existing global noindex launch policy is unchanged.

The public listing loading boundary is scoped to its route group so detail 404 responses are not converted into streamed 200 responses.
