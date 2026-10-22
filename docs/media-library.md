# Media Library

Open `/admin/media`. ADMIN, SUPER_ADMIN and CONTENT_MANAGER can upload and edit; other CMS roles can browse and preview. Choose multiple files to upload sequentially; each file has a separate result. Collection names group assets without changing file URLs. Search matches title, original filename, alt text and caption; filters cover collection, MIME type and archived status. Metadata edits use version checks and audit records. The page builder image controls include a searchable, paginated library picker that copies the URL, alt text and caption into the section. Translate these copies as needed.

## Upload safety and originals

The API independently enforces a configurable byte limit, MIME/content agreement, decoded dimensions, pixel limits and complete raster decoding. It accepts JPEG, PNG, WebP and AVIF; animated/multipage formats are rejected. SVG is limited to 1 MiB and a strict XML vocabulary of static shapes and gradients. Scripts, event handlers, CSS, links, embedded images, foreignObject, text elements, DTDs and processing instructions are rejected. Normal SVG uploads are rebuilt as sanitized XML; protected SVG uploads must pass the same complete validation and retain their original bytes. SVG is served only as an image with `nosniff` and a restrictive sandbox CSP. Convert unsupported SVG lettering to paths before uploading.

Raster originals remain byte-for-byte intact. Separate, auto-oriented WebP derivatives (up to 320, 960 and 1600px wide) are generated without upscaling, with metadata stripped. SVGs are not rasterized. Select **Protect original** to disable derivatives and archival. No library operation writes to or modifies the official assets under `apps/web/public/brand`; filenames never become filesystem paths. There is no file-replacement endpoint.

## References and deletion

Asset details scan URLs across Blog, Company, page-builder drafts and published snapshots, Services, Solutions, Industries, Projects and generic admin records, including archived content. References to any derivative count. Referenced or protected assets cannot be archived. Archive and restore require typing CONFIRM. Archival only removes the asset from active library results; immutable public URLs and stored files remain available, including when content references race with archival. There is deliberately no permanent deletion endpoint. External websites or documents using copied URLs cannot be enumerated. Old URL-only media records remain in the database and are not converted into uploads.

## Storage and configuration

`StorageProvider` exposes put/get/remove. `LocalStorageProvider` uses `MEDIA_LOCAL_ROOT` (default `.data/media`, relative to the API process working directory). Back up that directory together with PostgreSQL. It is not a static upload directory; only filenames recorded in MediaAsset are publicly served through `/media/:id/:file` on the web app.

Production requires `MEDIA_STORAGE=s3`. `S3StorageProvider` uses the AWS SDK and supports private S3-compatible buckets through `MEDIA_S3_BUCKET`, `MEDIA_S3_REGION`, optional `MEDIA_S3_ENDPOINT`, and `MEDIA_S3_FORCE_PATH_STYLE`. Supply IAM workload credentials or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY through secret management. Public requests pass through the web/API with fixed content types; the bucket need not be public. Permit GetObject, PutObject and DeleteObject on the dedicated prefix/bucket. DeleteObject is used only to clean up failed uploads. Do not share this bucket/prefix with official source assets. Back up objects and database together. Changing providers is a migration: copy objects and update recorded provider names after verification, rather than just switching the environment variable.

`MEDIA_MAX_FILE_BYTES` defaults to 10 MiB and can be configured from 1 KiB to 25 MiB; the authenticated web proxy caps multipart requests at 26 MiB. `MEDIA_MAX_PIXELS` defaults to 25 million and cannot exceed 40 million. Two uploads per API process may be processed concurrently; additional requests receive 429. The existing API rate limiter also applies. Metadata requests use the existing CMS JSON size cap, authentication and origin checks. Successful uploads and metadata/archive/restore actions are audited.

Run `npm run db:deploy` and regenerate Prisma when deploying. `node --test tests/media.test.mjs` covers image validation, SVG rejection, immutable local storage and S3-compatible transport. The live test uses local test fixtures only.
