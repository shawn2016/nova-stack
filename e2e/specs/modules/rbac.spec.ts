import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';

test.describe('@module:rbac', () => {
  test('用户管理页加载列表', async ({ page }) => {
    await openAdminPage(page, '/system/user');
    await expectListPanelTitle(page, '用户管理');
    await expectTableLoaded(page);
  });

  test('角色管理页加载列表', async ({ page }) => {
    await openAdminPage(page, '/system/role');
    await expectListPanelTitle(page, '角色管理');
    await expectTableLoaded(page);
  });

  test('菜单管理页加载列表', async ({ page }) => {
    await openAdminPage(page, '/system/menu');
    await expectListPanelTitle(page, '菜单管理');
    await expectTableLoaded(page);
  });
});
