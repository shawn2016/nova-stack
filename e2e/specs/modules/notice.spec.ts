import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTabPage,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';

test.describe('@module:notice', () => {
  test('通知公告页加载列表', async ({ page }) => {
    await openAdminPage(page, '/system/notice');
    await expectListPanelTitle(page, '公告管理');
    await expectTableLoaded(page);
  });

  test('消息中心页加载收件箱', async ({ page }) => {
    await openAdminPage(page, '/system/message');
    await expectTabPage(page, '收件箱');
    await expectTableLoaded(page);
  });
});
