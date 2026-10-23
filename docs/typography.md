# Website typography

The selected pairing is Cairo for Arabic and Plus Jakarta Sans for Latin text.
Both variable fonts are served locally through Fontsource CSS imports. Heading
weights use genuine 600/700 faces, replacing the old Regular-only overrides.
Mixed-script content falls back to the other family when needed.

Design tokens are maintained in `packages/config/design-tokens.json`; regenerate
`packages/config/tokens.css` with `npm run tokens:generate` after changing them.
Section headings now scale from 32px to 44px; card headings scale from 22px to
26px. Shared body/description tokens are 18px/16px, with Arabic reading and
line-height overrides retained. Existing page-specific sizes can override tokens.

English and Arabic homepage hero copy is rendered as live text over the existing
text-free hero artwork, so it responds to the selected fonts and screen size.
The Turkish artwork composition is preserved. No CMS copy was changed.
The mobile-application service uses the same selected fonts instead of its separate
Arial/Geologica stack. The design-system specimen labels match the new pairing.

Validation: production build, lint, token synchronization, plus browser checks of
English/Arabic home, services and contact at 1440px and 390px. Checks confirm
visible homepage headings, selected font families, hero content fit and no page
horizontal overflow. Mobile-application service layouts are checked separately.
Screenshots are kept locally under `artifacts/typography` and are not deployed.
