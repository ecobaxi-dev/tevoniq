# Industries CMS

Industries describe sector-specific needs and connect the relevant Services, Solutions and Projects. Public content comes from database records, not a hard-coded industry catalog.

## Routes and editing

- `/industries` and `/industries/[slug]` redirect to English; `/en`, `/tr` and `/ar` have localized listing and detail pages.
- `/admin/industries` provides create/edit/delete, draft/publish, active/inactive, featured, ordering, translations, section editing, saved-content preview and audit history.
- Each translation supports Hero, Industry challenges, TEVONIQ capabilities, Relevant solutions, Relevant services, Use cases, Projects, CTA, FAQ, SEO title and SEO description. Optional sections can be omitted or reordered; the hero comes first.
- Searchable, paginated selectors attach existing Services, Solutions and Projects. Selected records can be reordered. Solutions CMS also provides an Industry selector.
- Public listing supports search, pagination, featured filtering and a Service slug filter.

SUPER_ADMIN, ADMIN and CONTENT_MANAGER can write. EDITOR and VIEWER can read and preview. CMS APIs use the existing authenticated session, same-origin proxy and guards. Preview is authenticated and `private, no-store`; it does not publish a record.

## Publication

An Industry is public only when active, globally published, `status=PUBLISHED`, and translated with publication enabled for the requested language. Publishing a translation requires a hero, short description and SEO metadata. Missing translations return 404 without English fallback. SEO includes localized metadata, canonical and eligible hreflang links, OpenGraph and escaped breadcrumb JSON-LD. The existing site-wide launch indexing policy is unchanged.

Related Services must be active with a published translation. Related Solutions must pass their own activation and publication checks. Projects must be published, verified and translated. Empty relationship sections are hidden. Related Industry records on Solution pages also enforce the new Industry publication controls.

## Database relationships

| Relationship        | Join model                  |
| ------------------- | --------------------------- |
| Industry ↔ Service  | `IndustryService`           |
| Industry ↔ Solution | existing `SolutionIndustry` |
| Industry ↔ Project  | `IndustryProject`           |

All are many-to-many with composite primary keys, foreign keys, reverse lookup indexes and ordering. Existing Solution–Service and Solution–Project links remain intact. `SolutionIndustry.sortOrder` orders industries within a Solution; `industrySortOrder` orders solutions within an Industry. Saving either side preserves the other side's ordering. Membership changes increment the related editor's version so stale saves cannot silently restore removed links.

`Industry` has independent activation/publication controls, version, order, feature flag, timestamps and creator/updater references. `IndustryTranslation` stores localized sections and SEO. Migration `20260908000300_industries` preserves existing Industry IDs, descriptions and Solution memberships. Deleting an Industry cascades only its translations and join rows, preserving Services, Solutions and Projects.

All content writes and audit events share a transaction. Duplicate slugs and stale versions return 409. Invalid relation IDs return 400 and roll back the write. Project selection uses the Projects CMS. Its public projection also enforces client confidentiality for linked case studies.

## Draft records and verification

Run `npm run db:deploy` and `npm run db:seed` against the local development database. The development-only seed creates Government, Enterprise, Retail, Hospitality, Education, Healthcare, Financial Services, Logistics, Manufacturing, Real Estate and SMEs as inactive, unpublished, unfeatured English drafts. It creates no capabilities, links or project claims and preserves existing editorial records on reruns.

- `npm test`: validation, publication, relationships, roles and stale-version regression tests.
- `npm run typecheck` and `npm run build -w @tevoniq/web`: compile and route checks.
- `node tests/industries.live.mjs`: opt-in local PostgreSQL/API/browser verification, using API port 4100 and frontend port 3300 by default. Start the API with `PORT=4100`, and the frontend with `API_URL=http://localhost:4100/api/v1` and `SITE_URL=http://localhost:3300`. The script refuses remote/production targets, expects the eleven seeds to remain drafts, creates temporary development records and sessions, and removes them afterward. Audit evidence is retained. Run live suites sequentially.

Live results and screenshots are written to `artifacts/industries-verification.json` and `artifacts/industries-*.png`.
