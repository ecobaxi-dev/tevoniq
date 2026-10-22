# TEVONIQ security

Reviewed 2026-09-17. This document describes the implemented controls, review findings and operator responsibilities. It is not a penetration-test certification or a guarantee that no vulnerabilities remain.

## Scope and review method

Reviewed the Next.js public site, admin UI and backend-for-frontend routes; NestJS controllers, global authorization policy and workers; shared Zod validators; Prisma queries and migrations; upload/storage adapters; cookie/analytics handling; environment configuration and container packaging. Reviewed authentication, authorization/RBAC, uploads, XSS, CSRF, SQL/ORM use, redirects, SSRF, traversal, throttling, passwords/sessions, CORS/headers/CSP, secrets/logging/PII, admin endpoints, mass assignment, IDOR and validation.

Source review was supplemented by regression tests, a production browser with an isolated API fixture, and build/type/lint checks. No production systems were probed. PostgreSQL-dependent live authentication checks could not run because the local database connection was refused. Unit tests include mocked persistence and embedded PostgreSQL search tests; these do not substitute for a deployment test against the production database.

The production dependency audit initially found two high-severity Multer denial-of-service advisories. The affected upload dependency was upgraded and a follow-up `npm audit --omit=dev --audit-level=high` reported zero known vulnerabilities across 972 audited packages. This is point-in-time advisory coverage, not a guarantee against newly disclosed vulnerabilities. Source scanning found no recognizable private-key/provider-token patterns in application source; Git history and external secret stores were unavailable for assessment.

## Findings fixed

| Finding                                                                                                       | Impact and change                                                                                                                                                                                                                                                  | Evidence                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Media usage summaries crossed business-record permissions (medium)                                            | A user with media read access could see a private legacy record's title if it referenced an asset. Summaries now filter by the record resource's read permission. Internal archive safety checks still inspect every reference.                                    | `apps/api/src/media/usage.ts`, `tests/security.test.mjs`                               |
| Quote attachments lacked malware scanning (medium)                                                            | File signature checks alone do not establish safety. Quote attachments now use the ClamAV stream adapter before persistence, reject size/buffer mismatches and fail closed without a production scanner. CVs already required scanning.                            | `apps/api/src/leads/attachments.ts`, `leads.controller.ts`, security and careers tests |
| Request/error logs could contain PII or sensitive diagnostics (medium)                                        | Request serializers now omit query strings, bodies, headers and remote addresses; unexpected server errors return a generic response and log a safe event. A silent email queue failure now emits a safe operational error.                                        | `apps/api/src/security/`, `app.module.ts`, `email/lead-email.worker.ts`                |
| Container build context included local runtime material (potentially high if sensitive local data is present) | Excluded local data, npm caches, logs, artifacts, test results and private-key files. Environment files were already excluded. No built image was inspected for historical leakage.                                                                                | `.dockerignore`                                                                        |
| Browser CSP did not restrict scripts (defense in depth)                                                       | Added unpredictable per-response nonces, strict script execution policy, blocked inline event handlers, constrained connections/frames, and HTTPS HSTS. Framework hydration, structured data, consented analytics and Turnstile receive compatible nonce handling. | `apps/web/src/proxy.ts`, nonce provider, production browser regression                 |
| Admin caching was inconsistent (defense in depth)                                                             | All direct CMS API responses now receive private/no-store caching, including failures. The web proxy already prevents caching.                                                                                                                                     | `apps/api/src/main.ts`                                                                 |
| Authentication throttling grouped users behind the web proxy (availability)                                   | Login/recovery/reset now honor the existing HMAC-signed client-IP mechanism. Unsigned or invalid forwarded addresses are ignored. Account-level limits remain enforced.                                                                                            | `cms/auth.controller.ts`, web CMS proxy, signed-IP tests                               |
| Public web origin configuration could permit insecure production cookies (configuration)                      | Public production SITE_URL requires HTTPS, except loopback previews. Origin credentials/path/query/fragment are rejected; API URL embedded credentials/query/fragment are rejected.                                                                                | `packages/validation/src/index.ts`, security tests                                     |
| Multer upload parser contained high-severity denial-of-service advisories (high)                              | Updated `@nestjs/platform-express` to 12.0.3 and the direct Multer dependency to 2.4.0. The follow-up production dependency audit reported no known vulnerabilities.                                                                                                  | `apps/api/package.json`, `package-lock.json`, `npm audit --omit=dev --audit-level=high` |

## Security controls

### Authentication, sessions and RBAC

Passwords require 15–128 characters and use salted scrypt (N=131072, r=8, p=1). Verification uses constant-time comparison; expensive derivations have a process-level concurrency limit. Login responses are generic and nonexistent accounts perform a dummy derivation. Authentication attempts are limited atomically in PostgreSQL by account and client identity.

Session tokens are 32 random bytes, with only SHA-256 digests stored in the database. The web proxy keeps tokens in an HttpOnly, SameSite=Strict cookie scoped to `/api/cms`; Secure follows the validated HTTPS site origin. Tokens are not returned to browser JavaScript. Sessions have an eight-hour absolute lifetime and a server-enforced configurable idle timeout. Role changes, account disabling, password resets and global revocation invalidate sessions using an authentication version. Individual session revocation is constrained to the current user. Reset tokens are hashed, expire after 30 minutes, are consumed atomically and travel in URL fragments rather than query strings.

