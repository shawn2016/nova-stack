## Why

系统管理模块已有用户/角色/菜单/字典等基础能力，但缺少**省市区行政区划**主数据。后续部门组织、地址表单、数据权限（按地区范围）均依赖统一的地区树。这是 System/Infra 扩展批次中**第 1 项**（用户已确认优先），采用多 change 分批交付。

## What Changes

- **Server — 地区树 CRUD**：新增 `sys_region` 实体与 REST API；支持省/市/区三级树形维护
- **Server — 内置 seed**：`pnpm seed` 导入国标省市区数据（可增量 upsert），并支持后台增删改
- **shared-types**：地区节点 DTO、树节点、列表项类型
- **Admin — 地区管理页**：树形表格维护（展开/折叠、增删改），对接 API
- **RBAC 扩展**：地区管理 permission 码与「系统管理」下菜单 seed

## Capabilities

### New Capabilities

- `region-api`: 地区树 CRUD、树形查询、按层级/关键词筛选
- `region-admin-ui`: Admin 地区管理页面

### Modified Capabilities

- （无）— 不修改现有 RBAC 行为，仅新增 permissions/menus seed

## Impact

- **主要影响**：`server/src/modules/region/`（新建）、`server/src/database/entities/`、`server/src/database/seeds/`（含地区 JSON）、`admin/src/views/system/region/`、`packages/shared-types/`
- **不影响**：uni-app、Member 端、通知/部门/数据权限/infra 模块（后续独立 change）

## Non-Goals

- 街道/乡镇四级及以下
- 地区与业务表（用户地址等）的关联绑定 — 后续 change
- 国际化多语言地区名、GeoJSON 边界
- 在线同步民政部最新区划 API
