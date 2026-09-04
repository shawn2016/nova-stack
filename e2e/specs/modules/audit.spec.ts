import { test } from '@playwright/test';
import { expectTabPage, expectTableLoaded, openAdminPage } from '../../helpers/admin-page';

test.describe('@module:audit', () => {
  test('审计日志页默认展示登录日志', async ({ page }) => {
    await openAdminPage(page, '/system/audit-logs');
    await expectTabPage(page, '登录日志');
    await expectTableLoaded(page);
  });
});
