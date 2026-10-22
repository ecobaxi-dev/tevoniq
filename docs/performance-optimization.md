# Performance optimization

## Rendering and caching

Public CMS reads use Next's data cache for five minutes with the `cms-public-content` tag. This applies to published site settings, catalogues, detail pages, SEO records, page-builder documents, career listings, lead options, and the public newsletter configuration.

Every successful non-authenticated CMS mutation through `/api/cms/*` immediately expires that tag. Editors therefore see the published change on the next public request, without waiting for the five-minute safety window. CMS proxy responses, authenticated requests, search, newsletter actions, lead submissions, uploads, and private media downloads remain `no-store`.

The public HTML is intentionally not put in a shared CDN cache. The request-specific CSP nonce is part of the document response, so sharing it would weaken the CSP design. Static assets and public media keep their long-lived immutable cache headers.

## Images, fonts, and layout stability

- Next image candidates use design-aligned breakpoints and AVIF/WebP where image optimization is used.
- Public image components provide intrinsic dimensions or a bounded `fill` container, preventing image-driven layout shifts.
- Image `sizes` reflect the rendered project-card and service-hero widths.
- The approved homepage hero artwork is preloaded with fixed intrinsic dimensions; the semantic controls remain live and localized.
- Non-critical service artwork is lazy-loaded. Public media variants (`thumb`, `medium`, and `large`) are generated at upload time and cached immutably.
- Local variable fonts use `font-display: swap`; the Arabic face is range-limited to Arabic Unicode blocks.

## JavaScript and interaction work

- Route content remains server-rendered; client components are limited to interactive controls.
- Global search is code-split and requested only after a visitor opens its modal.
- The sticky-header scroll work is passive, animation-frame scheduled, and only updates React state when the threshold changes.
- Entrance animation uses one `IntersectionObserver`, unobserves completed elements, and respects `prefers-reduced-motion`.
- Analytics scripts are only inserted after their category is permitted by stored consent and a provider ID is configured.

## Database and API responses

- Public lists use bounded pagination and select only their published translation.
- Catalogue detail handlers fetch related records in parallel with locale and publication predicates.
- Project detail pages now request only the project’s linked industries, services, and solutions. They no longer materialize the complete filter catalogue.
- Administrative endpoints retain private, uncached response semantics.

## Validation and monitoring

Run the production build to inspect route output and verify image configuration:

```sh
npm run build
npm run test:e2e
```

Use field Core Web Vitals data for release decisions. Track LCP on the localized home page and content detail pages, CLS on image-heavy catalogue pages, and INP for header, search, form, and CMS editing interactions. Set alerts against the current production baseline rather than synthetic local numbers.

## Deployment requirements

Use a persistent/shared Next data cache in horizontally scaled production deployments so tag revalidation reaches every web instance. Keep the web process and API on a low-latency private network. Serve `/media/*`, `/_next/static/*`, `/brand/*`, and `/fonts/*` through a CDN that preserves their immutable cache headers.
