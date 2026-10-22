# Administrator authentication and permissions

Sign in at `/admin`. Manage accounts at `/admin/users`, inspect grants at `/admin/roles`, and review or revoke sessions at `/admin/security`. There is no public registration or default password.

## Roles

The shared registry in `packages/validation/src/rbac.ts` defines eight roles and concrete permissions. Resource names expand into `read`, `create`, `update`, `publish`, and `delete` actions; wildcard strings are documentation shorthand, not accepted grants.

| Role            | Grants beyond account access and editorial reading                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| SUPER_ADMIN     | All registered permissions, including user administration and session revocation                                         |
| ADMIN           | All permissions except user changes and revoking other users' sessions; may read users                                   |
| CONTENT_MANAGER | Editorial content, catalog, media, career openings and SEO management; no applications or other private business records |
| EDITOR          | Create/update page and blog drafts, upload/update media; cannot publish or delete                                        |
| MARKETING       | Blog, media, SEO and newsletter management; create/update page drafts                                                    |
| SALES           | Read/update leads                                                                                                        |
| HR              | Career openings and job applications                                                                                     |
| VIEWER          | Read/preview editorial content                                                                                           |

Permissions cover `pages`, `services`, `solutions`, `industries`, `projects`, `blog`, `media`, `leads`, `careers`, `careers.applications`, `users`, `settings`, `seo`, and `newsletter`, plus `account.manage`, `workspace.read`, `users.revoke`, and `audit.read`.

## Backend enforcement

`CmsGuard` is an application-wide `APP_GUARD`. Every registered controller action must be explicitly public or have an entry in `apps/api/src/cms/permissions.ts`. An absent or unknown policy fails closed, including for super administrators. Authentication comes from a validated session, never from a submitted role, permission list, or request body.

Protected requests resolve the current database account, enforce its permissions, and reject disabled accounts and revoked sessions. Generic record routes map each module to its resource permission. Publication and archive operations require their separate permissions. The Company editor and taxonomy updates change public content directly, so those updates also require publication permission. Editors can save page drafts while the published snapshot stays unchanged. Blog editors cannot overwrite or unpublish an already published/scheduled article. Existing-record publication restrictions are checked in database mutations, not just against the submitted status.

Frontend controls use the same grants for usability. Changing browser state or calling an API directly does not bypass backend checks. Account updates use optimistic versions and transactions, preserve attribution, prevent self-disable/self-demotion and removal of the last active super administrator, and revoke existing sessions and reset links.

## Login and sessions

- Password creation/reset requires 15–128 characters. Login accepts existing passwords without changing them. Emails are trimmed and normalized to lowercase.
- Passwords use a unique 128-bit salt and scrypt (`N=131072`, `r=8`, `p=1`), with constant-time verification. Concurrent password derivations are bounded to protect server memory.
- Login generates a new cryptographically random 256-bit opaque session token. PostgreSQL stores only its SHA-256 digest. Responses and user listings do not expose password hashes.
- The browser proxy stores the token in an `HttpOnly`, `SameSite=Strict` cookie, restricted to `/api/cms`, with `Secure` enabled for HTTPS. Mutations require the configured exact `SITE_URL` origin. The API accepts bearer tokens, not ambient browser cookies.
- Sessions expire after 30 idle minutes or eight hours from login. Valid requests advance the idle timestamp but never the absolute expiry. No refresh token is needed: users sign in again after expiry. A 401 clears the browser session and returns the UI to sign-in.
- Last login is recorded on the account. Users can revoke their own individual sessions or all their sessions. Super administrators can revoke another account's sessions. Password reset, password/role/status changes and logout-all invalidate existing session versions.
- Login/recovery throttles persist in PostgreSQL and use hashed IP/account keys. In each 15-minute window the limit is 60 authentication attempts per IP/scope, 10 per login account, or three recovery requests per account. This includes successful attempts. General API rate limiting and bounded request bodies apply as well. The web proxy shares its upstream IP; account limits remain independent. Do not trust arbitrary forwarded-IP headers.

## Password recovery

`/auth/forgot-password` returns the same response for active, disabled and missing accounts. A background queue handles lookup and email delivery independently of that response. Reset links expire after 30 minutes, are stored only as token hashes, and use a URL fragment so the raw token is not sent in the page URL or referrer. The form removes the fragment after reading it.

The reset endpoint verifies account status/version and atomically consumes the link, replaces the password hash and revokes sessions. Concurrent uses of one token permit only one successful reset. Delivery failures are retried up to three times within the queue's 30-minute lifetime.

Configure `EMAIL_TRANSPORT=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `EMAIL_FROM`, and, if needed, `SMTP_USER`/`SMTP_PASSWORD`. `CORS_ORIGIN` is the trusted base URL used in recovery links and must match the web application's public origin. With email disabled, no reset email is sent. The SMTP adapter requires TLS. See [email configuration](leads.md).

## Setup and verification

Run `npm run db:generate` and `npm run db:deploy` before starting a newly updated API; migration `20260910000300_auth_rbac` adds session/version/recovery fields. Provision the initial super administrator using `npm run cms:admin` with `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` supplied through the process environment. That operator command resets the named account and revokes its sessions if it already exists. Do not commit credentials. Use HTTPS for the production web/API and configure the public origins consistently.

Run `npm test` for role grants, every registered endpoint's policy, authentication failures, session handling, recovery delivery and reset validation. After building the API and applying migrations, run `node tests/auth-rbac.live.mjs` for PostgreSQL-backed HTTP checks: all eight roles, draft/publish isolation, session ownership/revocation/expiry, disabled accounts, self-demotion, concurrent single-use reset, generic recovery responses, and throttling. The live script requires a development localhost database, disables email delivery, creates isolated accounts and pages, and removes its fixtures afterward. It does not change real administrator credentials.

The design follows OWASP's [authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) and [session management guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): default denial, checks on every request, server-side expiry, and revocation.
