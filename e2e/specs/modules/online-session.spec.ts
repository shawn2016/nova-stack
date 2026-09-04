import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import { registerSearchScenario } from '../../helpers/admin-scenarios';

test.describe('@module:online-session', () => {
  test('在线会话页加载列表', { tag: ['@page:/system/online-session', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/system/online-session');
    await expectListPanelTitle(page, '在线会话');
    await expectTableLoaded(page);
  });
  registerSearchScenario('online-session', '/system/online-session', 'admin');
});
