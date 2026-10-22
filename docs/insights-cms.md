# Insights

Public entry points are `/insights`, `/insights/blog`, `/insights/blog/[slug]`, `/insights/resources`, and `/insights/case-studies`. As elsewhere in the site, these redirect to English routes under `/en`. Turkish and Arabic routes use `/tr` and `/ar`. Resources and case studies are separate article collections whose detail links use the shared `/[language]/insights/blog/[slug]` article route.

## Editing

Use `/admin/insights` with an existing CMS account. Administrators and content managers can create and update articles, categories, and tags. Other CMS roles have read and preview access. Create categories and tags for each language in the expandable taxonomy panel. Their type and language cannot be changed after creation; names and slugs can be edited. Article language is chosen when creating the article. Slugs are unique per language.

The editor includes all requested blog fields plus collection and cover-image alt text. Content consists of ordered paragraph, heading, list, quote, code, image, and link blocks. Blocks can be added, moved, and removed without editing JSON. Text is rendered without HTML execution. Images use HTTP(S) URLs; image uploads are not part of this CMS. Reading time can be entered or calculated at 200 words per minute. The existing API body limit is 100 KB.

Publishing requires an author, excerpt, category, SEO title, SEO description, publication date, and nonempty content. Cover images require alt text. Categories and tags must match the article language. Draft and archived content may be incomplete.

## Publication

- `draft`: private.
- `scheduled`: private until publicationDate, then public automatically.
- `published`: public at or after publicationDate. Future dates must use scheduled status.
- `archived`: private, retained for later editing.

All dates in the editor are UTC. Scheduling is evaluated on every public request without a cron dependency. A due scheduled record retains its stored status and is marked `(live)` in the CMS. Changing a live article to draft or archived removes it from public lists, detail routes, related posts, RSS, and sitemap. Saves replace the current record immediately; there is no separate revision staging area. Version checks prevent silent overwrites and successful saves create audit entries.

Related articles share the category or a tag, match the language, and are already public. Up to three are shown, prioritizing featured and recent articles. Search, category, tag, featured, collection, and pagination filters apply on the server.

## Discovery

`/insights/rss.xml` serves the most recent 100 public articles across collections. Add `?locale=tr` or `?locale=ar` for localized feeds. Every Insights page advertises its language's RSS feed.

`/sitemap.xml` includes Insights collection routes and public articles across all languages, reading all API pages. Articles with a canonical URL different from their own URL are omitted. `/robots.txt` advertises the sitemap and excludes admin/API routes. The initial sitemap covers the Insights section; other site collections can be added to the sitemap provider later.

Article pages emit canonical links, Open Graph article fields, Twitter cards, and JSON-LD Article data. Article author is modeled as a named person. Set verified authorship and image URLs in the CMS. No demonstration articles or invented case studies are seeded.

## Deployment and checks

Run `npm run db:generate`, `npm run db:deploy`, and the normal build. The Insights migration adds its tables without changing existing content. Run `npm test` for unit and controller tests. `node tests/insights.live.mjs` runs local database and browser integration checks using temporary fixtures, then removes them; it requires a local development database and a completed web/API build.
