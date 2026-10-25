# Populated demonstration catalog

## Presentation revision v2

At the owner's request, project and article titles now omit the demo prefix. Project images retain a small demo caption, and articles end with a small disclosure. Public descriptions use original project concepts and no longer include external-provider names, reference statements or outbound source links. The reference URLs below remain internal research documentation only.

`scripts/lib/demo-presentation.mjs` updates the already-installed examples as well as fresh imports. It preserves custom titles and unrelated paragraphs, records a backup and audit entries, and uses optimistic version checks. Render runs this separately marked revision once through the existing `PREVIEW_DEMO_CONTENT_RELEASE=2026-10-25` setting; changing that variable is not required. The project and article pages were checked with REA at mobile width, all 168 tests passed, and the web TypeScript check passed.

Implemented locally on 2026-10-25 at the owner's request. No production deployment was performed.

## Coverage

| Area | Content |
| --- | --- |
| Services | Existing 44 published services preserved, with EN/TR/AR translations |
| Solutions | Existing six solutions preserved; service, industry and project sections added to every published translation, for 12 sections each |
| Industries | 11 sectors, each with nine sections in EN/TR/AR, relevant services, solutions and illustrative projects |
| Projects | Six complete example case studies in EN/TR/AR, including three attributed N-iX references and three fictional scenarios |
| Insights | 36 localized records: three blog articles, three resources and six case studies per language |
| Company | 15 existing localized company pages enriched by appending sections, retaining existing copy |
| Team | Four clearly labelled sample role profiles per language; published CMS profiles appear on the team page |
| Partners | Three clearly labelled fictional collaboration profiles per language; no real vendor affiliation is claimed |
| Careers | Three sample job descriptions with responsibilities, requirements and preferred qualifications |
| Homepage | All four CMS collections populated: industries, featured projects, partners and insights |

The careers data model currently has one shared job description rather than per-language translations. Example vacancies therefore use English titles and descriptions on all locales; navigation and the non-recruiting notice are localized. Demo jobs do not show application forms or JobPosting structured data, are noindex by default, and the API rejects applications for the reserved `demo-` slug prefix.

Contact, quote, privacy, cookie, Pesto and supported Advocas pages retain their existing content. No real testimonials, employee identities, client relationships, office addresses, certifications or numeric performance claims were invented. Illustrations reuse the project's existing assets, not N-iX images or logos.

## Replace content in the CMS

- `/admin/industries`: sector descriptions and the nine page sections.
- `/admin/projects`: titles, client visibility, summaries, challenge, approach, solution, implementation, images, technologies, results and relationships. Replace the example before removing its disclosure.
- `/admin/solutions`: existing solution copy and the newly visible related services, industries and projects.
- `/admin/blog`, `/admin/resources`, `/admin/insights`: localized articles, resources, case studies, categories and tags.
- `/admin/company`: company introductions, sections and calls to action.
- `/admin/team`: public team profiles; replace sample roles with approved profiles.
- `/admin/partners`: public partner cards; replace fictional organizations with confirmed relationships. The example records' public-display approval applies only to their explicitly fictional descriptions.
- `/admin/careers`: sample vacancies. A real vacancy must use a new slug without `demo-` to enable recruitment.

The source package is `content/demo-content.mjs`; the importer creates normal editable CMS records rather than adding runtime fallback content. Homepage insight links now use the working `/insights/blog/:slug` detail route, including resources and case-study articles, matching the existing insight catalog.

## Import and verification

The existing service, solution, company and homepage content must be installed first. On a fresh development database, run the existing content importers for those catalogs before importing this package.

```sh
npm run build:packages
npm run build -w @tevoniq/api
npm run content:demo:check        # validate all payloads without connecting to the database
npm run content:demo              # inspect the plan; no writes
npm run content:demo -- --apply   # apply to local development only
```

The importer refuses remote databases and production environments. It validates content before writing, uses a serializable transaction, writes audit entries and saves a snapshot under `.data/content-backups/demo-catalog-<run-id>.json` before changes. Existing services and project/article records are preserved; company sections and solution relationship blocks are appended without replacing existing sections. Created IDs and pre-change company/solution records are retained in the backup. Re-running a completed import does nothing and does not reset later CMS edits.

### Deploying this content to the existing Render preview

The default command above remains local-only. A separate `--apply-preview` mode is used by the Render bootstrap only when all of these are present: `RENDER=true`, `NODE_ENV=production`, an HTTPS `SITE_URL`, an injected `DATABASE_URL`, and `PREVIEW_DEMO_CONTENT_RELEASE=2026-10-25`. The Blueprint includes the release variable. For an existing manually configured Render service, add that environment variable before deploying this commit.

The preview bootstrap preserves the initial catalog, then adds this release to either a new or existing preview database. A release marker is written in the same transaction as the content. Later starts skip the release entirely, so editing, unpublishing or removing examples in the CMS does not cause them to reappear. New preview images and article links use the actual deployed `SITE_URL`. No remote database was modified while preparing this deployment.

After an out-of-band database import, restart the local web server and allow the five-minute public-content cache to expire before judging old pages. CMS edits invalidate that cache through the existing proxy.

```sh
node --test tests/demo-content.test.mjs
# With the API on 4200 and web on 3100:
node scripts/check-demo-content.mjs en
node scripts/check-demo-content.mjs ar
node scripts/check-demo-content.mjs tr
```

The live checker validates every new sector/project and each existing solution in the requested language, verifies all catalog counts and relationships, then checks the main and representative detail pages. Run it one language at a time with the API's normal request-rate budget available. It never submits a form. Override `API_URL` and `SITE_URL` for other local preview ports.

## N-iX references

REA inspected these public pages on 2026-10-25. The demo uses short original summaries, links to the source and states that N-iX delivered the reference work. Proposed implementation text is explicitly illustrative, not a reconstruction claim.

- [Cloud-independent Telit IoT platform](https://www.n-ix.com/case-study/cloud-agnostic-replatforming-telit/)
- [Logistics platform modernization](https://www.n-ix.com/case-study/fortune-500-leader-ai-driven-modernization-logistics-platform/)
- [AI-assisted enterprise knowledge search](https://www.n-ix.com/case-study/ai-powered-knowledge-search-enterprise-software-leader/)

These examples are not TEVONIQ engagements. No customer quotes, numerical results or N-iX brand assets were imported.

## Completed verification

- All 150 repository tests passed, including eight new tests for demo coverage, attribution, idempotence, production/remote import refusal, team visibility and refusal of demo applications.
- Web and API TypeScript checks passed.
- Live content validation passed in EN/TR/AR for every sector, example project and existing solution, including all required relationships.
- 83 rendered public routes passed: 28 English, 28 Arabic and 27 Turkish, including all main sections and representative detail pages.
- REA reviewed the populated Arabic homepage at desktop width and the team/project pages at 390px mobile width. Original-source attribution and the clickable N-iX reference were visible.
- Import rerun reported no additions or changes. No lead, newsletter subscription or job application was submitted.
