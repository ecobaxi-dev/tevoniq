# N-iX reference inspection and TEVONIQ adaptation

Inspected on 2026-10-25 using REA capture_browser_scenario with an owned, headless Chrome browser. Local implementation only; no production deployment.

## Evidence and coverage

- Homepage: https://www.n-ix.com/ — DOM, accessibility and 1440 × 1000 screenshot. Evidence: ev_3679dd86db2ebcf01d96749de72c6ba4baab6d49826901059ab0008414defb59.
- Expertise: https://www.n-ix.com/expertise/ — accessibility capture at 390 × 844. Evidence: ev_6dfa0194a7da6793c3bf594111df8fc2e807bace73031c404b14c58660a29792.
- These are two page captures, not a complete crawl. Dropdown behavior, backend implementation, performance and form submission were not audited. The mobile expertise capture establishes document content, not visual layout.

## Findings and decisions

| Observed pattern | Existing TEVONIQ capability | Adaptation |
| --- | --- | --- |
| Service, industry, success-story and insight navigation | Localized navigation and CMS catalogs already exist | Preserve established navigation and add localized “View all” links to nonempty homepage collections |
| A prominent four-phase delivery explanation | Quality and capability sections exist, but no explicit delivery sequence on the homepage | Add an original Discover → Design → Build & validate → Support & evolve section |
| Calls to action alongside explanatory content | Contact and quote routes already exist | Link the new delivery section to the localized request-quote page |
| Client logos, certifications and quantitative outcomes | Homepage collections use published/verified CMS data | Preserve publication rules; do not import N-iX claims or customer relationships |
| Orange hero with animated decorative assets | Existing TEVONIQ brand artwork and navy/blue/gold palette | Preserve TEVONIQ artwork and use existing visual conventions |

## Implemented

- Server-rendered delivery section with original English, Turkish and Arabic copy.
- Four ordered stages; native details/summary controls reveal the proposed outputs of each stage without requiring client JavaScript.
- Four desktop columns, two tablet columns and a single mobile column, logical spacing, visible keyboard focus and RTL-compatible layout.
- Localized catalog links for published industries, projects, partners and insights. Empty collections remain hidden.
- New process copy is code-owned, like other existing marketing sections; it is not editable in the CMS in this change.

## Validation

- Web TypeScript check passed.
- Prettier check passed for changed application files.
- REA local desktop screenshot reviewed at 1440 × 1000 (English): ev_a32db0ed586fabd7272911bc64388d5dc24083f24540321c739bd74c6fe285d3.
- REA local mobile screenshot reviewed at 390 × 844 (Arabic); opening the discovery details exposed the expected Arabic output: ev_8091cc820cc6724fc695a8619ad3bb604e716186c0e6fd5b9f0d85f097b00ba2.
- REA tablet scenario at 768 × 1024 (Turkish) completed expand, collapse and project inquiry link actions: ev_bf3e4735d1660d46966f06390853c7b862b5b4318c304c2841b28c0de4290757.
- Local preview used the existing isolated API test fixture, not production CMS records. Nonempty collection links were inspected in source; fixture collections are empty. No inquiry or newsletter was submitted.

## Follow-up content opportunities

Publish owner-approved project outcomes, partner credentials and industry examples through the existing CMS. Those need TEVONIQ-specific source material; reference-site claims are not evidence for TEVONIQ.

## Owner-requested populated preview — 2026-10-25

The owner subsequently requested complete temporary content across the main and subsidiary sections. The local CMS now includes 11 industries, six labelled example projects (three attributed N-iX references), 36 localized insight records, four sample team roles and three sample partner profiles per language, and three non-recruiting example vacancies. Existing services and solution copy were preserved; solution relationship sections and company content were completed. Every homepage collection now has data.

See [the demo catalog guide](demo-content.md) for coverage, source references, import commands, backups and CMS editing routes. This is local demonstration content, not a production deployment or a claim that TEVONIQ delivered N-iX projects.

