import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import { registerCrudScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:region', () => {
  test('地区管理页加载列表', { tag: ['@page:/system/region', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/region');
    await expectListPanelTitle(page, '地区管理');
    await expectTableLoaded(page);
  });
  registerCrudScenarios({
    module: 'region',
    path: '/system/region',
    create: { button: '新增地区', dialog: /新增地区/ },
    editDialog: /编辑地区/,
  });
});
