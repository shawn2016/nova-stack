import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';

test.describe('@module:region', () => {
  test('地区管理页加载列表', async ({ page }) => {
    await openAdminPage(page, '/system/region');
    await expectListPanelTitle(page, '地区管理');
    await expectTableLoaded(page);
  });
});
