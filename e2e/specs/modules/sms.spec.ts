import { test } from '@playwright/test';
import { expectTabPage, expectTableLoaded, openAdminPage } from '../../helpers/admin-page';
import { registerChannelTabScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:sms', () => {
  test('短信管理页默认展示通道', { tag: ['@page:/infra/sms', '@scenario:tabs'] }, async ({ page }) => {
    await openAdminPage(page, '/infra/sms');
    await expectTabPage(page, '通道');
    await expectTableLoaded(page);
  });
  registerChannelTabScenarios('sms', '/infra/sms', {
    create: '新增通道',
    dialog: /新增通道/,
    edit: /编辑通道/,
  });
});
