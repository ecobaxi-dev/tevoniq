import type { NextConfig } from 'next';
const config: NextConfig = {
  // Resolve metadata in the initial HTML for all clients, including non-JS crawlers.
  htmlLimitedBots: /.*/,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    // Match the design breakpoints so image candidates are not wider than their slot.
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Avoid expensive cold AVIF encodes on the shared preview runtime.
    formats: ['image/webp'],
  },
  transpilePackages: ['@tevoniq/ui', '@tevoniq/types', '@tevoniq/validation'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Document responses receive a per-request nonce policy from proxy.ts.
          {
            key: 'Content-Security-Policy',
            value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
          },
        ],
      },
    ];
  },
};
export default config;
