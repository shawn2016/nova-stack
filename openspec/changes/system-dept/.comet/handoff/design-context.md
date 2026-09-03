# Comet Design Handoff

- Change: system-dept
- Phase: design
- Mode: compact
- Context hash: 12c9e630ee4d1d6ab5696e0d1535d949081ab11a364b7114f646dcaed6a6d09a

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/system-dept/proposal.md

- Source: openspec/changes/system-dept/proposal.md
- Lines: 1-36
- SHA256: d76e8db817330d3b9b0860734958ba496ae9025beeb1dce755547ce837ab22c1

```md
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

```

## openspec/changes/system-dept/design.md

- Source: openspec/changes/system-dept/design.md
- Lines: 1-98
- SHA256: 38aedfa6f918e490798db7ee1b5868f1ba5d0f5873b950a5300feeab7f541573

[TRUNCATED]

```md
## Context

`system-region`、`system-notice` 已归档；项目具备树形 CRUD（region）、RBAC 用户管理、站点配置（sys_config）模式。见 proposal.md — Why。

## Goals / Non-Goals

**Goals:**
- 多级部门树：CRUD、排序、启用/停用
- 模块功能开关：总开关 + 用户部门绑定开关（sys_config dept 分组）
- 用户可选归属部门；列表/详情展示部门名
- RBAC 权限与菜单 seed

**Non-Goals:**
- 数据权限按部门过滤
- 岗位编制、成本中心
- Member 端部门选择

## Decisions

### 1. 数据模型

**sys_dept**

| 字段 | 说明 |
|------|------|
| id | bigint → API string |
| parent_id | 上级部门，根为 null |
| name | 部门名称 |
| sort | 排序 |
| leader | 负责人姓名（可选） |
| phone | 联系电话（可选） |
| status | `0` 停用 / `1` 启用（节点功能开关） |
| created_at / updated_at | |

**sys_user** 增量：`dept_id` bigint nullable FK → sys_dept.id

**sys_config**（dept 分组 seed）

| config_key | 说明 | 默认 |
|------------|------|------|
| dept.module.enabled | 部门模块总开关 | true |
| dept.user_binding.enabled | 允许用户绑定部门 | true |

### 2. API 设计

**部门**（`/depts`）

```
GET    /depts/tree           — 启用节点树（下拉/选择器）
GET    /depts/tree/all       — 含停用节点的完整树（管理页）
GET    /depts                — 分页平铺列表（keyword, status, parentId）
POST   /depts
PUT    /depts/:id
DELETE /depts/:id            — 有子部门或有关联用户时禁止
PUT    /depts/:id/status     — 切换 status 0/1
GET    /depts/settings       — 模块功能开关
PUT    /depts/settings       — 更新功能开关
```

**用户**（扩展现有 `/users`）

- create/update 接受可选 `deptId`
- list/detail 返回 `deptId`、`deptName`（JOIN 或二次查询）

**权限码**：
- `system:dept:list|create|update|delete|settings`

**模块总开关**：当 `dept.module.enabled=false` 时，除 settings 读/写外 dept CRUD 返回 403；Admin 菜单可隐藏（前端读 settings）。

### 3. Admin UI

- `/system/dept` — 树形表格 + 新增/编辑对话框 + 行内状态开关 + 顶部「功能开关」抽屉/卡片
- 用户管理 — 部门树选择器；列表增加部门列

### 4. Seed

- permissions + 菜单「部门管理」（sort 8，后续菜单顺延）
- 示例部门：总公司 → 研发部、运营部
- admin 用户归属总公司
- dept settings 默认值

```

Full source: openspec/changes/system-dept/design.md

## openspec/changes/system-dept/tasks.md

- Source: openspec/changes/system-dept/tasks.md
- Lines: 1-28
- SHA256: 1d0a1f5f2dda07c0ac53e4d400e719265adb4805dcc62a42230bfab1ccbc1674

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 `sys_dept` 实体 + `sys_user.dept_id` + 注册 — 验证：建表成功
- [ ] 1.2 shared-types `dept.ts` + 用户 DTO 扩展 — 验证：编译 + test

## 2. Server 部门 API

- [ ] 2.1 DeptModule：tree/tree-all/CRUD/status/settings — 验证：e2e
- [ ] 2.2 删除约束（子部门/关联用户）与模块总开关 — 验证：e2e 边界

## 3. Server 用户部门扩展

- [ ] 3.1 User create/update/list/detail 支持 deptId/deptName — 验证：e2e

## 4. Seed 与 RBAC

- [ ] 4.1 permissions + 菜单 + 示例部门 + settings + admin 归属 — 验证：seed.spec

## 5. Admin UI

