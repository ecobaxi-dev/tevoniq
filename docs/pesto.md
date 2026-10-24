# Pesto product hub

The code-owned Pesto page is available at `/en/pesto`, `/ar/pesto` and `/tr/pesto`.
`/pesto` redirects to the site's configured default language. A Pesto entry immediately
after the homepage hero links to the visitor's localized page. Existing CMS homepage
content, header and footer remain managed by the existing site.

Copy and support destinations live in `apps/web/src/content/pesto.ts`. The layout is
server-rendered, supports RTL and small screens, and uses scoped CSS and existing
TEVONIQ components/fonts. The terminal drawing is explicitly an illustration.

## Release availability

The Windows and Android download controls are deliberately disabled: customer
installers are not approved for public release yet. Online email verification,
trial registration and license issuance are not implemented by this page. The
activation section explains the planned flow and provides working WhatsApp/email
support links; it does not collect purchase keys or claim successful activation.
Saudi e-invoicing is described as under testing, not live enabled or certified.

Do not publish restaurant development builds, database backups, credentials or
signing keys here. Enabling downloads requires approved customer artifacts and
version/hash metadata. Enabling activation requires the actual server-side email
and licensing workflow, rate limits and verified registration; a client form alone
must never issue a license.

## SEO and validation

The page supplies localized metadata and hreflang links for enabled languages.
Sitemap entries are deduplicated and defer to any explicit CMS route policy.
The test API fixture supplies an empty SEO catalogue so code-owned sitemap entries
can be exercised independently of production content.

Relevant checks from the repository root:

```sh
npm run build:packages
npm run build -w @tevoniq/web
npx playwright test tests/e2e/pesto.spec.ts tests/e2e/home.spec.ts
```

Use isolated API/site configuration for browser checks, as defined in the existing
Playwright fixture. No database migration or new production secret is required by
this information page. Existing Render build/start commands remain unchanged.

For deployment, merge the reviewed branch into the Render-connected branch and
deploy that commit. The committed Render blueprint currently sets automatic deploys
off; check the actual Render service setting and run a manual deploy if necessary.
Afterward verify `/pesto`, all enabled localized pages, homepage entry, download
availability labels, support links and `/sitemap.xml` on the real domain.
