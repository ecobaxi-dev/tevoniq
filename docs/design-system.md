# TEVONIQ design system

The internal `/design-system` route demonstrates every shared component, tokens, interactive states, light/dark themes, and RTL layout. It is available in development. Production returns 404 unless `ENABLE_DESIGN_SYSTEM=true`; that flag is not authentication, so keep it disabled on the public deployment.

## Tokens and styling

Edit `packages/config/design-tokens.json`, then run `npm run tokens:generate`. `npm run tokens:check` detects drift in generated CSS. Tokens cover colors, gradients, spacing, containers, radius, shadows, typography, breakpoints, transitions, and stacking layers. Sora and Inter are bundled locally through Fontsource; no runtime font provider is required.

Import components from `@tevoniq/ui` and styles from `@tevoniq/ui/styles.css`. Wrap interactive compositions with `UIProvider` and use its `theme` and `direction` properties. Toasts additionally need `ToastProvider`. Radix supplies keyboard and focus behavior for composite controls; all visible styling is TEVONIQ-specific.

Modules in `packages/ui/src` contain layout, actions, cards, feedback, forms, disclosure, overlays, and navigation. Form controls accept native props and refs for React Hook Form. Labels are required for icon buttons and form fields. StatCard requires verified content or an explicit development label. The showcase contains development specimens only.

## Verification

```sh
npm exec -- playwright install chromium
npm run build
npm run test:e2e
```

The browser suite checks keyboard interaction, focus restoration, forms, light/dark automated WCAG rules, mobile widths, RTL, and the public header. Automated scans support the WCAG 2.2 AA target but do not establish complete conformance.
