import { defineConfig, devices } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const adminBaseURL = process.env.VERIFY_ADMIN_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './specs',
  timeout: 60_000,
  retries: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: join(rootDir, '.verify/playwright-report.json') }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: adminBaseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
