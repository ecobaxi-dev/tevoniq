# Solutions content — 25 September 2026

The owner requested new, invented solutions. These six entries are explicitly labelled **solution concepts**, including on listing cards, detail heroes and SEO descriptions. They are not represented as completed TEVONIQ projects, products already available, customer engagements, certifications or measured business achievements. Each page also explains this distinction in its FAQ.

## Published editorial scope

| Concept                       | Proposed scope                                                     | Languages    |
| ----------------------------- | ------------------------------------------------------------------ | ------------ |
| Intelligent Document Workflow | Document intake, reviewed extraction, approvals and archiving      | EN / TR / AR |
| Connected Retail Operations   | Product references, inventory events and order coordination        | EN / TR / AR |
| Smart Workplace Experience    | Meeting rooms, booking information and operating procedures        | EN / TR / AR |
| Resilient Hybrid Cloud        | Dependency mapping, recovery objectives and restoration exercises  | EN / TR / AR |
| Secure Digital Access         | Identity, access ownership, sign-in policies and lifecycle reviews | EN / TR / AR |
| Business Operations Hub       | Structured requests, approvals and accountable follow-up           | EN / TR / AR |

Each translation has nine existing CMS sections: hero, challenge, overview, architecture, capabilities, intended benefits, phased implementation, FAQ with evaluation criteria, and contact CTA. Copy is stored in the database through the existing Solutions schema and remains editable in `/admin/solutions`. No frontend components, styles, logos, navigation, database schema or permissions were changed.

## Research references

These sources informed general technical principles only. They do not establish TEVONIQ delivery experience, partnerships, product availability or outcomes. The business scenarios and wording are original editorial concepts.

- [Microsoft Document Intelligence: accuracy and confidence](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept/accuracy-confidence?view=doc-intel-4.0.0): uncertain extraction results can be routed to human review.
- [AWS smart grocery reference architecture](https://docs.aws.amazon.com/reference-architecture-diagrams/latest/smart-grocery-scan-and-go/smart-grocery-scan-and-go.html): integration of store systems and digital ordering provides context for the retail concept.
- [Microsoft Teams Rooms planning resources](https://enablement.microsoft.com/en-us/microsoft-teams/teams-rooms/): room planning and operating considerations informed the workplace concept; no vendor certification is claimed.
- [Microsoft disaster recovery architecture guidance](https://learn.microsoft.com/azure/architecture/resiliency/disaster-recovery-azure-applications): workload priorities, recovery objectives and practical exercises inform the recovery concept.
- [NIST SP 800-207](https://www.nist.gov/publications/zero-trust-architecture): resource-focused access decisions inform the identity concept. This is not a compliance claim.
- [Microsoft Power Automate approvals](https://learn.microsoft.com/en-us/power-automate/get-started-approvals): human decisions can form part of automated approval workflows. No specific vendor implementation is promised.

## Reproducible import and preservation

Source copy: `apps/api/prisma/content/solution-concepts.json`.

Preview: `node scripts/import-solution-concepts.mjs --hide-development-fixture`

Apply locally: `node scripts/import-solution-concepts.mjs --apply --hide-development-fixture`

The importer validates all translations against the existing CMS schema, restricts writes to the local development database, preserves any record whose slug already exists, and records an audit event for each new concept. A snapshot in `.data/content-backups/solutions-<run-id>.json` is written before the transaction. Re-running the import never overwrites administrator edits.

Only the exact previously inspected development solution can be hidden, and only while its identifying development text and version still match. Its row and relationships are preserved. Existing draft solutions, projects, services and industries are not activated or rewritten. No client-project relationships are invented. Service references point only to existing records and retain their independent publication controls.

The snapshot records new IDs and the old fixture state for a targeted rollback. The new content can also be unpublished or edited through the existing Solutions admin interface.
