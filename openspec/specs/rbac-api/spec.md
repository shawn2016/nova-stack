# rbac-api Specification

## Purpose
提供 RBAC 管理 API 与当前用户权限查询接口。

## Requirements

### Requirement: 当前用户信息
系统 MUST 提供 `GET /auth/me`，返回当前登录用户信息与角色列表。

#### Scenario: 获取当前用户
- **WHEN** 携带有效 Token 请求
- **THEN** 返回 user、roles、permissions

### Requirement: 当前用户菜单
系统 MUST 提供 `GET /auth/me/menus`，返回当前用户有权访问的菜单树（不含 button 或按需包含）。

#### Scenario: 获取菜单树
- **WHEN** 超级管理员请求
- **THEN** 返回完整菜单树

### Requirement: 权限校验 Guard
系统 MUST 提供 `@RequirePermission()` 装饰器与 PermissionGuard，无权限时返回 403。

#### Scenario: 无权限访问
- **WHEN** 用户访问需要 `system:role:list` 的接口但无该权限
- **THEN** 返回 403

### Requirement: RBAC 管理 API 骨架
系统 MUST 提供 Role/Menu 的基础 CRUD API（至少 list/create/update/delete 骨架），供 admin 后续扩展。

#### Scenario: 角色列表
- **WHEN** 有权限的管理员请求 `GET /roles`
- **THEN** 返回角色分页列表
