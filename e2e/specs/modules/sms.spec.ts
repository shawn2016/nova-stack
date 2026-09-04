import { test } from '@playwright/test';
import { expectTabPage, expectTableLoaded, openAdminPage } from '../../helpers/admin-page';

test.describe('@module:sms', () => {
  test('短信管理页默认展示通道', async ({ page }) => {
    await openAdminPage(page, '/infra/sms');
    await expectTabPage(page, '通道');
    await expectTableLoaded(page);
  });
});
