import { test } from '@playwright/test';
import { expectTabPage, expectTableLoaded, openAdminPage } from '../../helpers/admin-page';
import { registerAuditListScenario } from '../../helpers/admin-scenarios';

test.describe('@module:audit', () => {
  test('审计日志页默认展示登录日志', { tag: ['@page:/system/audit-logs', '@scenario:tabs'] }, async ({ page }) => {
    await openAdminPage(page, '/system/audit-logs');
    await expectTabPage(page, '登录日志');
    await expectTableLoaded(page);
  });
  registerAuditListScenario();
});
