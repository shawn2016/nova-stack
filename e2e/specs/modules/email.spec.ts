import { test } from '@playwright/test';
import { expectTabPage, expectTableLoaded, openAdminPage } from '../../helpers/admin-page';
import { registerChannelTabScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:email', () => {
  test('邮件管理页默认展示通道', { tag: ['@page:/infra/email', '@scenario:tabs'] }, async ({ page }) => {
    await openAdminPage(page, '/infra/email');
    await expectTabPage(page, '通道');
    await expectTableLoaded(page);
  });
  registerChannelTabScenarios('email', '/infra/email', {
    create: '新增通道',
    dialog: /新增通道/,
    edit: /编辑通道/,
  });
});
