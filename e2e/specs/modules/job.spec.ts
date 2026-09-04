import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import { registerJobScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:job', () => {
  test('定时任务页加载列表', { tag: ['@page:/infra/job', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/infra/job');
    await expectListPanelTitle(page, '定时任务');
    await expectTableLoaded(page);
  });
  registerJobScenarios('job', '/infra/job');
});
