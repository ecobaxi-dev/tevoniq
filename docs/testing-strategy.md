# Testing strategy

TEVONIQ uses a deterministic test pyramid. Tests use fixed fixture data, local loopback services, temporary databases, fake email providers, and generated test-only credentials. They must not read production secrets, deliver email, or depend on external APIs.

## Test layers

| Layer                       | Purpose                                                                                                                             | Primary coverage                                                                                                                                                      | Command                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Unit and component-adjacent | Validate schemas, pure render helpers, state rules, form contracts, localization helpers, and service behavior without network I/O. | Form validation, language rules, navigation helpers, password/session rules, RBAC, publishing rules, upload validation, and safe rendering.                           | `npm test`                                                                                       |
| Integration                 | Exercise controllers and services against an isolated embedded PostgreSQL database.                                                 | Newsletter subscribe/confirm/unsubscribe, job application lifecycle, outbox processing, publication visibility, optimistic concurrency, and private-data projections. | `node tests/careers-newsletter.integration.mjs`                                                  |
| Local live integration      | Start production builds with a development-only local PostgreSQL database, create UUID-prefixed fixtures, and clean them up.        | Authentication, lead/contact and quote submission, CMS CRUD, publishing, media, job applications, newsletter, and admin workflows.                                    | `node tests/auth-rbac.live.mjs`, `node tests/leads.live.mjs`, `node tests/page-builder.live.mjs` |
| Playwright E2E              | Run the Next.js production build with a local fixture API.                                                                          | Homepage, desktop and mobile navigation, language switching, public form validation/submission, CMS login, service publication, search, and accessibility.            | `npm run test:e2e`                                                                               |

## Coverage map

Frontend behavior is covered through the E2E suite and pure contract tests: components render typed CMS blocks, forms reject invalid fields before submission, headers preserve path/query/hash when switching languages, and desktop/mobile navigation closes and restores focus correctly.

Backend tests isolate services with small fakes and schema fixtures. Authorization tests enumerate all roles and registered endpoints. Validation tests reject unknown fields, unsafe URLs, malformed UUIDs, stale versions, and unsupported upload types.

Integration tests use PGlite or local PostgreSQL only. They verify authentication/session lifecycle, lead idempotency and notifications, CMS draft/publish isolation, job application privacy, and newsletter token lifecycle. Email and third-party verification are always fake or disabled.

## Fixtures and determinism

- Use `tests/fixtures/services-api.mjs` only for Playwright. Its fixed IDs, records, credentials, lead reference, and responses are intentionally non-production data.
- Use `tests/page-builder.fixtures.mjs` for valid typed content. Tests derive new UUIDs when object identity matters.
- Live scripts use a fresh UUID prefix, random in-memory credentials, disabled SMTP, and `finally` cleanup. They require a localhost development database and must never target a shared or production database.
- Freeze or inject time where expiry, publication scheduling, or rate-window boundaries matter. Do not rely on real SaaS responses, DNS, current content, test ordering across files, or production accounts.

## CI gates

Run on every change:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Run the embedded integration test when its optional dependencies are installed. Run live scripts in an isolated development environment after migrations. Quarantine a flaky test instead of adding arbitrary retries; fix its clock, fixture, selector, or teardown boundary first.
