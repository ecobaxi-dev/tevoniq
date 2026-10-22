# Modular page builder

Open **Admin → Pages** (`/admin/pages`). Create a page, set its path and language metadata, add sections, and use **Save draft** or **Publish page**. Pages are served at `/{language}/{path}`, such as `/en/our-approach`. Existing application routes (including Company, catalogs, Insights, Contact, and Admin) are reserved and retain their dedicated editors. Legacy administrative page records remain available at `/admin/page-records`; they are not automatically published or converted.

## Sections

The registry supports all 20 section types: Hero, RichText, ImageText, FeatureGrid, ServiceGrid, SolutionGrid, IndustryGrid, Stats, LogoGrid, ProjectGrid, TeamGrid, Testimonials, FAQ, CTA, ImageGallery, Video, Timeline, ContactBlock, Newsletter, and CustomHeading.

Each section has a stable UUID, visibility flag, numeric order, background preset (`PLAIN`, `SOFT`, `GRID`), spacing preset (`COMPACT`, `NORMAL`, `SPACIOUS`), and theme (`LIGHT`, `DARK`, `BLUE`, `GRADIENT`). Editors can move sections up/down, duplicate them, and remove them with confirmation. Repeating items and rich-text blocks also have ordering controls.

Content is independent for English, Turkish, and Arabic. Page metadata enables each public language. A section without content for the selected language is omitted, with no fallback to another language. Heading, introduction, optional image/alt text/caption, and section-specific fields are localized. Arabic renderers use RTL. A page supports up to 80 sections and a 90 KiB serialized document within the existing bounded API request size.

RichText uses typed paragraph, heading, list, quotation, and link nodes. No raw HTML block, `contenteditable` surface, arbitrary CSS, script field, or HTML drag-and-drop editor exists. Schemas reject unknown properties, invalid types, unsafe URLs, invalid video IDs, duplicate section IDs/orders, and excessive content. Text is rendered through React escaping. Media URLs are public local paths or HTTPS URLs; alt text is required. Video embeds use provider IDs and fixed YouTube privacy-enhanced/Vimeo embed origins. CMS input cannot supply iframe markup or another embed origin.

ServiceGrid, SolutionGrid, IndustryGrid, and ProjectGrid select existing published records by ID. Their public copy remains in the catalog. Catalog publication, language, and project confidentiality checks apply at publish time and again during rendering. Other repeaters contain page-specific structured entries, such as feature descriptions, team profiles, or FAQ answers. No historical dates, coverage claims, statistics, or testimonials are seeded as company facts.

## Drafts, publishing, and preview

PostgreSQL stores separate draft and published JSON snapshots, publication timestamp, optimistic version, archive timestamp, and creator/updater attribution. Saving a draft does not alter the live snapshot. Publishing validates visible content and referenced catalog entries in every enabled language. Changes to a published page's path require unpublishing first. Duplicate paths and stale edits return conflicts.

Live preview uses the same `PageRenderer` and CSS as the public page. Text and presentation edits appear locally; a debounced authenticated request resolves catalog cards. Desktop/mobile width controls are available. Forms are disabled and links do not navigate in preview; video previews show a placeholder to avoid starting third-party media in the editor. Invalid unfinished fields display a validation prompt until they are completed. Browser navigation warns about unsaved changes.

Unpublish, archive, restore, section removal, and explicit draft discard require confirmation. Archiving preserves the draft and removes public access. Restoring returns a draft and never republishes automatically. Published pages contribute localized SEO/social metadata and sitemap entries. Missing, archived, or unpublished custom pages return 404.

Catalog foreign keys prevent hard deletion of referenced records. Archive guards include references in both draft and published page snapshots. Hidden/language-specific section references are retained too. Media URL usage checks include page snapshots. Removing a draft reference alone does not release a reference still used by the published snapshot; publish the removal or unpublish the page. Archived pages retain their draft references so their content can be restored safely.

## Newsletter section

The public section submits explicit consent and email to a bounded same-origin proxy. The API verifies that the form still exists on a published page in the selected language, uses the existing persistent submission/IP throttles and Turnstile configuration, and stores the subscriber in Admin → Newsletter. Consent evidence includes the published label, source page, section ID, and creation date. Email uniqueness prevents duplicate subscriptions, and existing unsubscribed or archived subscriber records are not silently reactivated. This section collects subscriptions; it does not implement newsletter campaigns or send marketing emails.

Newsletter bot protection uses the lead workflow's environment configuration and the `newsletter` Turnstile action. See [lead deployment configuration](leads.md) for trusted proxy IP settings and keys.

## Permissions and implementation

Existing authenticated CMS roles can read and preview pages. `SUPER_ADMIN`, `ADMIN`, and `CONTENT_MANAGER` can save, publish, and change page state. Public APIs return only the selected language's visible published sections and safe catalog cards. CMS mutations retain origin checks through the web proxy, version checks, and audit events. Page search and dashboard draft counts are integrated with the admin workspace.

Schemas and registry: `packages/validation/src/page-builder.ts`. API: `apps/api/src/page-builder`. Shared renderers/editor: `apps/web/src/components/page-builder`. The migration is `20260910000100_page_builder`.

To introduce a section, add its schema and default values to the registry, implement its controlled editor fields and renderer branch, and extend the fixture tests. Bump `schemaVersion` and provide a document migration for incompatible future changes.

## Verification

Run `npm test`, `npm run lint`, and `npm run build`. After a build and `npm run db:deploy`, `node tests/page-builder.live.mjs` verifies PostgreSQL persistence, public/CMS boundaries, catalog references, all renderers, live editing, publishing, newsletter consent, accessibility, and mobile RTL. The integration script requires a development localhost database, creates temporary fixtures, and disables real email delivery. Screenshots are written under `artifacts/page-builder`.
