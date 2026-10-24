# Advocas platform presentation

Public entry point reviewed: https://www.advocas.online/select-country.
The www HTTPS hostname worked; the bare hostname returned a certificate hostname
mismatch during this review. Public inspection included country selection and
the Saudi Arabia homepage; no account, paid service or private consultation was
used or tested.

## TEVONIQ integration

- New public introduction at `/en/advocas` and `/ar/advocas`.
- Advocas link in the Company navigation and inherited footer company links.
- Platform showcase on the English homepage only, respecting the user's existing
  homepage editing preference. Arabic homepage content is unchanged.
- Both introduction pages are included in the sitemap for enabled languages.
- External CTA uses the exact www country-selection URL in a new tab, with an
  accessible label and `noopener noreferrer`.
- Copy describes visible discovery and service options without repeating claims
  about professional verification, response times, security, customer totals or
  legal outcomes. The user identified the platform as theirs; no unverified claim
  that TEVONIQ provides the legal consultations itself was introduced.
- Pesto was not modified.

## Product suggestions from the public review

1. Configure valid HTTPS for the bare domain and redirect it to www.
2. Align geographic availability: the reviewed selector showed six countries,
   three marked coming soon, while the homepage advertised 15 countries.
3. Verify published 10,000+ customers, 500+ lawyers, 25,000+ consultations and
   rating claims before using them as proof in marketing.
4. Review public contact numbers and country-specific contact details. The Saudi
   homepage displayed +966 11 234 5678 and +966501234567; their validity was not
   tested.
5. Present a clear user journey: country, specialty, professional profile, service
   terms/fee, then request. Test that the chosen country persists through links.
6. Explain the role of the smart assistant separately from the human-professional
   consultation flow and show real product evidence instead of superlative claims.

Validation: production build, lint, desktop/mobile English and Arabic layout and
outgoing-link checks; homepage and navigation discoverability; sitemap entries;
unsupported Turkish page returns 404. Public functions behind authentication and
payment were not tested.
