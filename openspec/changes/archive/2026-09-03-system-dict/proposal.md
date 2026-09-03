## Why

脚手架后台基座已具备 RBAC、个人中心与文件上传，但缺少**系统字典**能力。业务表单（用户状态、文章状态等）无法复用统一的下拉数据源，后续站点配置与审计模块也依赖可维护的枚举/标签映射。这是 `scaffold-system-base` 批次第 2 项，需在站点配置与审计前补齐。

## What Changes

- **Server — 字典类型与字典项**：新增 `sys_dict_type`、`sys_dict_data` 实体与 CRUD API；按类型编码查询字典项（供下拉复用）
- **Server — RBAC 扩展**：字典管理相关 permission 码与 seed 菜单
- **shared-types**：字典 DTO 与列表项类型
- **Admin — 字典管理页**：字典类型 CRUD + 字典项 CRUD（主从/分栏），对接 API
- **Admin — 下拉复用**：提供 `useDict(typeCode)` 或等价 composable，从 API 加载选项

## Capabilities

### New Capabilities

- `dict-api`: 字典类型与字典项 CRUD、按类型编码查询
- `dict-admin-ui`: Admin 字典管理页面与下拉复用 composable

### Modified Capabilities

- （无）— 不修改现有 auth/rbac 行为，仅新增权限 seed

## Impact

- **主要影响**：`server/src/modules/dict/`（新建）、`server/src/database/entities/`、`admin/src/views/system/dict/`、`packages/shared-types/`
- **seed**：新增字典 permissions、系统管理下「字典管理」菜单、示例字典类型（可选）
- **不影响**：uni-app、Member 端、站点配置、审计日志（后续 change）

## Non-Goals

- 站点系统配置 KV（`site-config` change）
- 登录/操作审计（`audit-logs` change）
- 字典缓存到 Redis、国际化多语言字典、树形字典
- Member 端字典 API
