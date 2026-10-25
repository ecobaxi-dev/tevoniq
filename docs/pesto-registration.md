# Pesto customer email registration

This API foundation is disabled by default. It does not start a trial, issue a
license, create a CMS login or subscribe a customer to marketing. The public Pesto
page remains informational. Native onboarding is prepared in RestaurantOS; the
separately gated [public proxy](pesto-public-proxy.md) is now prepared here. The
Render API remains private, and deployment/configuration remain separate.

## Contract

- `POST /api/v1/pesto/registrations`: requestId and installationId UUIDs,
  uppercase SHA-256 deviceHash, clientSecret (32 random bytes as lowercase hex),
  email, managerName, businessName, country (two letters), phone, language
  (`ar`, `en`, `tr`), consent `true`, optional botToken. Returns 202/pending.
- `POST /api/v1/pesto/registrations/verify`: requestId, clientSecret and the
  eight-digit emailed code. Returns a registrationTicket and its expiry, with
  canStartTrial false. Both endpoints return Cache-Control: no-store.

The client must generate and protect its secret locally, retain the request ID
for transport retries, and never log codes, secrets or tickets. DeviceHash is a
client assertion at this stage, not hardware attestation. Repeating identical
registration input does not send another email or extend expiry. Changing input
under an existing request ID returns conflict. Start a fresh request after expiry.

Codes expire 20 minutes after request creation, with at most five attempts using
the correct client secret. The successful verification response can be retried
with the same proof while the original request and ticket remain valid. It returns
the same ticket and expiry. Tickets last 15 minutes and are installation/device
bound. They are not offline signed permits or authentication sessions.

The separately gated [trial service](pesto-trials.md) calls consumePestoRegistration
inside the SAME database transaction as recording the central trial entitlement.
Consumption is single use.
Do not add a client-side trial switch or consume the ticket before that transaction.
Existing verified customer profiles are not overwritten by a new registration.

## Deployment prerequisites

The additive migration 20261024000100_pesto_registration creates PestoCustomer and
PestoRegistration. Existing startup migration deployment will apply it when this
change is deployed; no production migration was run during development.

Keep PESTO_REGISTRATION_ENABLED=false until the complete flow is reviewed. Enabling
requires an active existing EMAIL_TRANSPORT and a separate API-only
PESTO_REGISTRATION_EMAIL_KEY containing 32 cryptographically random bytes as 64
lowercase hex characters. Configure it through the hosting secret store, never in
Git or NEXT_PUBLIC variables. The Render launcher strips it from the web process.
Changing this key invalidates outstanding codes and tickets; it does not erase
verified customer records. Coordinate rotation and have clients start new requests.

An Origin header, when present, must match CORS_ORIGIN. Native clients may omit it.
Use the existing signed proxy IP protocol for any future web proxy. Signup limits
are 10/IP/15 minutes, 3/email/hour and 6/email/day; verification is 30/IP/15 minutes.
Existing Turnstile configuration applies with action pesto_registration. These
controls reduce abuse; they do not establish machine identity or prevent trial
reinstallation on their own.

The persistent email queue retries up to five times with a five-minute lease,
stable message ID, and provider idempotency where supported. SMTP delivery is not
exactly once: a crash after delivery may cause a duplicate with the same code.
Only generic transport errors are stored. Codes and client secrets are not stored
in plaintext. Unverified requests older than seven days are pruned when the worker
is enabled. Verified customers/requests are retained; define the customer retention
and deletion policy before public enrollment. Email consent is registration-only.

## Validation

Verification messages include a table-based, inline-styled HTML version in Arabic
(RTL), English and Turkish, alongside the unchanged plain-text fallback. The
eight-digit code stays contiguous and LTR, including leading zeros. The template
uses text branding and system fonts, so remote images are not required. Links are
fixed to the localized Pesto page and the support email; no tracking is included.
The message explains that expiry runs from request creation and that email
verification alone does not start a trial or activate a license.

Run `node --test tests/pesto-verification-email.test.mjs` after building the API
for localization, escaping, code and markup checks. Local HTML previews use a
synthetic code and request reference only. Real Gmail/Outlook delivery and
client-specific rendering have not been tested by sending messages; check those
clients during release validation.

Run npm test, then node tests/pesto-registration.integration.mjs. The integration
check uses an isolated in-memory PostgreSQL-compatible database, fake email
transport, and a local HTTP server; it never contacts the production database or
sends actual messages. It checks request immutability, failed-code counters,
expiry, stable email retries, concurrent worker claims, one-time bound ticket
consumption, HTTP policy, feature gating and rate limiting.
