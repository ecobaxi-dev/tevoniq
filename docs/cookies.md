# Cookie management

The public EN/TR/AR layout includes a compact consent banner and an accessible preference dialog. Visitors can reject optional cookies, accept all, select categories, and reopen the dialog from the footer or policy pages. Necessary cookies remain enabled. Preferences controls the optional remembered language.

Analytics permission gates Google Analytics and Microsoft Clarity. Marketing gates Meta Pixel. Google Tag Manager requires both permissions because its externally managed container may contain either category. IDs must be explicitly configured. Newsletter token pages suppress analytics.

Legal settings require analytics and marketing consent by default. Administrators can independently configure exceptions for their deployment; no geographic or legal determination is inferred. An explicit rejection always wins. Configure the policy version to request fresh consent after a purpose change; provider and consent configuration changes also invalidate earlier choices.

Choices are persisted in first-party local storage with a cookie fallback and configured expiry. Malformed, expired or mismatched records cannot grant permission. Withdrawing consent clears known accessible optional cookies and reloads the document to stop already-running vendor code. Third-party and HttpOnly cookies cannot be cleared by frontend JavaScript. Consent changes synchronize across tabs and on focus.

`/{locale}/privacy-policy` and `/{locale}/cookie-policy` render on the server and are included in the SEO route inventory. Legal settings supply additional plain-text policy information and optional external policy destinations. Only configured services and actual supplied company contact details appear. Both pages provide a cookie-settings control.

Tests: `node --test tests/cookies.test.mjs tests/site-settings.test.mjs` and `node --test tests/settings-cookies.live.mjs`. The browser test covers persistence, granular gating, withdrawal, configuration changes, accessibility, mobile and Arabic layouts, and absence of scripts for blank IDs.
