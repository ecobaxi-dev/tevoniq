# TEVONIQ admin workspace

Open `/admin`. The shared authenticated shell supplies the TEVONIQ sidebar, global search, session identity, and sign out across all editors. Dashboard counts come from the database; restricted business metrics are hidden from non-administrators.

The sidebar contains all requested sections. Existing Services, Solutions, Industries, Projects, Company, and Insights editors remain available. Blog and Resources open collection-filtered Insights workspaces. Pages opens the [modular page builder](page-builder.md) and links to the dedicated Company editor and legacy page records. The global workspace search provides content-wide status filters, sorting, pagination, and creator/updater metadata, including existing catalog content.

New records for Pages, Team, Partners, Testimonials, Careers, Job Applications, Newsletter, Media Library, Navigation, Translations, SEO, and Site Settings are stored in `AdminRecord` with validated fields specific to each section. These are administrative records; they do not automatically bind configuration records to existing public renderers. Existing public Company and Insights content uses its dedicated editors. The media library organizes asset URLs, alt text, credits, and references; it does not upload files.

Leads and Website Messages use the dedicated PostgreSQL `Lead` workflow connected to the public contact and quote forms. They support the seven lead statuses, private attachments, internal notes, activity history, email delivery tracking, and confirmed atomic bulk status/archive/restore operations. Settings for notification recipients, public budget choices, and attachment availability are linked from Site Settings and Leads. See [lead workflow configuration](leads.md).

## Record management

New record screens support search, workflow status, language filters, active/archived filters, four sort choices, sort direction, and 20/50/100-row pagination. Select records on the current page to change status, archive, or restore. Selection resets when results change. Bulk actions list their scope, require typing `CONFIRM`, validate all selected versions, and run atomically. Failed reference checks or conflicts leave the entire selection unchanged.

Record previews are administrative previews of saved/draft field content. Content workflows use draft/published; business records have lead, application, and subscription states. Authors and timestamps are recorded on creation/update. Historical records without creator attribution show “Not recorded”; no author is invented. New Company/Insights saves now record creator/updater IDs as well.

## Archiving and references

Important records are soft deleted with `deletedAt` and retained for restoration. There is no permanent-delete UI for business records. Add explicit references when a record uses another admin record (for example, an application references a career opening). Referenced records cannot be archived, including references retained by archived sources. Media archive checks also inspect URL usages in existing article, company, catalog, and project content.

Existing catalog DELETE endpoints now archive records, preserve their translations and relationships, disable public visibility, and write archive audit entries. Existing confirmation prompts describe archiving. References from other catalog content block archiving. `/admin/trash` lists archived catalog entries and restores them without republishing. Each new record section also has its own archived-record filter.

## Access and users

The eight built-in roles are SUPER_ADMIN, ADMIN, CONTENT_MANAGER, EDITOR, MARKETING, SALES, HR, and VIEWER. Editors can create/update page and blog drafts; publication and deletion have separate permissions. Sales can manage leads, HR can manage openings/applications, and Marketing can manage blog/media/SEO/newsletters. Every protected backend endpoint enforces a permission policy. See the full [authentication and RBAC guide](authentication-rbac.md).

Only SUPER_ADMIN can create users, change roles/passwords, or disable accounts. Updates revoke sessions, require confirmation, and preserve the user record. Self-disable and self-demotion are blocked; at least one active super administrator must remain. Passwords require 15–128 characters and are hashed with scrypt. Password hashes and session secrets are never returned in user listings. Account Security lists active sessions and supports individual or account-wide revocation; password recovery is available from sign-in.

Roles displays the fixed permissions enforced by the current API; custom permission design is not exposed. Audit logs are read-only and searchable by action, entity ID, or actor ID. Account and content updates produce audit events.

Apply migrations with `npm run db:deploy` and regenerate Prisma with `npm run db:generate`. No sample business data is seeded.
