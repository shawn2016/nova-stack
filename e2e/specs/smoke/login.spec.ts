import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/admin-login';

test.describe('@smoke @module:auth', () => {
  test('admin 登录后进入后台', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('#app-sidebar').getByText('系统管理')).toBeVisible({
      timeout: 15_000,
    });
  });
});
