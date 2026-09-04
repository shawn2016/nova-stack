import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import { registerCrudScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:dept', () => {
  test('部门管理页加载列表', { tag: ['@page:/system/dept', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/dept');
    await expectListPanelTitle(page, '部门管理');
    await expectTableLoaded(page);
  });
  registerCrudScenarios({
    module: 'dept',
    path: '/system/dept',
    create: { button: '新增部门', dialog: /新增部门/ },
    editDialog: /编辑部门/,
  });
});
