# Public design review — 24 October 2026

Reviewed English and Arabic public pages against the local published content
snapshot. The sitemap plus search/resource routes contained 140 distinct routes,
including all published service and solution detail pages. Unpublished articles,
projects, industries, and jobs have no public detail URL to inspect; their shared
renderers receive the same heading components and design rules.

## Changes

- Public page titles scale from 36–56px, section titles from 30–44px, and card
  headings from 20–24px. Long headings wrap naturally with balanced lines.
- Secondary section labels use at least 14px. Reading copy and explanatory text
  use 16px with comfortable leading. Arabic retains Cairo, RTL layout and suitable
  line height; Latin retains Plus Jakarta Sans.
- The connected-thinking section now has readable top labels, an integrated
  title, aligned columns, a clearer interactive console, rounded surfaces and
  legible layer descriptions. Mobile renders it as a single-column sequence.
- Public headings use a shared semantic Heading component. Specific fragmented
  English/Arabic marketing phrases are rewritten as connected titles, and a final
  sentence stop is removed where safe. Technical names (.NET, Node.js, U.S.) and
  questions are preserved. Formatting happens at rendering; CMS drafts, published
  records, and paragraph copy are not overwritten.
- Footer reading copy and navigation labels are larger. Sticky-header anchor
  offsets keep section destinations visible below the menu.
- The quote form's 44 service options use a bounded, scrollable selector with two
  desktop columns and one mobile column. All choices remain accessible by keyboard.
- The original English hero artwork remains unchanged. Its embedded lettering is
  part of the image and intentionally retains its original appearance. Arabic
  hero composition and copy are preserved. New design CSS is scoped to English
  and Arabic public pages and does not apply to the admin editor.

## Verification

- `npm run build`: passed production build and TypeScript.
- `npm test`: 142 passed, zero failed. Initial sandbox run failed three tests
  because local server sockets were denied; the unrestricted rerun passed.
- `npm run lint` and `npm run tokens:check`: passed.
- 140 routes at 1440px and 390px: 280 successful HTTP/layout checks, zero document
  horizontal overflows, zero clipped visible headings, and no section labels
  below the intended 14px floor.
- Header fit at 1280px verified in both languages.
- Layer-demo dialogs opened and closed; the last of all 44 quote options was
  selected using the keyboard at desktop and mobile sizes in both languages.
- Browser snapshots and the machine-readable final audit are local artifacts at
  `artifacts/design-audit/`. Representative screenshots were visually inspected.

These checks cover the local production build. After deployment, hard-refresh
English and Arabic pages and spot-check against the live CMS content.
