# TEVONIQ

TEVONIQ is a multilingual corporate website and content platform. It combines a Next.js public site, a NestJS CMS/API, PostgreSQL, controlled media storage, role-based administration, consent-aware analytics, and an editorial workflow for published content.

The public website is intentionally content-led: real services, projects, partners, testimonials, certifications, awards, locations, and statistics are shown only when an authorized editor has entered and published them. The development seed creates no public business records.

Read [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOYMENT.md](DEPLOYMENT.md), [SECURITY.md](SECURITY.md), [docs/testing-strategy.md](docs/testing-strategy.md), and [docs/performance-optimization.md](docs/performance-optimization.md) before operating a production instance.

## Requirements

- Node.js 24 and npm 11, as specified in `.nvmrc` and `package.json`.
- Docker Desktop with Compose v2 for the local PostgreSQL service.
- Run commands from the repository root.

## Local installation

```sh
npm ci
npm run env:setup
npm run infra:up
npm run db:migrate
npm run db:seed
npm run dev
```

`env:setup` creates local `.env` files from the committed examples without overwriting an existing file. `db:seed` is development-only and refuses to run in production.

Local endpoints:

- Public web: `http://localhost:3000` (redirects to `/en`)
- Turkish: `http://localhost:3000/tr`
- Arabic RTL: `http://localhost:3000/ar`
- API liveness: `http://localhost:4000/api/v1/health/live`
- API readiness: `http://localhost:4000/api/v1/health/ready`

## Environment variables

Start with the examples in `apps/api/.env.example` and `apps/web/.env.example`. Keep actual values in local ignored files or the deployment secret manager.

| Area            | Variables                                                     | Notes                                                                                                  |
| --------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Runtime         | `NODE_ENV`, `PORT`, `SITE_URL`, `API_URL`, `CORS_ORIGIN`      | Production `SITE_URL` must be an HTTPS public origin and match the browser origin used for CMS writes. |
| Database        | `DATABASE_URL`                                                | Use a least-privileged PostgreSQL account and TLS across untrusted networks.                           |
| Media           | `MEDIA_STORAGE`, S3 endpoint/bucket/credentials, media limits | Production requires S3-backed storage; do not store confidential files in public media.                |
| Email           | `EMAIL_TRANSPORT`, `EMAIL_FROM`, SMTP settings                | SMTP is disabled by default. Configure TLS and keep credentials in secrets.                            |
| Bot protection  | `TURNSTILE_MODE`, site key, secret key, hostnames             | Set all required values together when enabled.                                                         |
| Trusted ingress | `LEAD_CLIENT_IP_HEADER`, `LEAD_PROXY_SECRET`                  | Set only when the ingress overwrites the forwarded IP header and direct API access is blocked.         |
| Optional cache  | `REDIS_URL`                                                   | Reserved for future shared services; it is not consumed by the current runtime.                        |

Never put credentials, raw analytics scripts, SMTP settings, or API secrets in CMS site settings or `NEXT_PUBLIC_*` values.

## Database and migrations

`npm run infra:up` starts PostgreSQL on loopback and persists it in the `postgres_data` volume.

```sh
npm run infra:up
npm run db:migrate       # create and apply a development migration
npm run db:generate      # regenerate Prisma client after schema changes
npm run db:deploy        # apply committed migrations in production
npm run db:seed          # development-only inactive fixtures
```

Create and review schema migrations in a development database. Production deploys must use `db:deploy`; never use `prisma migrate dev`, seed data, or a privileged application user against production.

## Create an administrator

Set `DATABASE_URL`, `CMS_ADMIN_EMAIL`, and `CMS_ADMIN_PASSWORD` in the command environment, then run:

```sh
npm run cms:admin
```

The password must be 15–128 characters. The command provisions or re-enables a `SUPER_ADMIN` account and revokes that account’s existing sessions. Do not pass the password as a command-line argument or commit it to an environment file.

## Development commands

| Command                                         | Purpose                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                                   | Watch shared packages, API, and web app.                                 |
| `npm run lint`                                  | Run ESLint with zero warnings allowed.                                   |
| `npm run typecheck`                             | Run strict TypeScript checks and Next route type generation.             |
| `npm test`                                      | Run unit and service tests.                                              |
| `node tests/careers-newsletter.integration.mjs` | Run embedded integration coverage.                                       |
| `npm run test:e2e`                              | Run Playwright against the production web build and a local fixture API. |
| `npm run format:check`                          | Verify Prettier formatting.                                              |
| `npm run test:smoke`                            | Run HTTP smoke checks after a build.                                     |

## Production build and start

```sh
npm run build
npm run build -w @tevoniq/api
npm run build -w @tevoniq/web
```

Build artifacts are `apps/api/dist` and `apps/web/.next`. Start the API with a production environment injected by the process or container platform, then start the web service with `npm run start -w @tevoniq/web`. Apply reviewed migrations before releasing either service.

## Docker usage

For a local container preview (the web uses its production build; the API runs in development mode to permit local media):

```sh
npm run env:setup
docker compose --profile app up --build -d
docker compose --profile app logs -f
```

Compose starts PostgreSQL, runs the migration job, waits for API readiness, then starts the web service. It does not seed content. `docker compose down` stops services while retaining named volumes. The Compose file is a local preview baseline; use the controls in [DEPLOYMENT.md](DEPLOYMENT.md) for a real production environment.

An empty database also needs homepage content before `/en`, `/tr` and `/ar` are available. Import the reviewed editorial bundle using the workflow in `DEPLOYMENT.md`, then restart the web container. The repository Compose preview deliberately disables email and uses persistent local media; it is not the production deployment configuration.

## Release verification

Run the following before a release:

```sh
npm run lint
npm run typecheck
npm test
node tests/careers-newsletter.integration.mjs
npm run test:e2e
npm run build
```

Also validate the real production configuration: migrations, HTTPS, health checks, media storage, malware scanning, email delivery, consent-gated analytics, CMS RBAC, backups, and the public site with only approved content.
