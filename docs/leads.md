# Contact and quote workflows

Public entry points `/contact` and `/request-quote` redirect to English while retaining query parameters. Localized forms are available under `/en`, `/tr`, and `/ar` (including RTL). Header quote buttons now open the quote form. Both pages are included in the sitemap.

## Administration

Use `/admin/leads` to search, filter by form/status/archive state, sort, paginate, review private attachments, change status, add internal notes, and inspect activity and email delivery. `/admin/messages` starts with the contact filter. `/admin/lead-settings` configures notification recipients, budget choices, and attachment availability. Only `ADMIN` and `SUPER_ADMIN` can access this data, including through the API. The dashboard and global admin search use the lead table.

Statuses: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`, `SPAM`. Updates use record versions to reject stale writes. Archiving requires a confirmation dialog and typed `CONFIRM`; the server enforces confirmation as well. It retains all records and cancels pending mail. Restoring does not resend cancelled mail. There is no hard-delete API. Attachment, activity, and email foreign keys restrict deletion of referenced leads. Budget/service selections are snapshots, so changing the catalog does not erase the original enquiry context.

The migration imports existing generic lead/message records with their original IDs and timestamps. It adds an import history event and does not send retrospective emails. The original generic records remain for reference integrity; their generic write endpoints are disabled. Use the dedicated workflow for subsequent edits. Existing legacy data is not retroactively claimed to have visitor consent.

## Storage and validation

Run `npm run db:deploy` for the PostgreSQL migration and `npm run db:generate` when generating the client separately. Submissions atomically create the lead, attachment bytes, initial activity, and two outbox jobs. A client UUID and payload fingerprint make identical retries idempotent. Reusing the same UUID with changed content returns a conflict.

Shared Zod schemas validate public and admin inputs; the server validates independently of the browser. Plain-text fields are normalized and stripped of markup/control characters. React renders stored text without raw HTML. Quote consent has a timestamp and version (`quote-contact-v1`) and is separate from newsletter consent. UTM source, medium, campaign, term, and content and the allowed source-page path are stored as submitted attribution, not treated as trusted authorization data.

Quotes can include up to three PDF/PNG/JPEG files, each at most 2 MiB. Server checks include declared type, binary signature, sanitized filename, multipart limits, and a bounded web proxy body. Files stay in PostgreSQL and are downloaded through authenticated admin endpoints with attachment disposition and no-store headers. This is file-type validation, not antivirus scanning. Files are not embedded in pages or attached to outbound emails.

## Email configuration

Delivery defaults to `EMAIL_TRANSPORT=disabled`; saved leads and queued jobs remain available. To enable:

1. Set API `EMAIL_TRANSPORT=smtp`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE`. Use `SMTP_USER` and `SMTP_PASSWORD` together if the provider requires authentication. Port 587 normally uses STARTTLS (`SMTP_SECURE=false`); implicit TLS uses the provider's TLS port and `SMTP_SECURE=true`. Certificate verification remains enabled.
2. Set notification recipients in `/admin/lead-settings`. Empty recipients leave notification jobs queued; confirmations can still deliver independently when SMTP is enabled.
3. Restart the API and submit a controlled test enquiry. Check email delivery in the lead detail.

The injected `EmailTransport` contract accepts plain-text messages. Replace its binding in `AppModule` with another provider implementation to change delivery without changing lead controllers. The worker polls every 15 seconds, leases jobs, retries failures with exponential backoff, and marks them failed after five attempts. Admins can retry failed messages. SMTP errors are reduced to a safe summary. Delivery uses stable message IDs but is at least once: a crash after SMTP acceptance and before the database acknowledgement can cause a retry. Check pending jobs before enabling delivery because existing queued enquiries will become eligible.

Confirmation email acknowledges receipt in the form language. Notifications contain a limited contact summary and an authenticated admin link. Credentials never appear in public options or admin responses. See the [Nodemailer SMTP documentation](https://nodemailer.com/smtp) for provider configuration.

## Bot protection and deployment

PostgreSQL counters limit submissions to 10 per IP per 15-minute window and 3 per email per hour; the IP guard runs before attachment parsing. A honeypot, body bounds, and same-origin web proxy checks provide additional controls. Counter keys are hashed and expired rows are periodically removed. The API's existing global limiter also applies.

For individual visitor IP limits behind the Next.js proxy, set the same random `LEAD_PROXY_SECRET` (32+ characters) on both services. On web, set `LEAD_CLIENT_IP_HEADER` only to a header your trusted ingress overwrites, for example `cf-connecting-ip` behind Cloudflare. Restrict direct access to that origin. The web proxy signs the validated IP; the API ignores unsigned/spoofed forwarding headers. Without this setup, submissions share the proxy IP's limit. Never trust arbitrary client-supplied forwarding headers.

To enable Cloudflare Turnstile, set API `TURNSTILE_MODE=turnstile`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and comma-separated `TURNSTILE_HOSTNAMES`. Public options expose only the site key. The widget sends its token with the form; server verification checks success, expected form action (`contact`/`quote`), and allowed hostname. Verification failures and provider outages fail closed. Default disabled mode permits local development; enable and verify it before a public launch. Consult Cloudflare's [server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) and [widget rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/) documentation. If adding CSP at the edge, allow the documented Cloudflare script/frame endpoints.

## Verification

`npm test` covers schemas, integration configuration, attachment restrictions, proxy signatures, rate-limit behavior, Turnstile failures, and outbox delivery/retry through a fake transport. `node tests/leads.live.mjs` runs local PostgreSQL/API/browser integration tests using disabled real email delivery and cleans up its fixtures. It requires a development localhost database and a production build. Browser screenshots are written to `artifacts/leads`. No test sends external email.
