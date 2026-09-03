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
