import { expect, test, type Page } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import {
  clickTableAction,
  registerSearchScenario,
  scenarioCreateDialog,
} from '../../helpers/admin-scenarios';

const module = 'ip-blacklist';
const path = '/system/ip-blacklist';
/** TEST-NET-3，专用于 E2E 解除确认场景 */
const e2eTestIp = '203.0.113.77';
/** 与 dev 约定一致：server :3001；127.0.0.1 避免 localhost → ::1 连接失败 */
const apiBase = process.env.VERIFY_API_URL ?? 'http://127.0.0.1:3001/api';

/** 确保列表中存在指定 IP（优先 API 预置，避免空表 skip） */
async function ensureBlacklistRow(page: Page, ip: string) {
  const row = page.locator('.el-table__row').filter({ hasText: ip });
  if ((await row.count()) > 0) {
    return;
  }

  const token = await page.evaluate(() => localStorage.getItem('nova_admin_token'));
  expect(token, '需要已登录的 admin token').toBeTruthy();

  const createRes = await page.request.post(`${apiBase}/security/ip-blacklist`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { ip, remark: 'e2e delete scenario' },
  });

  if (createRes.status() === 409) {
    // 已存在则刷新列表即可
  } else {
    expect(createRes.ok(), `预置黑名单失败: ${createRes.status()} ${await createRes.text()}`).toBeTruthy();
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app-sidebar')).toBeVisible({ timeout: 30_000 });
  await expectTableLoaded(page);
  await expect(row).toBeVisible({ timeout: 15_000 });
}

test.describe('@module:ip-blacklist', () => {
  test('IP黑名单页加载列表', { tag: ['@module:ip-blacklist', `@page:${path}`, '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, path);
    await expectListPanelTitle(page, 'IP 黑名单');
    await expectTableLoaded(page);
  });

  registerSearchScenario(module, path, '203');

  test(`${path} 新增弹窗`, { tag: ['@module:ip-blacklist', `@page:${path}`, '@scenario:create'] }, async ({ page }) => {
    await openAdminPage(page, path);
    await scenarioCreateDialog(page, '添加封禁', /添加 IP 黑名单/);
  });

  test(`${path} 解除确认`, { tag: ['@module:ip-blacklist', `@page:${path}`, '@scenario:delete'] }, async ({ page }) => {
    await openAdminPage(page, path);
    await ensureBlacklistRow(page, e2eTestIp);
    await clickTableAction(page, '解除');
    const box = page.locator('.el-message-box');
    await expect(box).toBeVisible({ timeout: 10_000 });
    await box.getByRole('button', { name: /^取消$|Cancel/i }).click();
  });
});
