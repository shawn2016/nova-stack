import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import { registerCrudScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:site-config', () => {
  test('站点配置页加载列表', { tag: ['@page:/system/site-config', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/site-config');
    await expectListPanelTitle(page, '站点配置');
    await expectTableLoaded(page);
  });
  registerCrudScenarios({
    module: 'site-config',
    path: '/system/site-config',
    create: { button: '新增配置', dialog: /新增站点配置/ },
    editDialog: /编辑站点配置/,
  });
});
