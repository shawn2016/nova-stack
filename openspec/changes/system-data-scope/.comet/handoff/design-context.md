# Comet Design Handoff

- Change: system-data-scope
- Phase: design
- Mode: compact
- Context hash: 0ecc54453a262bebd0304e2a2b65b516d325037d214b0cec8aee781057e881de

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/system-data-scope/proposal.md

- Source: openspec/changes/system-data-scope/proposal.md
- Lines: 1-34
- SHA256: c4f20fa35144d7e48c595e610996b79ad88341afd43df787a35ee0038c91ddf7

```md
## Why

`system-dept` 已提供部门树与用户归属，但角色仍缺少**数据权限范围**配置。Admin 无法限制某角色只能查看本部门或自定义部门的数据。这是 System/Infra 扩展批次**第 4 项**，采用与 `system-region` 相同的 Comet 全流程交付。

## What Changes

- **Server — 角色数据范围**：`sys_role.data_scope` 枚举；`sys_role_dept` 自定义部门关联
- **Server — 范围解析服务**：根据当前用户角色计算可访问部门 ID 集合
- **Server — 查询过滤**：用户列表 API 按数据范围过滤（MVP 示范）
- **shared-types**：DataScope 枚举、Role DTO 扩展
- **Admin — 角色管理**：数据范围选择 + 自定义部门树
- **RBAC**：super_admin 始终全部数据；数据范围模块开关（sys_config）

## Capabilities

### New Capabilities

- `data-scope-api`: 角色 dataScope 配置、范围解析、用户列表过滤
- `data-scope-admin-ui`: 角色编辑页数据范围 UI

### Modified Capabilities

- （无）

## Impact

- **主要影响**：`server/src/modules/rbac/role/`、`server/src/modules/data-scope/`（新建）、`server/src/modules/rbac/user/`、`server/src/database/entities/`、`admin/src/views/system/role/`
- **不影响**：Member 端、业务模块（article 等）的数据过滤（后续按需接入）

## Non-Goals

- 全模块自动 SQL 拦截器（AOP）
- 按地区/自定义字段的数据权限
- 动态规则引擎、表达式 DSL

```

## openspec/changes/system-data-scope/design.md

- Source: openspec/changes/system-data-scope/design.md
- Lines: 1-67
- SHA256: 1a78eb05b30ddcba69d33c9ebe1310825faa68072324a08f0b7094b3d1bee232

```md
## Context

`system-dept` 已归档；角色/用户/部门模块就绪。见 proposal.md — Why。

## Goals / Non-Goals

**Goals:**
- 五种数据范围：全部、自定义部门、本部门、本部门及子部门、仅本人
- 角色 CRUD/详情含 dataScope + customDeptIds
- 用户列表按数据范围过滤
- super_admin 绕过限制

**Non-Goals:**
- 全局 ORM 拦截
- 文章/审计日志等业务表过滤

## Decisions

### 1. 数据模型

**sys_role** 增量：`data_scope` tinyint default 1

| 值 | 含义 |
|----|------|
| 1 | ALL 全部 |
| 2 | CUSTOM 自定义部门 |
| 3 | DEPT 本部门 |
| 4 | DEPT_AND_CHILD 本部门及子部门 |
| 5 | SELF 仅本人 |

**sys_role_dept**（role_id, dept_id）复合主键 — CUSTOM 时使用

**sys_config**：`data_scope.module.enabled` 默认 true

### 2. 范围解析

`DataScopeService.resolveDeptIds(userId)`:
- 取用户所有启用角色
- super_admin → null（无限制）
- 多角色取**并集**（最宽松）
- DEPT/DEPT_AND_CHILD 需用户 deptId
- CUSTOM 读 sys_role_dept
- SELF → 返回特殊标记，用户列表仅看自己

`DataScopeService.applyUserFilter(qb, userId)` — 用户列表 QueryBuilder 追加 WHERE

### 3. API

- 角色 create/update/assign 支持 dataScope、customDeptIds
- GET `/users` 自动应用数据范围（无需新端点）

### 4. Admin UI

- 角色编辑对话框：数据范围 ElSelect + 自定义部门 ElTreeSelect（multi）
- super_admin 角色 dataScope 固定 ALL 且不可改

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 用户无 deptId 时 DEPT 模式 | 返回空集合（看不到他人） |
| 多角色并集过宽 | 文档说明；MVP 可接受 |

## Migration

- sys_role.data_scope 列 + sys_role_dept 表
- seed super_admin data_scope=1

```

