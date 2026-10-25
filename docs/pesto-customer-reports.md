# Pesto customer reports

Company administrators can open **Pesto customers** in the CMS sidebar at
`/admin/pesto-customers`. This is a read-only report over the existing registration,
customer, trial, purchase-key, perpetual-license and license-email tables. It
requires no database migration or enrollment/purchase feature-flag changes.

## Meaning of a customer

There is one row per normalized registration email, including unverified requests.
A verified customer profile takes precedence over later unverified requests using
the same email. Otherwise the newest registration supplies the contact profile.
The first registration date is retained; repeated registration attempts remain
visible in the detail history. Verified customers without registration history are
also included.

Status precedence is: operating license issued, active trial, expired trial,
verified without a trial, then email unverified. Trial summary figures count
customers in their current status, not individual devices or historical trials.
Portfolio summary cards are global and deliberately independent of list filters.

Search matches email, owner, restaurant, phone and purchase reference literally.
Filters cover status, country and first-registration date. Date boundaries are
inclusive UTC calendar days. Results have 20 rows per page, ordered by newest
activity then email. Each detail history shows at most its newest 50 records and
the complete count. Queries use one repeatable-read snapshot per response.

## Limits of the underlying records

- Purchase-key issuance dates and references are available. Payment amount,
  currency, payment method and bank transaction date are not currently stored;
  this page is not a financial revenue report.
- A centrally issued operating license does not prove the customer has imported
  it into the local POS. No new device telemetry is introduced.
- Email `SENT` means the provider accepted the message, not confirmed inbox
  delivery. Registration and license-message histories are shown separately.
- Report views do not request emails, issue/revoke keys, alter trials, restore
  databases or change customer records.

## Access and privacy

Both API endpoints require an authenticated CMS `ADMIN` or `SUPER_ADMIN`, plus
`settings.read`; other roles receive 403. Anonymous requests receive 401. The CMS
BFF permits GET only for these routes. Responses are `Cache-Control: no-store`.
DTOs select only report fields and never return OTPs, purchase keys/nonces/hashes,
client secrets, signed permits, device fingerprints or internal delivery errors.
The browser does not persist report data and discards stale responses and closed
detail state.

## Validation

After the API build, run `node tests/pesto-customer-reports.integration.mjs` for
isolated PostgreSQL migrations, aggregation, bounded histories, literal search,
UTC dates, pagination, secret exclusion, read-only checks and real HTTP role
authorization. No production database or email provider is used. Browser coverage
is in `tests/e2e/pesto-customers.spec.ts`, with synthetic CMS sessions and fixtures.
