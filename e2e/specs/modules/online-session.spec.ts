import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';

test.describe('@module:online-session', () => {
  test('在线会话页加载列表', async ({ page }) => {
    await openAdminPage(page, '/system/online-session');
    await expectListPanelTitle(page, '在线会话');
    await expectTableLoaded(page);
  });
});
