# Service navigation and UI/UX page

`content/service-expansion.json` supplies the localized Services navigation: 44 services in ten groups. Its taxonomy follows the service categories requested from N-iX, with original TEVONIQ descriptions and existing local slugs retained.

Preview the local CMS import with `node scripts/import-service-expansion.mjs`; append `--apply` to publish. The importer preserves existing published or edited records, enriches untouched initial seeds, validates typed blocks and all three locales, and creates a backup and audit record. It refuses to overwrite unavailable edited services.

`content/ui-ux-service.json` supplies the expanded UI/UX service page. Preview with `node scripts/import-ui-ux-service.mjs`; append `--apply` to publish. This targeted import preserves the service ID and ordering, backs up the existing content, and only replaces the unchanged initial expansion content. Repeat runs are no-ops; subsequent CMS editorial changes are protected.

Both commands require the local development database configured in `apps/api/.env`. Content remains editable through the existing administrator Services module. Frontend service pages continue to use published CMS records and the existing metadata and localization system.
