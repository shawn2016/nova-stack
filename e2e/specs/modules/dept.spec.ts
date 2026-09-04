import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';

test.describe('@module:dept', () => {
  test('部门管理页加载列表', async ({ page }) => {
    await openAdminPage(page, '/system/dept');
    await expectListPanelTitle(page, '部门管理');
    await expectTableLoaded(page);
  });
});
