# Mobile application development

The `mobile-application-development` service uses the existing localized Services CMS record and publication rules. Its presentation is informed by [N-iX mobile development](https://www.n-ix.com/mobile-development/); reference content is design research, not evidence of TEVONIQ credentials, clients or results.

`content/mobile-service.json` holds the proposed English, Turkish and Arabic CMS blocks. Business copy remains editable through `/admin/services`: open Mobile App Development, select a language, and edit or reorder its blocks. The frontend consumes the published record rather than importing the JSON as a public fallback. Missing translations and unpublished services retain the standard unavailable/404 behavior.

## Local import

From the repository root with the API's local development database configured in `apps/api/.env` and `NODE_ENV=development`:

```sh
node scripts/import-mobile-service.mjs
node scripts/import-mobile-service.mjs --apply
```

The first command previews; only `--apply` writes. The importer requires the existing active service and all three published translations. It accepts only the exact original expansion content from `content/service-expansion.json`, or exits without changes when the desired content is already present. Other editorial changes are preserved by refusing the import.

Before applying, the script saves the full record and translations to `.data/content-backups/mobile-<run-id>.json`. A serializable transaction rechecks the complete record and version, updates translations while retaining service IDs and relationships, increments the version and writes an audit event. The script rejects remote or non-development database connections. Subsequent editorial changes should use the CMS; rerunning this importer will not overwrite them.

## Visual assets

The owner explicitly requested the reference page's colors and visual details. The mobile page alone uses its orange button gradient (`#ff8200` to `#ff5000`), purple services band (`#440099` to `#a51890`), white/gray surfaces, and Geologica headings. Other service pages retain their existing styles.

The hero image was retrieved from https://src.n-ix.com/uploads/2025/08/21/a97e4210-84fd-4187-812d-ef49f9ac2a40.webp for this requested reproduction and is stored at `apps/web/public/brand/mobile/mobile-development.webp`. Its registry is `apps/web/src/config/mobile-assets.ts`. The reference image remains third-party artwork; its provenance is retained here.

Geologica Bold is locally bundled at `apps/web/public/fonts/Geologica-Bold.ttf` under the accompanying SIL Open Font License in `Geologica-OFL.txt`. Source: Google Fonts (`google/fonts/ofl/geologica`). There is no external font request at runtime. Narrative copy is original localized TEVONIQ content. Reference customer logos, testimonials, statistics, and certifications are not attributed to TEVONIQ.
