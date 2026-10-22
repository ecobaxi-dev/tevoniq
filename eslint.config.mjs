import base from './packages/config/eslint/base.mjs';
import next from 'eslint-config-next/core-web-vitals';
export default [
  {
    ignores: [
      '.data/**',
      '.npm-cache/**',
      'test-results/**',
      'playwright-report/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/generated/**',
      '**/next-env.d.ts',
    ],
  },
  ...base,
  ...next.map((config) => ({ ...config, files: ['apps/web/**/*.{ts,tsx,js,mjs}'] })),
  { files: ['apps/web/**/*.{ts,tsx,js,mjs}'], settings: { next: { rootDir: 'apps/web/' } } },
];
