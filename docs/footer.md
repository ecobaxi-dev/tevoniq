# Shared site footer

`SiteFooter` renders once from the locale layout on public EN/TR/AR pages. The old homepage-only footer has been removed. Navigation groups use the same `NavigationContent` as the header; Solutions and Services show their configured children (currently the catalog overview links), while Company and Resources reuse their menus.

Use **Admin → Site Settings** to control these values (legacy organization records are migrated on first save):

- Company/legal name, logo, public email, phone and address.
- `footerDescriptionEn`, `footerDescriptionTr`, `footerDescriptionAr` (localized short company description).
- Social: dedicated fields for verified platform URLs. Empty profiles render no icons. URLs are deduplicated; recognized hosts receive matching icons, other configured profiles use a globe icon.
- `privacyPolicyUrl`, `termsUrl`, `cookiePolicyUrl`: existing public page paths or absolute HTTP(S) URLs. Language-free paths such as `/privacy` receive the active locale prefix. Already-localized and external URLs are preserved. Legal navigation entries (`privacy`, `terms`, `cookies` under `legal`) are a fallback. Privacy and cookies default to the built-in localized policy pages. Unconfigured terms remain plain text.

The footer newsletter submits to `/api/newsletter/subscribe`, using the existing protected API, consent validation, honeypot, rate limits and subscription confirmation flow. `/newsletter/config` exposes only the public Turnstile site key; API secrets remain server-side. If configuration cannot be loaded, the field stays visible with an unavailable message. No real subscriber was created during verification.

Checks: production web and API builds, targeted lint, and `node --test tests/footer.live.mjs`. The browser test uses an isolated API fixture, checks desktop accessibility, consent/error/success, URL-preserving language switching, mobile EN/TR/AR overflow, shared placement, and hiding unconfigured links. Screenshots under `artifacts/footer/` contain fixture contact details, not real company data.
