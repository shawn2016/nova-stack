/** 站点配置列表项 */
export interface SiteConfigListItem {
  id: string;
  configKey: string;
  configName: string;
  configValue: string;
  configGroup?: string | null;
  remark?: string | null;
  createdAt: string;
}

/** 按 key 读取站点配置结果 */
export interface SiteConfigByKeyResult {
  configKey: string;
  configName: string;
  configValue: string;
  configGroup?: string | null;
}

/** 创建站点配置请求 */
export interface CreateSiteConfigDto {
  configKey: string;
  configName: string;
  configValue: string;
  configGroup?: string;
  remark?: string;
}

/** 更新站点配置请求（configKey 不可修改） */
export interface UpdateSiteConfigDto {
  configName?: string;
  configValue?: string;
  configGroup?: string;
  remark?: string;
}