## openspec/changes/system-data-scope/tasks.md

- Source: openspec/changes/system-data-scope/tasks.md
- Lines: 1-22
- SHA256: 16b65b2540399ace6bf82381ce4a8b91754e5c488aec0f35f9745f31b07bfb05

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 sys_role.data_scope + sys_role_dept + 注册 — 验证：建表
- [ ] 1.2 shared-types DataScope 枚举 + Role DTO 扩展 — 验证：test

## 2. Server 数据范围

- [ ] 2.1 DataScopeModule + resolveDeptIds + 模块开关 — 验证：unit/e2e
- [ ] 2.2 Role CRUD 支持 dataScope/customDeptIds — 验证：e2e
- [ ] 2.3 User list 按数据范围过滤 — 验证：e2e

## 3. Seed

- [ ] 3.1 super_admin ALL + data_scope settings — 验证：seed.spec

## 4. Admin UI

- [ ] 4.1 角色编辑 dataScope + 自定义部门 — 验证：build

## 5. 集成验证

- [ ] 5.1 全量 test/build + openspec validate — 验证：通过

```

## openspec/changes/system-data-scope/specs/data-scope-admin-ui/spec.md

- Source: openspec/changes/system-data-scope/specs/data-scope-admin-ui/spec.md
- Lines: 1-12
- SHA256: 9c4ae0563cc8db2a108ade03fd54c86c92f8ac763be402dcf361dee9b1c24f46

```md
## ADDED Requirements

### Requirement: 角色数据范围 UI
Admin 角色编辑 MUST 提供数据范围选择与自定义部门树（dataScope=2 时）。

#### Scenario: 编辑角色数据范围
- **WHEN** 有 `system:role:update` 的用户修改 dataScope 并保存
- **THEN** 调用 role update API 成功

#### Scenario: super_admin 不可改范围
- **WHEN** 编辑 super_admin 角色
- **THEN** 数据范围控件禁用或隐藏

```

## openspec/changes/system-data-scope/specs/data-scope-api/spec.md

- Source: openspec/changes/system-data-scope/specs/data-scope-api/spec.md
- Lines: 1-34
- SHA256: 7e32a57694e489a7e3d91c2e44552ae66029b526c2ac91c1a8c5eecdb4f746f1

```md
## ADDED Requirements

### Requirement: 角色数据范围配置
系统 MUST 在 sys_role 支持 data_scope（1-5），CUSTOM 时通过 sys_role_dept 关联部门；角色 create/update/详情含 dataScope 与 customDeptIds。

#### Scenario: 创建 CUSTOM 范围角色
- **WHEN** POST `/roles` 含 dataScope=2 与 customDeptIds
- **THEN** 返回 201，详情含 dataScope 与 customDeptIds

#### Scenario: super_admin 固定 ALL
- **WHEN** PUT super_admin 角色 dataScope 为非 1
- **THEN** 返回 400

### Requirement: 数据范围解析
系统 MUST 提供 DataScopeService，根据用户角色计算可访问部门 ID 集合；super_admin 无限制。

#### Scenario: DEPT 范围
- **WHEN** 用户 deptId=D，角色 dataScope=3
- **THEN** 解析结果仅含 D

#### Scenario: 多角色并集
- **WHEN** 用户有两角色分别 DEPT 与 CUSTOM 含 E
- **THEN** 解析结果为 D ∪ E

### Requirement: 用户列表过滤
GET `/users` MUST 按当前用户数据范围过滤结果。

#### Scenario: SELF 仅看自己
- **WHEN** 角色 dataScope=5 的用户 list users
- **THEN** 仅返回该用户自身

#### Scenario: ALL 无过滤
- **WHEN** super_admin list users
- **THEN** 返回全部用户（分页内）

```
