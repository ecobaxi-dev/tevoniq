# Illustrations for the six solutions

Each established solution now has a distinct SVG scene, rendered directly in its card and detail hero. The drawings use the existing navy/cyan/gold palette and Lucide icon system. They do not depend on raster image downloads, Next image optimization or third-party animation assets.

| Solution | Scene |
| --- | --- |
| Intelligent Document Workflow | Documents enter a scanner and become structured, reviewed records |
| Connected Retail Operations | Store, sales terminal and warehouse exchange order and stock information |
| Smart Workplace Experience | Meeting space, remote team and calendar connect through a collaboration hub |
| Resilient Hybrid Cloud | Local servers, a cloud environment and recovery storage exchange data |
| Secure Digital Access | User identity passes through a policy checkpoint before reaching applications |
| Business Operations Hub | Requests move through approval stages to completion |

Implementation: `apps/web/src/components/solution-illustration.tsx` and its CSS. Slug mappings, accessible descriptions and the three stage labels in EN/AR/TR live in `apps/web/src/config/solution-illustrations.ts`. `conceptArt()` selects the scene, so existing catalog/detail components use the same illustration.

Motion is subtle and pausable using a native checkbox/label control; it works without client JavaScript. Reduced-motion preferences render complete static scenes and hide unnecessary playback controls. Related-content previews inside full-card links are static to avoid nesting an interactive pause control inside a link. Repeated scenes receive unique SVG IDs through React `useId`.

REA reviewed all six scenes on desktop, the Arabic catalog on mobile, the checked pause control and the static reduced-motion mode. All six illustrations were present in the accessibility tree, all 12 SVG pattern/gradient IDs were unique, and no page errors were captured. The scene coverage test checks that all established solution titles receive distinct artwork.

No database migration or new environment variables are needed. Deploy the source normally.

The production web build and all 175 repository tests passed. Local HTTP checks confirmed six distinct inline scenes in the catalog and the corresponding hero in every solution detail page across EN/AR/TR; related-content links contain no nested playback controls.
