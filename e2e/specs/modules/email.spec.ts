import { test } from '@playwright/test';
import { expectTabPage, expectTableLoaded, openAdminPage } from '../../helpers/admin-page';

test.describe('@module:email', () => {
  test('邮件管理页默认展示通道', async ({ page }) => {
    await openAdminPage(page, '/infra/email');
    await expectTabPage(page, '通道');
    await expectTableLoaded(page);
  });
});
