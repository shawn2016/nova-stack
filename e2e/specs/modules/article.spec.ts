import { test } from '@playwright/test';
import {
  expectListPanelTitle,
  expectTableLoaded,
  openAdminPage,
} from '../../helpers/admin-page';
import { registerArticleScenarios } from '../../helpers/admin-scenarios';

test.describe('@module:article', () => {
  test('文章管理页加载列表', { tag: ['@page:/content/articles', '@scenario:list'] }, async ({ page }) => {
    await openAdminPage(page, '/content/articles');
    await expectListPanelTitle(page, '文章管理');
    await expectTableLoaded(page);
  });
  registerArticleScenarios();
});
