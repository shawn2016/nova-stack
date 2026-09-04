import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';

test.describe('@module:site-config', () => {
  test('站点配置页加载列表', async ({ page }) => {
    await openAdminPage(page, '/system/site-config');
    await expectListPanelTitle(page, '站点配置');
    await expectTableLoaded(page);
  });
});
