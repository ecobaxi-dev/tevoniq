import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node tests/fixtures/services-api.mjs',
      url: 'http://127.0.0.1:4100/health',
      reuseExistingServer: false,
    },
    {
      command: 'node tests/fixtures/start-web.mjs',
      url: 'http://127.0.0.1:3100/health',
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        PORT: '3100',
        ENABLE_DESIGN_SYSTEM: 'true',
        API_URL: 'http://127.0.0.1:4100/api/v1',
        SITE_URL: 'http://127.0.0.1:3100',
      },
    },
  ],
});
