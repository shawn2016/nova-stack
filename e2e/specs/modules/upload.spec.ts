import { expect, test } from '@playwright/test';
import { expectListPanelTitle, openAdminPage } from '../../helpers/admin-page';

test.describe('@module:upload', () => {
  test('文件管理页加载主内容', async ({ page }) => {
    await openAdminPage(page, '/system/file');
    await expectListPanelTitle(page, '文件管理');
    await expect(page.getByRole('button', { name: '上传图片' })).toBeVisible({ timeout: 15_000 });
  });
});
