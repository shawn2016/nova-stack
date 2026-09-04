import { expect, type Page } from '@playwright/test';
import { loginAsAdmin } from './admin-login';

/** 登录后打开 Admin hash 路由页 */
export async function openAdminPage(page: Page, hashPath: string): Promise<void> {
  await loginAsAdmin(page);
  const path = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
  await page.goto(`/#${path}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app-sidebar')).toBeVisible({ timeout: 15_000 });
}

/** 断言 ArtListPanel 标题 */
export async function expectListPanelTitle(page: Page, title: string): Promise<void> {
  await expect(page.locator('.art-list-panel__title').filter({ hasText: title }).first()).toBeVisible({
    timeout: 15_000,
  });
}

/** 断言 Tab 页（无独立 title 时使用） */
export async function expectTabPage(page: Page, tabLabel: string): Promise<void> {
  const tab = page.getByRole('tab', { name: tabLabel });
  await expect(tab).toBeVisible({ timeout: 15_000 });
  await expect(tab).toHaveClass(/is-active/);
}

/** 断言表格已渲染 */
export async function expectTableLoaded(page: Page): Promise<void> {
  await expect(page.locator('.el-table').first()).toBeVisible({ timeout: 15_000 });
}
