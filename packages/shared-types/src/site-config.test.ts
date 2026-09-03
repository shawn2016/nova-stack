import { describe, expect, it } from 'vitest';
import type {
  CreateSiteConfigDto,
  SiteConfigByKeyResult,
  SiteConfigListItem,
  UpdateSiteConfigDto,
} from './site-config.js';

describe('site-config types', () => {
  it('SiteConfigListItem 包含配置列表字段', () => {
    const item: SiteConfigListItem = {
      id: '1',
      configKey: 'site.name',
      configName: '站点名称',
      configValue: 'Nova Stack',
      configGroup: 'site',
      remark: null,
      createdAt: '2026-09-03T00:00:00.000Z',
    };

    expect(item.configKey).toBe('site.name');
    expect(item.configGroup).toBe('site');
  });

  it('SiteConfigByKeyResult 包含运行时读取字段', () => {
    const result: SiteConfigByKeyResult = {
      configKey: 'site.logo',
      configName: '站点 Logo',
      configValue: '/uploads/logo.png',
      configGroup: 'site',
    };

    expect(result.configKey).toBe('site.logo');
    expect(result.configValue).toBe('/uploads/logo.png');
  });

  it('CreateSiteConfigDto 与 UpdateSiteConfigDto 字段符合设计', () => {
    const create: CreateSiteConfigDto = {
      configKey: 'site.icp',
      configName: '备案号',
      configValue: '京ICP备00000000号',
      configGroup: 'site',
      remark: '占位',
    };
    const update: UpdateSiteConfigDto = {
      configName: '备案号（新）',
      configValue: '京ICP备11111111号',
    };

    expect(create.configKey).toBe('site.icp');
    expect(update.configName).toBe('备案号（新）');
    expect('configKey' in update).toBe(false);
  });
});
