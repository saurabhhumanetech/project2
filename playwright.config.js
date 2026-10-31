import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:5173', headless: true, launchOptions: { channel: 'chrome' } },
  webServer: { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
  reporter: 'list',
});
