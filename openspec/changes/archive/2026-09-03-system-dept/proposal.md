## Why

系统管理已有用户/角色/菜单/字典/地区/通知等能力，但缺少**部门组织架构**主数据。后续数据权限（按部门范围）、用户归属、消息按部门推送均依赖统一的部门树。这是 System/Infra 扩展批次**第 3 项**（用户已确认 multi-change 拆分），采用与 `system-region` 相同的 Comet 全流程交付。

## What Changes

- **Server — 部门树 CRUD**：`sys_dept` 实体；多级组织树；节点启用/停用（功能开关）
- **Server — 模块功能开关**：`sys_config` 中 `dept` 分组配置（模块总开关、用户绑定开关）；专用 settings API
- **Server — 用户归属**：`sys_user.dept_id` 可选外键；用户 CRUD 支持部门字段
- **shared-types**：Dept DTO、树节点、Settings 类型；用户 DTO 增加 deptId/deptName
- **Admin — 部门管理页**：树形维护 + 状态开关 + 模块功能开关面板
- **Admin — 用户管理**：表单/列表展示与编辑所属部门
- **RBAC 扩展**：dept 权限码与菜单 seed

## Capabilities

### New Capabilities

- `dept-api`: 部门树 CRUD、状态开关、模块 settings、用户 dept 字段
- `dept-admin-ui`: Admin 部门管理页 + 用户管理部门字段

### Modified Capabilities

- （无）— 用户 API 行为扩展由 dept-api delta 覆盖，不修改既有 rbac spec 文件

## Impact

- **主要影响**：`server/src/modules/dept/`（新建）、`server/src/modules/rbac/user/`、`server/src/database/entities/`、`server/src/database/seeds/`、`admin/src/views/system/dept/`、`admin/src/views/system/user/`、`packages/shared-types/`
- **不影响**：uni-app、Member 端、数据权限规则引擎（后续 system-data-scope change）

## Non-Goals

- 岗位/职级、汇报线、部门负责人审批流
- 按部门的数据权限过滤（后续 change）
- 部门与地区/角色的复杂交叉矩阵
- 部门合并/拆分历史审计
