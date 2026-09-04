import { expect, test } from '@playwright/test';
import { expectListPanelTitle, openAdminPage } from '../../helpers/admin-page';
import { registerFileScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:upload', () => {
  test('文件管理页加载主内容', { tag: ['@page:/system/file', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/file');
    await expectListPanelTitle(page, '文件管理');
    await expect(page.locator('.file-grid-wrap')).toBeVisible({ timeout: 15_000 });
  });
  registerFileScenarios();
});
