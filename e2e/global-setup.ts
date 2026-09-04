import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type FullConfig } from '@playwright/test';
import { loginAsAdmin } from './helpers/admin-login';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const adminAuthFile = join(rootDir, '.verify/admin-auth.json');

/** 全局登录一次并写入 storageState，供 smoke 用例复用会话。 */
export default async function globalSetup(config: FullConfig) {
  mkdirSync(dirname(adminAuthFile), { recursive: true });
  const baseURL = process.env.VERIFY_ADMIN_URL ?? 'http://localhost:5173';
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await loginAsAdmin(page);
  await context.storageState({ path: adminAuthFile });
  await browser.close();
}
