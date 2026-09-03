# Comet Design Handoff

- Change: site-config
- Phase: design
- Mode: compact
- Context hash: daf0b3ca0915ab3cbc2beb39e32e5e1be043890d0f6a9562c325f7d8a380c7c6

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/site-config/proposal.md

- Source: openspec/changes/site-config/proposal.md
- Lines: 1-33
- SHA256: 83f245dd0c66d6050ad4203c6e27c673b8e0fc6e4c6a723ec90d766266113264

```md
## Why

脚手架基座已有 RBAC、字典与个人中心，但缺少**站点级 KV 配置**（站点名称、Logo URL、备案号等）。这些配置需可在 Admin 维护，并通过读取 API 供前后端消费，且不应硬编码在环境变量或代码中。这是 `scaffold-system-base` 批次第 3 项。

## What Changes

- **Server — 配置实体与 CRUD**：`sys_config` 表，Admin 鉴权下的配置项增删改查
- **Server — 按 key 读取**：`GET /config/by-key/:key` 供已登录 Admin 或运行时读取
- **shared-types**：配置 DTO
- **Admin — 站点配置页**：KV 列表 + 编辑对话框
- **Seed**：权限、菜单、示例配置项

## Capabilities

### New Capabilities

- `site-config-api`: 站点配置 CRUD 与按 key 读取
- `site-config-admin-ui`: Admin 站点配置管理页

### Modified Capabilities

- （无）

## Impact

- **主要影响**：`server/src/modules/config/`、`admin/src/views/system/site-config/`
- **不影响**：uni-app、审计日志（后续 change）

## Non-Goals

- 登录/操作审计（`audit-logs` change）
- uni-app 消费配置（后续可在 Member 端单独暴露）
- 配置版本历史、加密 secret 管理、Redis 缓存

```

## openspec/changes/site-config/design.md

- Source: openspec/changes/site-config/design.md
- Lines: 1-65
- SHA256: a7bd241ac54a17fc5c9946c72754be4548ebe12c1234baac0e77fe22091d9ed5

```md
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

```

## openspec/changes/site-config/tasks.md

- Source: openspec/changes/site-config/tasks.md
- Lines: 1-23
- SHA256: 4076799d60ce879f138683d21f2861b4cffb72f4749a37b70f75da8c5ae5978e

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 `SysConfigEntity` + 导出 — 验证：TypeORM 建表
- [ ] 1.2 shared-types 配置 DTO — 验证：编译通过

## 2. Server 配置 API

- [ ] 2.1 SiteConfigModule CRUD + by-key — 验证：e2e CRUD 与读取
- [ ] 2.2 重复 key、Member 403 — 验证：e2e 边界

## 3. Seed

- [ ] 3.1 permissions + 菜单 + 示例配置 — 验证：seed 测试

## 4. Admin 站点配置 UI

- [ ] 4.1 api + 管理页 — 验证：admin build
- [ ] 4.2 v-permission — 验证：按钮受控

## 5. 集成验证

- [ ] 5.1 server test + e2e、admin build — 验证：全绿
- [ ] 5.2 openspec validate site-config --strict — 验证：通过

```

## openspec/changes/site-config/specs/site-config-admin-ui/spec.md

- Source: openspec/changes/site-config/specs/site-config-admin-ui/spec.md
- Lines: 1-16
- SHA256: 107d684cfcc26b7ac6109d2f1cf2679ae4e3a6c47512d76fe6473ce456ec55db

```md
## ADDED Requirements

### Requirement: 站点配置管理页
Admin MUST 提供站点配置页，展示 KV 列表并支持创建、编辑、删除。

#### Scenario: 配置列表
- **WHEN** 有 `system:config:list` 权限访问页面
- **THEN** 展示分页配置列表（key、名称、值、分组）

#### Scenario: 编辑配置值
- **WHEN** 有 `system:config:update` 并保存
- **THEN** 调用 PUT API 成功并刷新列表

#### Scenario: 权限控制
- **WHEN** 无 create 权限
- **THEN** 不显示新增按钮

```

## openspec/changes/site-config/specs/site-config-api/spec.md

- Source: openspec/changes/site-config/specs/site-config-api/spec.md
- Lines: 1-27
- SHA256: 072f71cc46fa15fa7bd124794ec9309a981bc2b477258ffa8b5e9979fb3a1794

```md
## ADDED Requirements

### Requirement: 站点配置 CRUD
系统 MUST 提供配置项 list/create/update/delete，需 Admin JWT 与 `@RequirePermission`。

#### Scenario: 创建配置
- **WHEN** 有 `system:config:create` 权限 POST 合法 key/name/value
- **THEN** 返回 201 及新配置 id

#### Scenario: config_key 重复
- **WHEN** POST 的 config_key 已存在
- **THEN** 返回 400

### Requirement: 按 key 读取配置
系统 MUST 提供 `GET /config/by-key/:key`，返回单条配置的 key、name、value、group。

#### Scenario: 读取已知 key
- **WHEN** 已登录 Admin 请求 `GET /config/by-key/site.name`
- **THEN** 返回 200 及配置值

#### Scenario: 未知 key
- **WHEN** key 不存在
- **THEN** 返回 404

#### Scenario: Member Token
- **WHEN** Member token 请求 by-key
- **THEN** 返回 403

```
