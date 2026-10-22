# Company content

Apply the database migration with `npm run db:deploy` before starting the updated API. Prisma client generation runs during installation; use `npm run db:generate` for an existing checkout.

Open `/admin/company` and sign in with an existing CMS account. Administrators and content managers can edit; other CMS roles can read and preview. Choose a page and language, then load it. Edit the introduction, SEO description, sections, and CTA. Save with Published checked to make the content public. Saving with Published unchecked takes the page offline. Saving replaces the current published content; there is no separate staged revision.

The five English routes initially use the supplied neutral copy if no CMS record exists. Other languages require explicitly saved and published translations. New translation forms start with English copy as an editing template. Translate it before publishing. Existing unpublished records never fall back to default copy.

Founding year and geographic coverage are optional CMS fields with no default values. Only enter verified information. Team, partner, and career details can be added as sections; no people, affiliations, or vacancies are fabricated. Section text is rendered as plain text with line breaks. CTA links accept internal paths.

Saves use optimistic version checks and write an audit entry. A conflict requires reloading the page before saving again.
