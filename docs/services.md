# Services CMS

## Routes

- `/services` and `/services/[slug]` redirect to the English routes.
- `/{locale}/services` is a paginated, searchable catalog.
- `/{locale}/services/[slug]` renders published modular blocks and SEO metadata.
- `/admin/services` provides administrator sign-in, search, creation, translation editing, activation and block ordering. Collection items and relation IDs have validated JSON editors; narrative fields use ordinary controls.

Services are database records, not an enum or a fixed route list. The 35 owner-requested categories are idempotently seeded as **inactive** English drafts with no commercial descriptions or fabricated claims. Re-running seed never resets editorial changes. Missing translations return 404; there is no silent English business-copy fallback.

## Start locally

```sh
npm ci
npm run env:setup
npm run infra:up
npm run db:migrate
npm run db:seed
```

Provision an administrator with `npm run cms:admin`. Supply `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` in the process environment first (15–128 characters for the password). Do not put the password in command arguments, shell history, or committed files. The command uses `apps/api/.env` for the database connection, creates or updates that administrator, and revokes existing sessions. There is no default account or public registration endpoint.

Run `npm run dev` and open `http://localhost:3000/admin/services`. `SITE_URL` must match the exact browser origin for CMS writes. Public production deployments must use HTTPS. API_URL is server-only; the browser calls the same-origin CMS proxy.

## Publication and blocks

A service needs `active=true` and a `published=true` translation to appear. Activation and publication are independent: an active draft and an inactive published translation both remain private. Publishing requires a catalog summary, SEO title/description, and one hero as the first block. SUPER_ADMIN, ADMIN and CONTENT_MANAGER can create, edit, publish, activate, reorder and delete services. EDITOR retains its existing read-only policy; VIEWER is also read-only. The backend enforces these permissions on every mutation. Text renders escaped, without HTML execution. CTA destinations are restricted to internal paths.

Supported ordered block types: hero, overview, benefits, capabilities, features, use-cases, industries, technology-stack, faq, related-projects, related-services, and cta. Each block has a UUID and a validated payload. No single fixed page body is assumed. API request bodies and individual fields/arrays are bounded; the number of service records is not fixed.

Related services resolve from active, published localized database records. Related projects resolve only from verified, published projects and published translations. Project models are an integration boundary for the future Projects CMS, not a fabricated project catalog; related projects currently render descriptive cards without linking to unimplemented project detail pages. Unknown, inactive, or unpublished references render nothing.

Schema and additive migration live in `apps/api/prisma`. Contracts and block validation live in `packages/validation/src/services.ts`. Nest controllers live in `apps/api/src/services` and `apps/api/src/cms`. Frontend API access is centralized in `apps/web/src/lib/services.ts`; pages never embed the initial category list.

## Security and operations

Sessions use random tokens, stored hashed in PostgreSQL, with an eight-hour expiry. The browser receives an HttpOnly, SameSite=Strict cookie scoped to `/api/cms`, with Secure on HTTPS. The proxy checks the exact Origin on mutations. The Nest API independently authenticates bearer sessions and enforces administrator permissions. Login throttling uses atomic database counters; the API also has its existing per-process request limiter. Password changes revoke sessions; disabled users cannot authenticate.

Scrypt uses N=131072, r=8, p=1 and a unique random salt, following [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Session and throttling controls follow [OWASP authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

Service saves and deletes use optimistic version checks and transactional audit records. Conflicts require reload; saves never silently overwrite a newer version. Audits distinguish create, update, activate, deactivate, per-language publish/unpublish, block reorder, catalog reorder and delete. Audit actor/entity IDs intentionally survive record deletion and operator provisioning; they are historical identifiers rather than cascading foreign keys. Service creator/updater references use nullable user foreign keys, while existing seed records have no human author. `createdAt`/`updatedAt` track service timestamps; `sortOrder` and slug give deterministic pagination. Draft/published status is represented per translation by `published`, independently of service activation; no conflicting duplicate status field is stored. Translation uniqueness and cascading deletion are enforced in PostgreSQL. This focused CMS does not add public signup, user-management screens, MFA, a project editor, or revision-history rollback. Operator provisioning and Prisma Studio manage accounts until a broader identity module is added.

API and public reads use no-store, so deactivation takes effect on subsequent requests. Outages show a localized unavailable state rather than exposing drafts or inventing fallback services. Site indexing remains disabled by the existing launch policy.

## Verification

Unit tests cover validation, passwords, guards, publication query boundaries, and stale updates. `tests/e2e/services.spec.ts` covers the public renderer and Next CMS cookie proxy against an isolated fixture API. Fixture records are labeled development data and are never imported by production code.

`node tests/services.live.mjs` performs opt-in verification against local development PostgreSQL and the real API on port 4000, with the production frontend on port 3200 (`SITE_URL=http://localhost:3200`; override the test origin with `SERVICES_TEST_WEB_URL`). It requires the initial 35-record catalog, runs seed twice, verifies database indexes/foreign keys, exercises all five roles, and drives the complete multilingual browser workflow and mobile checks. It removes its temporary service/accounts while retaining audit history, and writes results/screenshots under `artifacts/`. The script refuses non-development or remote database connections. Build the API and frontend before running it. Do not run it against production or alongside other CMS editing.
