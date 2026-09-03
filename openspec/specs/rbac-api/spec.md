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
系统 MUST 提供 User、Role、Menu 的完整 CRUD API（list/create/update/delete），供 Admin 系统管理调用；各端点需 `@RequirePermission` 与 Admin Token；**list 端点 MUST 支持服务端分页**（page、pageSize）与 keyword 筛选。

#### Scenario: 角色列表
- **WHEN** 有权限的管理员请求 `GET /roles?page=1&pageSize=20`
- **THEN** 返回 `{ list, page, pageSize, total }` 分页结果，非全量

#### Scenario: 创建角色
- **WHEN** POST `/roles` 提交合法角色数据
- **THEN** 返回 201 及新角色 id（string）

#### Scenario: 用户列表
- **WHEN** 有 `system:user:list` 权限请求 `GET /users?page=1&pageSize=20&keyword=admin`
- **THEN** 返回用户分页列表，keyword 匹配 username/nickname

#### Scenario: 创建用户
- **WHEN** POST `/users` 提交用户名与密码
- **THEN** 创建 sys_user 并返回用户信息（不含密码 hash）

#### Scenario: 菜单 CRUD
- **WHEN** 对 `/menus` 执行 CRUD；GET list 支持分页
- **THEN** 菜单数据持久化且 `/auth/me/menus` 可反映变更

#### Scenario: 角色分配权限
- **WHEN** PUT `/roles/:id/permissions` 提交 permissionCodes
- **THEN** 该角色关联权限更新，用户重新登录后 permissions 反映变更

#### Scenario: 用户分配角色
- **WHEN** PUT `/users/:id/roles` 提交 roleIds
- **THEN** 用户角色关联更新，重新登录后菜单与权限反映变更
