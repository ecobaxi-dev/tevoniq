# SEO operations

Public pages resolve metadata on the server. In **Admin → SEO**, create a record with its locale and language-free path (for example `/`, `/services`, or `/insights/blog/my-article`) and publish it. Overrides support title, description, canonical, robots, OpenGraph title/description/image and Twitter title/description/image/card. Empty values inherit the page content, then site defaults. Only published, non-archived records apply.

In **Admin → Site Settings**, use the dedicated grouped settings editor. Enter only verified company name, legal name, logo URL, public email/phone, address and official social profile URLs. Unknown values stay blank. No legal name, contact details, address, founding date, ratings or other company facts are generated. Without a company name, Organization and JobPosting markup are omitted.

Set `SITE_URL` to the real public HTTPS origin. Apply database migrations with `npm run db:deploy` before deployment; `public_seo_routes` is required. Sitemap and RSS deliberately fail rather than return a misleading empty success response when the registry is unavailable.

- `/sitemap.xml`: published pages, catalogs, articles, services, solutions, industries, projects, company pages and current jobs; excludes noindex and external-canonical records. Includes available EN/TR/AR alternates and the configured default language as x-default.
- `/robots.txt`: public crawling allowed; administrative/API/authentication routes excluded.
- `/rss.xml?locale=en` (also `tr`/`ar`): latest 100 eligible articles. `/insights/rss.xml` remains available.
- Filter/search URLs use noindex with clean canonicals; ordinary tracking parameters do not disable indexing.
- Alternate links refer only to published, indexable translations of the same path. CMS records with unrelated slugs are not guessed to be translations.

Structured data includes verified Organization, WebSite, BreadcrumbList, Article, Service, visible FAQ content and active JobPosting. Job locations currently contain the CMS location text, not a fabricated structured address. Google Jobs rich-result eligibility additionally requires job-specific address/country or remote applicant-region data; the current jobs editor does not collect these fields. See [Google's JobPosting requirements](https://developers.google.com/search/docs/appearance/structured-data/job-posting) and [localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions).

Validate with `node --test tests/seo.test.mjs`, web typecheck, and production build. After publishing real settings/content, inspect the raw HTML and validate representative URLs with Google's Rich Results Test and Search Console. Search engines ultimately decide indexing and rich-result display.
