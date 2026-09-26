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