- [ ] 5.1 `admin/src/api/dept.ts` — 验证：类型编译
- [ ] 5.2 部门管理页（树 + 状态开关 + 功能开关） — 验证：dev smoke
- [ ] 5.3 用户管理部门字段 — 验证：选择与展示

## 6. 集成验证

- [ ] 6.1 server test + e2e、admin build — 验证：全绿
- [ ] 6.2 openspec validate system-dept --strict — 验证：通过

```

## openspec/changes/system-dept/specs/dept-admin-ui/spec.md

- Source: openspec/changes/system-dept/specs/dept-admin-ui/spec.md
- Lines: 1-30
- SHA256: 4725ed75cebf927d4b505aaba33c6cc90b52bdf0f8aa7c5e4f53056d7ae2554a

```md
## ADDED Requirements

### Requirement: 部门管理页面
Admin MUST 提供 `/system/dept` 页面：树形表格展示部门，支持增删改、展开/收起。

#### Scenario: 加载部门树
- **WHEN** 有 `system:dept:list` 的用户打开页面
- **THEN** 展示完整部门树，含状态列

#### Scenario: 行内状态开关
- **WHEN** 有 `system:dept:update` 的用户切换某行状态
- **THEN** 调用 status API 并刷新树

### Requirement: 模块功能开关面板
Admin MUST 在部门管理页提供功能开关区域，展示并编辑 moduleEnabled 与 userBindingEnabled。

#### Scenario: 编辑功能开关
- **WHEN** 有 `system:dept:settings` 的用户修改开关并保存
- **THEN** 调用 settings API 成功并提示

### Requirement: 用户管理部门字段
Admin 用户管理 MUST 支持选择所属部门，列表展示部门名称。

#### Scenario: 编辑用户部门
- **WHEN** 在用户对话框选择部门并保存
- **THEN** 用户列表部门列更新

#### Scenario: 模块绑定关闭
- **WHEN** `userBindingEnabled=false`
- **THEN** 用户表单隐藏部门选择器（或只读提示）

```

## openspec/changes/system-dept/specs/dept-api/spec.md

- Source: openspec/changes/system-dept/specs/dept-api/spec.md
- Lines: 1-56
- SHA256: 8bf4c505997b25f282d8eb183c76c76a50dbf50c255775a217d5f38171dc980c

```md
## ADDED Requirements

### Requirement: 部门树查询
系统 MUST 提供 `GET /depts/tree`（仅启用节点）与 `GET /depts/tree/all`（含停用节点），返回嵌套树，按 sort 与 id 排序。

#### Scenario: 下拉选择器加载启用树
- **WHEN** 已登录用户请求 `/depts/tree`
- **THEN** 返回 `{ id, parentId, name, sort, status, children? }[]`，不包含 status=0 的节点

#### Scenario: 管理页加载完整树
- **WHEN** 有 `system:dept:list` 权限请求 `/depts/tree/all`
- **THEN** 返回含 status=0 节点的完整树

### Requirement: 部门 CRUD
系统 MUST 提供部门 list（分页）、create、update、delete API，需 Admin JWT 与 `@RequirePermission`。

#### Scenario: 创建子部门
- **WHEN** POST 合法节点（parentId 指向已存在部门、name 非空）
- **THEN** 返回 201 及 string id

#### Scenario: 删除有子部门的节点
- **WHEN** DELETE 仍有子部门的记录
- **THEN** 返回 400，不删除

#### Scenario: 删除有关联用户的部门
- **WHEN** DELETE 的部门下仍有 sys_user.dept_id 指向该部门
- **THEN** 返回 400，不删除

### Requirement: 部门状态开关
系统 MUST 提供 `PUT /depts/:id/status`，切换节点 status 0/1。

#### Scenario: 停用部门
- **WHEN** PUT status=0
- **THEN** 该节点不再出现在 `/depts/tree` 响应中

### Requirement: 模块功能开关
系统 MUST 在 sys_config（group=dept）维护 `dept.module.enabled` 与 `dept.user_binding.enabled`，并提供 GET/PUT `/depts/settings`。

#### Scenario: 读取功能开关
- **WHEN** GET `/depts/settings` 且有 `system:dept:list`
- **THEN** 返回 `{ moduleEnabled: boolean, userBindingEnabled: boolean }`

#### Scenario: 关闭模块总开关
- **WHEN** `dept.module.enabled=false` 后 POST `/depts`
- **THEN** 返回 403

### Requirement: 用户部门归属
系统 MUST 在 sys_user 支持可选 dept_id；用户 create/update/list/detail 包含 deptId 与 deptName。

#### Scenario: 创建用户并指定部门
- **WHEN** POST `/users` 含合法 deptId（启用部门）
- **THEN** 返回用户详情含 deptId 与 deptName

#### Scenario: 绑定到停用部门
- **WHEN** POST/PUT 用户 deptId 指向 status=0 的部门
- **THEN** 返回 400

```