A global NestJS guard explicitly allowlists public endpoints; all other controller handlers require a permission policy. Unknown handlers are denied even for SUPER_ADMIN. Permissions are derived from the database role, never client-submitted claims. User management requires SUPER_ADMIN; self-demotion/disable and removing the final active super administrator are prevented. Publishing, deleting, exporting subscriber data, accessing applications/CVs, accessing leads and settings have separate permissions. UUIDs identify objects but do not grant access. Lead attachments bind both lead ID and attachment ID; role-granted CRM/hiring access intentionally spans records rather than using per-owner tenancy.

There is no built-in MFA or SSO. Protect admin access with an identity-aware ingress/VPN with MFA before a sensitive production deployment. Do not rely on robots.txt or hidden navigation as access controls.

### Validation, injection and request boundaries

Writes use strict Zod schemas and explicit fields, bounded arrays/text and version checks. Generic CMS fields are restricted to module definitions. No request-supplied Prisma filter or arbitrary ORM operator is accepted. Raw SQL in application code uses Prisma tagged-template parameters; sorting and enum inputs are validated. No application use of unsafe raw-query APIs was found. Transactions and optimistic versions protect multi-record edits and prevent stale updates.

React escapes ordinary content. CMS rich content uses typed blocks rather than raw HTML. JSON-LD escapes `<` before serialization. SVG is rebuilt from a restricted XML vocabulary that rejects active content, external references, document types and unsafe attributes. The nonce CSP blocks parser-injected JavaScript; production does not allow unsafe-eval. Styles retain unsafe-inline for existing React/Radix layout styles. Image/media HTTPS sources remain broad to support configured content. Any future raw HTML renderer requires a dedicated sanitizer and security review.

Browser write proxies require the exact configured Origin and enforce content type/body limits. Session cookies are converted server-side to API bearer authorization. Direct bearer API requests do not use ambient browser credentials. CORS permits only the configured exact origin; CORS is not authentication. CMS proxy routes/methods are explicitly allowlisted. Public submission endpoints also validate supplied origins, apply database-backed throttles and support Turnstile checks of hostname and action.

### Uploads, paths, outbound requests and redirects

CMS image processing verifies MIME/decoded format, bounds bytes/pixels/complexity, limits concurrent uploads and strips metadata when re-encoding ordinary raster uploads. Static SVGs are validated; protected brand originals preserve validated source bytes. Media is public content, including protected brand assets: the protected flag prevents destructive modification and is **not** a privacy designation. Do not store confidential files in the public media library. Public immutable media caching means archive is not an erasure mechanism; deletion requests require storage/CDN remediation.

CVs and quote attachments remain behind authorized download endpoints, use attachment disposition and no-store/nosniff headers, and are never served as executable site content. Production scanning rejects unavailable, infected or ambiguous scanner responses. Malware scanning cannot guarantee harmless files; keep scanner signatures current and use protected viewers for untrusted documents.

Local and S3 storage keys accept only generated asset UUIDs and known filenames. User filenames never select filesystem paths. API fetch destinations are deployment configuration, fixed providers, or constrained route segments; no public arbitrary URL-fetch endpoint was found. SMTP disables file and URL access. S3 endpoints, scanner hosts and API origins are trusted operator configuration; restrict egress and configuration access. Root/language redirects use validated locales; configured external navigation links are intentional links, not arbitrary redirect endpoints.

### Secrets, PII and logging

Public site settings are constructed from an explicit allowlist. Internal email routing, security and media administration fields are excluded; raw scripts and credential fields are rejected. Credentials belong in deployment environment injection or a managed secret store, never CMS data or NEXT_PUBLIC variables. SMTP requires TLS/STARTTLS and certificate verification remains enabled. Database, SMTP, storage and proxy credentials must be distinct and least-privileged.

Application request logs retain method, path, request ID and response status rather than payloads or query strings. Audit events retain actor, action and object identifiers; business activity/history may contain authorized notes and must be treated as PII. Infrastructure/CDN logs have separate policies and must also redact URL queries, cookies, authorization and form bodies. Do not enable Prisma query logging or raw error dumping in production. Restrict log access, encrypt backups and define retention/deletion periods for leads, CVs, subscriptions, audit events and queued mail. No universal automatic retention policy is implemented.

## OWASP Top 10 coverage

