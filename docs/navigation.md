# Website navigation

`apps/web/src/components/site-header.tsx` renders the responsive header. Styling lives beside it in `site-header.css`. The locale layout loads navigation through the server-only `getNavigation(locale)` adapter in `src/lib/navigation.ts`.

`src/config/navigation.ts` defines the typed contract and temporary EN/TR/AR bootstrap labels requested for navigation. Replace the adapter with validated, published CMS records when the CMS is implemented; components already receive navigation as data. Validate CMS URLs and locale coverage at that boundary. No business service catalog, customer claims, or statistics are seeded.

Solutions and Services have mega-menu layouts with overview links; add real published items through the data contract. Company and Insights contain the requested submenus. Known routes currently render heading-only shells pending CMS pages. Search filters the navigation destinations locally; full content search requires a backend index. Request a Quote points to the contact route with `intent=quote`, ready for the future contact form.

The home header overlays the navy shell and becomes solid after 24px of scrolling. Other routes use the solid state. Header dimensions remain fixed across scroll states. Desktop menus use Radix NavigationMenu, search uses Modal, and mobile navigation uses Drawer and Accordion. Language changes preserve the route, query, and fragment. Arabic sets document and overlay direction to RTL. Official logos retain their original files and proportions, with a light surface when no approved light logo exists.

## CMS integration (October 2026)

The adapter now fetches `GET /api/v1/navigation/:locale`. Only published, non-archived records in the requested language are exposed. In **Admin → Navigation**, set the title as the link label and use a local destination without the language prefix. A record matching an existing destination overrides its label. A new destination is appended to the `main`, `company`, `insights`, `services` or `solutions` group. Sort order controls the order of appended records. Drafting or archiving an override removes that override; the built-in link remains available. Existing catalog groups are preserved.

In **Admin → Translations**, published keys such as `navigation.labels.search` override matching navigation interface labels. Unknown keys are ignored. Unsafe or language-prefixed destinations are omitted from the public projection. The baseline navigation remains available when overrides cannot be loaded. CMS writes invalidate the shared public content cache.
