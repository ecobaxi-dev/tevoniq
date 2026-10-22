# Site settings

Use `/admin/site-settings` for General, Brand, Contact, Social, Localization, SEO, Email, Analytics, Security, Media and Legal settings. Saving publishes validated settings and requires settings update and publish permissions. Conflicting edits return 409 and require reloading before saving again.

Settings use a singleton in the existing AdminRecord table. Existing published organization data and notification recipients are migrated on first save. No new database migration is needed for this singleton. Public settings use an explicit allowlist: email delivery settings, notification recipients, security and media administration values are excluded. SMTP credentials, signing keys and other secrets remain deployment environment variables; the editor accepts no secrets or raw scripts.

Enter verified company details and social URLs. Blank social URLs hide their icons. Brand assets support media selection. Enabled languages control public locale access, language selectors, feeds and search alternates. The default language controls the root redirect; a visitor's consented language preference can override it.

Analytics accepts only validated provider IDs. Empty IDs produce no scripts. Consent defaults to required for analytics and marketing; see cookies.md. Email identity and recipients are consumed server-side. Security idle timeout and media upload/SVG restrictions are enforced by the API, with deployment limits remaining the upper bound.

Verification: production builds, settings/RBAC/SEO unit tests and `node --test tests/settings-cookies.live.mjs`. Browser tests use an isolated API fixture and intercepted analytics requests; they do not send real subscriptions, email or tracking events. Live database deployment was not exercised in this environment.
