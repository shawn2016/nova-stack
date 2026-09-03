## Context

批次第 3 项。字典模块（`system-dict`）已提供枚举类数据管理；站点配置面向**少量 KV 键值**（站点名、Logo、ICP 等），结构更简单，无需 type/data 双层模型。

## Goals / Non-Goals

**Goals:**
- `sys_config` 单表 KV CRUD
- 按 `configKey` 读取单条配置
- Admin 管理页 + RBAC 权限 seed

**Non-Goals:**
- uni-app、审计、配置加密/版本

## Decisions

### 1. 数据模型 `sys_config`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | |
| config_key | varchar(64) UNIQUE | 如 `site.name` |
| config_name | varchar(64) | 显示名 |
| config_value | text | 值（字符串，可存 URL/JSON 文本） |
| config_group | varchar(32)? | 分组：`basic`、`legal` 等 |
| remark | varchar(255)? | |
| created_at / updated_at | datetime | |

### 2. API

```
GET    /config/items?page&pageSize&keyword&group  — system:config:list
POST   /config/items                              — system:config:create
PUT    /config/items/:id                          — system:config:update
DELETE /config/items/:id                          — system:config:delete
GET    /config/by-key/:key                        — Admin JWT（任意已登录 Admin）
```

- `config_key` 创建后不可改（update DTO 不含 key）
- 重复 key → 400
- by-key 未知 key → 404

**模块路径**：`server/src/modules/site-config/` 或 `config/`（避免与 Nest ConfigModule 混淆，用 `site-config`）

### 3. Admin UI

- 路由 `/system/site-config`，组件 `views/system/site-config/index`
- 表格：key、名称、值（可 truncate）、分组、操作
- 对话框编辑 name/value/group/remark

### 4. Seed

- 权限 4 个 + 菜单「站点配置」
- 示例：`site.name`、`site.logo`、`site.icp`

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| config_value 存敏感信息 | MVP 明文；文档标注勿存密钥 |
| 与 @nestjs/config 命名混淆 | 模块名 `site-config` |

## Migration

- 新增单表，seed 幂等 upsert