Mapped against the [OWASP Top 10:2025](https://top10.owasp.org/2025/). This is review coverage, not a compliance certification.

| Category                                   | TEVONIQ assessment                                                                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 Broken Access Control                  | Default-deny endpoint policies, object binding, business-role checks; media summary disclosure fixed. CSRF, SSRF, traversal and redirects reviewed. |
| A02 Security Misconfiguration              | CSP, headers, exact CORS, HTTPS validation, no-store controls and container exclusions hardened; ingress configuration remains operator-owned.      |
| A03 Software Supply Chain Failures         | Lockfile and npm ci used. Current production dependency audit is clean after the Multer security update; dependency/image/CI provenance still requires follow-up. |
| A04 Cryptographic Failures                 | Scrypt passwords, random tokens, hashed token storage, HMAC proxy identity, SMTP TLS; database/storage encryption depends on deployment.            |
| A05 Injection                              | Parameterized SQL, strict schemas, escaped React/JSON-LD, SVG restrictions and CSP; no exploitable SQL/XSS path identified in reviewed code.        |
| A06 Insecure Design                        | Separate publish/business permissions, optimistic concurrency, limits and consent gating; MFA and retention need deployment decisions.              |
| A07 Authentication Failures                | Expiry/revocation/versioned sessions, reset safeguards and shared database throttles; signed client attribution added.                              |
| A08 Software or Data Integrity Failures    | Transactional edits, audited mutations, bounded validated uploads and production scanning; protect build and migration privileges.                  |
| A09 Security Logging and Alerting Failures | PII-safe request/error logging and worker failure event added; configure external alerts and restricted audit retention.                            |
| A10 Mishandling of Exceptional Conditions  | Generic server errors, bounded operations, fail-closed authorization/scanning/verification; capacity and outage testing still required.             |

## Deployment requirements

1. Use HTTPS for the public site and align SITE_URL with CORS_ORIGIN. Keep API/database/scanner services private. Run production mode, preserve security headers, disable public error/debug pages and do not cache nonce-bearing HTML or admin API responses at a CDN.
2. Terminate TLS at a trusted ingress. Configure request-body, header, connection, upload concurrency and timeout limits before Next.js. Match upload limits to enabled features. The global API limiter is process-local and sees the transport peer; use a distributed ingress limit for multiple replicas and avoid a shared proxy bucket becoming an availability bottleneck.
3. Configure LEAD_CLIENT_IP_HEADER only for a header that the ingress overwrites and whose upstream cannot be reached directly. Set the same random LEAD_PROXY_SECRET on web and API. Never trust arbitrary X-Forwarded-For. Without this configuration, auth/submission limits conservatively use the proxy peer address and may group users together.
4. Configure CV_CLAMAV_HOST and CV_CLAMAV_PORT on a private network, with sufficient stream limits, health monitoring and updated signatures. These settings now cover quote attachments too. Production uploads requiring scanning remain unavailable if the scanner is absent.
5. Use private S3 bucket permissions for the API storage role; public media is served through the application. Production configuration requires S3 storage. Prevent storage symlink manipulation for local development, and keep uploads outside executable/static application directories.
6. Inject DATABASE_URL, SMTP_PASSWORD, LEAD_PROXY_SECRET, TURNSTILE_SECRET_KEY and storage credentials at runtime. Use workload identity where available. Do not pass secrets as Docker build arguments. Restrict database privileges; apply reviewed migrations with a separate migration role. Require encrypted database connections across untrusted networks.
7. Create administrator accounts through the controlled bootstrap command, use unique passwords and MFA at the ingress, and restrict SUPER_ADMIN assignments. Verify recovery email delivery and revocation before launch.
8. Configure analytics IDs only when intended. GTM containers execute trusted third-party code: restrict their publishing permissions, audit container changes, and review any CSP additions needed by tags. Consent gating does not make arbitrary tag code safe.
9. Run a current dependency and container vulnerability scan in an approved environment, pin release artifacts, protect CI credentials/branches and regularly patch the runtime and image libraries. Test restoration from encrypted backups and rehearse incident response.
10. Validate the deployed headers, cookies, CSRF rejection, role boundaries, scanner outage behavior and rate limits against actual PostgreSQL/ingress/storage/SMTP configuration. Browser fixtures are not evidence that production services are correctly configured.

## Reporting and incident response

No verified security reporting mailbox has been supplied. The operator should establish a monitored private security contact and publish it in `/.well-known/security.txt` after ownership is verified; do not invent an address. Until then, report privately to the known TEVONIQ project owner through an existing authenticated channel. Avoid public issues containing tokens, customer data or exploit details.

A useful report includes affected route/version, prerequisites, minimal reproduction, expected/actual behavior, impact and redacted evidence. Do not access additional records, send bulk traffic or modify production data to prove impact.

On a suspected incident: assign an incident owner; preserve access-controlled evidence; isolate affected services; revoke sessions using authVersion/logout-all; rotate exposed credentials and affected recovery tokens; assess data access from audit/ingress records; patch and redeploy from a trusted build; verify containment; restore service and monitor. Determine notification obligations with the responsible privacy/legal contact. Keep a private timeline and conduct a post-incident review without copying secrets or PII into public reports.

## Verification

Run from the workspace root:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
node --test tests/settings-cookies.live.mjs tests/footer.live.mjs
```

Regression coverage includes authorization, password/session handling, signed proxy identity, strict input schemas, safe rendering, upload rejection/scanner verdicts, public settings projection, private media usage, logging/error sanitization, consent gates and a parser-injected script blocked by the production CSP. Run PostgreSQL-backed live tests separately against an isolated test database, never production. Local check outputs are under `artifacts/security-*.log`; these artifacts are excluded from container builds.
