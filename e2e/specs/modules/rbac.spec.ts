import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import { registerCrudScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:rbac', () => {
  test('用户管理页加载列表', { tag: ['@page:/system/user', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/user');
    await expectListPanelTitle(page, '用户管理');
    await expectTableLoaded(page);
  });
  registerCrudScenarios({
    module: 'rbac',
    path: '/system/user',
    searchKeyword: 'admin',
    create: { button: '新增用户', dialog: /添加用户/ },
    editDialog: /编辑用户/,
  });

  test('角色管理页加载列表', { tag: ['@page:/system/role', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/role');
    await expectListPanelTitle(page, '角色管理');
    await expectTableLoaded(page);
  });
  registerCrudScenarios({
    module: 'rbac',
    path: '/system/role',
    create: { button: '新增角色', dialog: /新增角色/ },
    editDialog: /编辑角色/,
  });

  test('菜单管理页加载列表', { tag: ['@page:/system/menu', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/menu');
    await expectListPanelTitle(page, '菜单管理');
    await expectTableLoaded(page);
  });
  registerCrudScenarios({
    module: 'rbac',
    path: '/system/menu',
    create: { button: '添加菜单', dialog: /新增菜单/ },
    editDialog: /编辑菜单/,
  });
});
