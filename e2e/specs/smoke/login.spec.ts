import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/admin-login';

test.describe('@smoke @module:auth', () => {
  test('admin 登录后进入后台', { tag: ['@page:/auth/login', '@scenario:auth'] }, async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('#app-sidebar').getByText('系统管理')).toBeVisible({
      timeout: 15_000,
    });
  });
});
