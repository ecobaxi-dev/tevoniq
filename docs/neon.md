# Neon PostgreSQL on Render

The app keeps NestJS, Prisma and `@prisma/adapter-pg` on Render. Neon provides
PostgreSQL only; the existing CMS authentication is unchanged.

`neon deploy` pulls `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct)
into the ignored root `.env`. Never commit these values or paste them into chat.

- `npm run db:deploy:neon` applies the repository's Prisma migrations using the
  direct connection.
- `npm run dev:neon` starts local development with the root Neon variables taking
  precedence over the API workspace's local database URL.
- Ordinary `npm run dev` continues to use the local API environment.

Prisma configuration prefers `DATABASE_URL_UNPOOLED` for migrations and falls
back to `DATABASE_URL` for installations that supply only one URL. Application
queries use `DATABASE_URL`. Database secrets stay on the API process.

## Transfer the live database before switching Render

Provisioning and migrations do **not** copy the live CMS, users, or enquiries.
Do not switch Render to an empty database or bootstrap a replacement admin.

1. Use PostgreSQL 17 or newer client tools and the source's external direct URL.
2. Temporarily stop application writes for the final copy. Export the current
   Render database with `pg_dump --format=custom --no-owner --no-acl` to a private
   backup. Retain the original database for rollback.
3. Restore into a separate, empty Neon database using a direct connection and
   `pg_restore --no-owner --no-acl --exit-on-error`. The current test database
   already contains migrated schema: do not blindly restore over it.
4. Compare table row counts and critical records, including CMS users, published
   content, and enquiry `6d0acad1-1d4e-4b44-83b1-cef28e63efad`.
5. In Render, replace the Blueprint-managed database reference with the Neon
   pooled `DATABASE_URL` and direct `DATABASE_URL_UNPOOLED`. Update `render.yaml`
   to preserve external secret configuration on future Blueprint syncs.
6. Deploy, check readiness, sign in, save an English draft, and submit and verify
   a contact request through `https://www.tevoniq.com` before reopening writes.

Keep `SITE_URL=https://www.tevoniq.com`. Monitor Neon Free usage in its console;
moving the database does not remove Render Free's web-service idle suspension.

## Verification on 2026-10-23

- `neon deploy`: branch production matched the policy; pulled three Neon variables.
- `npm run db:deploy:neon`: all 17 migrations applied successfully.
- `npm run build` on Node 24: exit 0, compiled successfully, generated 42 static pages.
- `npm run lint`: exit 0.
- Local built web on port 3105 and API on 4105: readiness and contact page returned 200.
- Multipart POST through the web `/api/leads` route returned 202; independently
  queried Neon with Prisma to verify the lead, submission activity and two outbox
  records. Temporary lead and dependent records were then removed.

The first sandboxed build stalled and was interrupted; the build outside the
sandbox passed. The smoke harness initially used the source Prisma client path
and omitted required form fields; after correcting the harness, it passed.
`pg` emitted its forward-looking SSL-mode warning for Neon's generated
`sslmode=require` URL; certificate verification was not disabled.

The final Render backup was restored into the separate Neon database `tevoniq`
after the user suspended the web service. All 45 tables matched by row count and
full-row SHA256, including 44 services, 6 solutions, 15 company pages, one CMS
user, and two enquiries. The known contact reference was verified.
Live environment cutover and resumption are still pending. Store the source external connection URL only in the
ignored `.data/neon/render-source.env` file under `SOURCE_DATABASE_URL`.

The final archive is `.data/neon/render-2026-10-23T08-36-10.891Z.dump` (236198 bytes).
Verification hashes are in `.data/neon/verification.json`; target connection URLs
are in `.data/neon/render-target.env`. These files are private and ignored.
`render.yaml` now accepts externally supplied database URLs while retaining the
original Render database for rollback. Do not use the root `.env` URLs for the
cutover: those still point at the initial empty `neondb` test database.
