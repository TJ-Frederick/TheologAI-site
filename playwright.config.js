import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 45_000,
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  use: {
    baseURL: 'http://127.0.0.1:8788',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --ip 127.0.0.1 --port 8788',
    url: 'http://127.0.0.1:8788',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      WRANGLER_SEND_METRICS: 'false',
      WRANGLER_LOG_PATH: `${process.cwd()}/.wrangler/logs`,
      WRANGLER_REGISTRY_PATH: `${process.cwd()}/.wrangler/registry`,
      CHOKIDAR_USEPOLLING: 'true',
    },
  },
});
