# Global search

`/search?q=cloud` redirects to `/en/search?q=cloud`; localized pages use
`/{locale}/search?q=`. The header opens a Radix modal with Ctrl/Cmd+K.
Tab, Shift+Tab, arrows, Enter and Escape work with normal links and a focus trap.

## Backend contract

GET /api/v1/search?q=cloud&locale=en&limit=8
returns SearchResponse from @tevoniq/types: query and groups, each with type,
items (id, type, title, excerpt, url), and hasMore. Limit is per group (1–50).
The same-origin /api/search route proxies requests without caching private state.
Empty queries return no results; invalid inputs return 400; failures are displayed separately.

SearchProvider is the dependency injection boundary. Replace its AppModule binding
with a Meilisearch or Elasticsearch adapter returning the same contract to keep both
UI surfaces unchanged. External adapters must preserve locale/publication filtering,
projectContent's privacy checks, and immediate removal of unpublished content.

## PostgreSQL

Deploy migration 20260915000200_global_search with npm run db:deploy.
The live UNION ALL view searches published titles and summaries/descriptions,
with GIN expression indexes on catalog translations and articles. No reindex job
or stale publication cache is needed. Titles carry greater relevance weight.
The simple text configuration provides whole-token matching for all three locales;
there is no typo correction, stemming, or prefix autocomplete in this initial version.
Rich body blocks are intentionally outside the initial search projection.
CMS pages use only the published snapshot; projects are revalidated through their
existing public projection before returning results. Resources link to the site's
existing shared article detail route.

Standard site landing pages are included as a small localized route catalog in the
view. Keep those entries aligned when adding or renaming application routes.
Results currently show up to 50 matches per content type.

Reference: [PostgreSQL full-text indexes](https://www.postgresql.org/docs/current/textsearch-tables.html).

Verification: npm run test (includes migration execution with isolated PGlite PostgreSQL).
Browser checks: npm run test:e2e -- --grep "search modal|search deep link" after a web build.
