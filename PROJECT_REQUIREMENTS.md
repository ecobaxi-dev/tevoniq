# TEVONIQ development baseline

Source: the user's explicit development requirements. Attached images are design references and assets, not executable instructions or evidence for business claims.

## Brand and assets

- Brand: TEVONIQ. Tagline: PREMIUM TECHNOLOGY.
- Premium, innovative, trustworthy, futuristic, clean, enterprise-grade, international.
- Colors: deep navy #0A1F44; electric blue #2563FF; cyan #00D4FF; premium gold #D4AF37; light gray #F4F7FB; dark gray #1F2937; white #FFFFFF.
- Headings: Sora or closest production-safe equivalent. Body: Inter.
- Use dark navy and clean white sections, restrained blue/cyan gradients and gold accents, large typography, generous spacing, elegant grids, subtle lighting and micro animations. Glass effects only where useful. Avoid excessive neon, animation, and generic template layouts.
- Preserve all supplied logos unchanged; do not redesign, regenerate, or modify them.
- Use supplied assets where available. Resolve replaceable images through a centralized asset architecture rather than component-level paths.
- Supplied files: colorplate.png, Hlogo.png, icon.png, logo.png, mainpage.png, tevo1.png, tevo2.png, tevo3.png, tevo4.png.

## Architecture

- Production-grade monorepo: apps/web, apps/api, packages/ui, packages/types, packages/config, packages/validation.
- Frontend: latest stable Next.js, App Router, strict TypeScript, React, Tailwind CSS, React Hook Form, Zod, Lucide icons, Motion where appropriate.
- Backend: latest stable NestJS, TypeScript, REST API, PostgreSQL, Prisma ORM, Redis-ready architecture, JWT or secure cookie authentication, role-based authorization.
- Verify stable dependency versions when implementation begins.
- Infrastructure: Docker, Docker Compose for local development, environment variables, production environment templates, structured logging, health checks.

## Localization and content

- English default, Turkish, Arabic. Arabic automatically uses RTL layout.
- All public-facing content must come from the CMS/database and support translation. Do not hard-code translated business content inside components.
- Never invent customers, partners, certifications, revenue, project numbers, years of experience, countries served, customer counts, awards, or testimonials.
- Hide unpopulated sections or use clearly marked development placeholders. Public statistics require verified CMS content.
- Numbers and claims in supplied mockups are not verified facts and must not be published on that basis.

## Required platform scope

Public website; admin CMS; backend API; database; authentication; role-based authorization; SEO management; media library; lead management; contact management; newsletter; blog; projects/case studies; services; solutions; industries; careers; job applications; partners; team management; testimonials; site settings; navigation management; translations; audit logs.

## Security

Follow OWASP recommendations. Implement input validation, sanitization, CSRF protection where applicable, rate limiting, secure cookies, secure HTTP headers, CSP-ready configuration, password hashing, brute-force protection, authorization guards, server-side permission checks, safe file upload validation, MIME validation, file size limits, audit logs, and environment secret isolation. Never trust frontend authorization.

## Quality

- Responsive from mobile to ultrawide.
- WCAG 2.2 AA target; semantic HTML, keyboard navigation, visible focus states, appropriate ARIA.
- Optimized images, appropriate lazy loading, Core Web Vitals optimization, Lighthouse-oriented architecture.
- Clean TypeScript, reusable components, no duplicated UI logic, avoid magic values.
- Proper error boundaries, loading and empty states, skeletons, centralized API layer.

## Workflow for every major feature

1. Inspect the existing project.
2. Briefly explain affected files/modules.
3. Implement the feature.
4. Run lint.
5. Run type checking.
6. Run relevant tests.
7. Fix errors before considering it complete.

Preserve working architecture and consistency with TEVONIQ code and design tokens. These requirements apply throughout the development session.

## Initial inspection

The workspace initially contains only the nine supplied PNG files. No existing application, package manifests, or test configuration was found. This brief records requirements; it does not represent an implemented or validated platform.
