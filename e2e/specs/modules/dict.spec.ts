import { expect, test } from '@playwright/test';
import { openAdminPage } from '../../helpers/admin-page';
import { registerDictScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:dict', () => {
  test('字典管理页加载类型与数据面板', { tag: ['@page:/system/dict', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/dict');
    await expect(page.locator('.art-list-panel__title').filter({ hasText: '字典类型' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('.art-list-panel__title').filter({ hasText: '字典数据' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('.el-table').first()).toBeVisible({ timeout: 15_000 });
  });
  registerDictScenarios();
});
