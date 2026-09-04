import { defineConfig, devices } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(e2eDir, '..');
const adminAuthFile = join(rootDir, '.verify/admin-auth.json');
const adminBaseURL = process.env.VERIFY_ADMIN_URL ?? 'http://localhost:5173';
const workerCount = process.env.VERIFY_PW_WORKERS ? Number(process.env.VERIFY_PW_WORKERS) : 2;

export default defineConfig({
  testDir: './specs',
  timeout: 90_000,
  retries: 0,
  workers: workerCount,
  fullyParallel: workerCount > 1,
  globalSetup: join(e2eDir, 'global-setup.ts'),
  reporter: [
    ['list'],
    ['json', { outputFile: join(rootDir, '.verify/playwright-report.json') }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: adminBaseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: adminAuthFile,
      },
      testIgnore: ['**/smoke/login.spec.ts'],
    },
    {
      name: 'chromium-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: ['**/smoke/login.spec.ts'],
    },
  ],
});
