# Services content — 25 September 2026

Eight existing empty service drafts were selected for content enrichment: Custom Software Development, API Integration, Business Automation, Artificial Intelligence, Cloud Solutions, Cybersecurity, Network Infrastructure and Managed IT Services.

Each receives English, Turkish and Arabic copy in nine existing CMS blocks: hero, overview, capabilities, deliverables, suitable use cases, delivery process, acceptance criteria, FAQ and contact CTA. Proposed scopes are explicitly identified in card summaries, hero text and SEO descriptions. They do not claim completed client work, certifications, guaranteed results, contracted response times or unconfirmed partnerships.

The original service IDs and relationships are retained, including references from the Solutions records. Only previously empty, inactive, version-zero English seed records with no editorial attribution can be enriched. Modified, published, archived, translated or otherwise edited records are preserved. The importer checks eligibility again inside a serializable transaction. All other services remain untouched.

No public design files, components, navigation, database schema or permissions were changed. Content is editable in `/admin/services` using the existing EN/TR/AR block editor.

## Research

The following references inform general technical principles, not TEVONIQ credentials or delivery history. Copy is original and vendor-neutral.

- [NIST Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final): security considerations belong in the software development lifecycle.
- [OWASP API Security](https://devguide.owasp.org/en/07-training-education/07-api-top-ten/): API-specific risks inform integration review.
- [Microsoft approval workflows](https://learn.microsoft.com/en-us/power-automate/get-started-approvals): automated workflows can preserve human approval decisions.
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework): evaluation and risk context inform AI adoption.
- [Microsoft Cloud Adoption Framework](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/overview): cloud planning needs business and operational context.
- [NIST Zero Trust Architecture](https://www.nist.gov/publications/zero-trust-architecture): access control informs the security scope; no compliance or certification is implied.
- [Cisco campus LAN/WLAN design guide](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/cisco-campus-lan-wlan-design-guide.html): site requirements inform network architecture.
- [Microsoft cloud operations guidance](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/manage/ready-cloud-operations): responsibilities and operating documentation inform the managed operations scope.

## Import and preservation

Source: `apps/api/prisma/content/service-content.json`.

Preview: `node scripts/import-service-content.mjs --hide-development-fixture`

Apply locally: `node scripts/import-service-content.mjs --apply --hide-development-fixture`

The importer only runs against a local development database. Before writing, it records full snapshots of affected service records and their translations under `.data/content-backups/services-<run-id>.json`. Imports are audited. Existing IDs are preserved; repeat runs do not overwrite the enriched records or administrator edits.

The exact inspected Development service fixture can be unpublished and deactivated without deleting its record or relationships. Its original state is backed up. Other fixtures, projects, industries, solutions and unrelated records are not modified.

Validation covers the existing service schema, complete localized sections, stable block IDs, explicit proposed-scope wording and preservation of edited records. Live checks verify publication, public pages, language direction, search and absence of the development fixture in the service catalogue.
