# Public Pesto enrollment proxy (disabled by default)

Three fixed Node.js POST handlers expose the private registration service:

- /api/pesto/registrations -> /api/v1/pesto/registrations
- /api/pesto/registrations/verify -> /api/v1/pesto/registrations/verify
- /api/pesto/registrations/trial -> /api/v1/pesto/registrations/trial

No catch-all destination, CMS session forwarding, login, customer listing or reset
endpoint is added. The informational Pesto page and download/activation buttons
remain unchanged. This prepares transport, not public activation of the product.

## Gates and trusted ingress

PESTO_PUBLIC_ENROLLMENT_ENABLED defaults false, independently of the API registration
and trial flags. All three must be configured deliberately before end-to-end use.
The proxy also requires PESTO_CLIENT_IP_HEADER and LEAD_PROXY_SECRET (32+ characters,
matching the private API). The configured header must be OVERWRITTEN by a trusted
ingress, with direct origin access blocked or equivalently protected. Verify this
on the actual deployment before enabling; no Render/Cloudflare header is assumed
trustworthy by default. No ingress setting or hosting secret was changed here.

Only one syntactically valid IPv4/IPv6 address is accepted. Missing or chained
addresses fail closed, rather than putting every customer in a loopback rate bucket
or trusting a caller's arbitrary x-forwarded-for. The proxy signs the edge IP using
the existing API HMAC protocol. Incoming x-lead-* signatures are never forwarded.
Existing persistent API limits and Turnstile verification remain authoritative.

The API URL and canonical public origin come from server configuration, not the
request. Only fixed Pesto suffixes are permitted. The API base must end in /api/v1,
with no credentials/query/fragment. A browser Origin must match SITE_URL exactly;
null/foreign origins and cross-site fetch metadata are rejected. Native Windows
requests may omit Origin. No CORS grant or cookie credentials are added.

## Validation and confidentiality

The private API and public proxy share the same strict request schemas from
@tevoniq/validation. Unknown properties, client expiry/role injection and malformed
identifiers fail before forwarding. Requests require JSON, reject URL queries, and
are streamed with a 12 KiB limit. The entire forwarding operation has a 20-second
budget, including slow client/upstream bodies. Upstream JSON is limited to 16 KiB.
Redirects are rejected rather than followed.

Only contract response fields are returned. Trial envelopes are shape-checked;
cryptographic signature/binding verification remains the Windows host's job.
Unexpected statuses, errors, non-JSON, malformed/large payloads and network failures
become fixed generic codes. Upstream error bodies, Set-Cookie and internal headers
are not exposed. All responses use no-store, nosniff and no-referrer. The helper
does not log request bodies, secrets, codes, tickets or permits. Do not add body
logging at an ingress/APM layer.

## Before enabling

### Temporary operator ingress probe

The POST-only `/api/pesto/transport-check` is independently disabled unless
`PESTO_TRANSPORT_DIAGNOSTICS_ENABLED=true`. Keep all three enrollment flags false.
Only an operator with the matching LEAD_PROXY_SECRET can authenticate a probe.
Requests have a purpose-separated HMAC, random nonce and two-minute timestamp
window. Responses include a signed payload with only allowlisted header shape and
nonce-bound keyed IP digests; no raw address, secret, customer data or environment
is returned. There is no API/database/mail call and no configuration mutation.
An authenticated request may be replayed within the short window; it is read-only.

After deploying, run the RestaurantOS issuer manager with `-Action TestTransport`.
It reads the existing restricted DPAPI vault and passes its proxy secret in memory
to the local probe helper, never via an external command line or plaintext file.
It checks both www.tevoniq.com and the current Render hostname with baseline,
injected documentation IPv4/IPv6 headers, then baseline again. Redirects fail;
responses are bounded and their HMAC/context is verified before displaying a table.
404 means disabled/not deployed; 403 means invalid proof, stale clock or ingress
request metadata rejection. A different preexisting Render proxy secret must be
reconciled locally rather than pasted in chat or blindly replaced.

SingleIpEveryProbe and UnchangedBySpoofProbes are observations, not automatic trust
certification. Review provider ingress topology and origin bypasses too; never
choose a header merely because it contains an IP. Disable the diagnostic flag
after the operator test. This does not enable registration or change the selected
PESTO_CLIENT_IP_HEADER. Header rewriting/hostname changes require retesting.

Render documents Cloudflare in front of web services:
https://render.com/articles/how-render-handles-ddos-attacks
Cloudflare documents its connecting-IP header and proxy/Worker caveats:
https://developers.cloudflare.com/fundamentals/reference/http-headers/

### Enrollment rollout

1. Deploy the reviewed change, leaving PESTO_PUBLIC_ENROLLMENT_ENABLED=false.
2. Confirm the trusted ingress header and matching proxy secret configuration.
3. Configure real API mail, registration HMAC and the separate licensing signer.
4. Provision the matching PUBLIC trust pin and restricted Windows enrollment storage.
5. If TURNSTILE_MODE=turnstile, complete a native/browser challenge handoff first.
   The current native coordinator does not collect botToken; the proxy intentionally
   preserves challenge enforcement rather than bypassing it. Do not disable another
   product's existing protection to work around this.
6. Enable the approved flags and test a controlled customer registration end to end.

Purchase activation, recovery/device transfer, distribution sale enforcement and
offline customer installers remain separate. No actual email, key, customer
enrollment, installed service or production setting was changed by these tests.

## Validation

npm test includes eight proxy test groups covering independent gating, origins,
strict schemas, native requests, signed edge IP, header isolation, response filtering,
fixed destinations, redirects, stream bounds and timeouts. Run
node tests/pesto-proxy.integration.mjs for the real HTTP API/isolated PostgreSQL-
compatible fixture: registration -> captured fake email -> verification -> signed
15-day trial -> exact retry. It also checks challenge enforcement, device binding,
feature gates and separation from CMS/newsletter accounts. No production access.

After npm run build -w @tevoniq/web, node tests/pesto-proxy.smoke.mjs starts the
actual standalone Next production server twice with controlled runtime flags and
a synthetic loopback upstream. It verifies the three route registrations, GET 405,
disabled-without-forwarding behavior, enabled forwarding, signed ingress metadata,
credential isolation and no-store. No public site/API is contacted.
