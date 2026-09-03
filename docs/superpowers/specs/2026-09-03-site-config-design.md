---
comet_change: site-config
role: technical-design
canonical_spec: openspec
---

# site-config 深度技术设计

## 1. 架构总览

```
Admin 站点配置页                 Server SiteConfigModule
──────────────                 ─────────────────────
site-config/index.vue ─CRUD─► ConfigItemController / Service
runtime read ──GET──► GET /config/by-key/:key
```

**实施顺序**：实体/shared-types → API + e2e → seed → Admin UI → 集成验证

## 2. 数据模型 `sys_config`

| 字段 | 列名 | 类型 |
|------|------|------|
| id | id | bigint PK |
| configKey | config_key | varchar(64) UNIQUE |
| configName | config_name | varchar(64) |
| configValue | config_value | text |
| configGroup | config_group | varchar(32) nullable |
| remark | remark | varchar(255) nullable |
| createdAt / updatedAt | created_at / updated_at | datetime |

**规则**：创建后 `configKey` 不可修改。

## 3. shared-types

```typescript
export interface SiteConfigListItem {
  id: string;
  configKey: string;
  configName: string;
  configValue: string;
  configGroup?: string | null;
  remark?: string | null;
  createdAt: string;
}

export interface SiteConfigByKeyResult {
  configKey: string;
  configName: string;
  configValue: string;
  configGroup?: string | null;
}

export interface CreateSiteConfigDto {
  configKey: string;
  configName: string;
  configValue: string;
  configGroup?: string;
  remark?: string;
}

export interface UpdateSiteConfigDto {
  configName?: string;
  configValue?: string;
  configGroup?: string;
  remark?: string;
}
```

## 4. Server API

**模块**：`server/src/modules/site-config/`

| 方法 | 路径 | Permission |
|------|------|------------|
| GET | /config/items | system:config:list |
| POST | /config/items | system:config:create |
| PUT | /config/items/:id | system:config:update |
| DELETE | /config/items/:id | system:config:delete |
| GET | /config/by-key/:key | AdminAuthGuard only |

- 列表：分页 + keyword（key/name）+ group 筛选
- AdminAuthGuard 扩展 `/config` 前缀

## 5. Seed

**Permissions**：`system:config:list|create|update|delete`

**Menu**（系统管理 sort 5）：
```
站点配置 /system/site-config views/system/site-config/index
```

**示例配置**：
- `site.name` — Nova Stack
- `site.logo` — /uploads/... 或 URL
- `site.icp` — 备案号占位

## 6. Admin UI

- `admin/src/api/site-config.ts`
- `admin/src/views/system/site-config/index.vue` + dialog
- 对齐 dict/role 的 useTable + v-permission

## 7. 测试

- e2e：CRUD、by-key、duplicate key 400、Member 403
- seed.spec 增量
