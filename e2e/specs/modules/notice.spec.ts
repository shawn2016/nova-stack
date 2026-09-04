import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTabPage,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import { registerCrudScenarios, registerMessageScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:notice', () => {
  test('通知公告页加载列表', { tag: ['@page:/system/notice', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/notice');
    await expectListPanelTitle(page, '公告管理');
    await expectTableLoaded(page);
  });
  registerCrudScenarios({
    module: 'notice',
    path: '/system/notice',
    create: { button: '新增公告', dialog: /新增公告/ },
    editDialog: /编辑公告/,
  });

  test('消息中心页加载收件箱', { tag: ['@page:/system/message', '@scenario:tabs'] }, async ({ page }) => {
    await openAdminPage(page, '/system/message');
    await expectTabPage(page, '收件箱');
    await expectTableLoaded(page);
  });
  registerMessageScenarios();
});
