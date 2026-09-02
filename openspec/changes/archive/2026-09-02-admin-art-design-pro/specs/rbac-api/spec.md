## MODIFIED Requirements

### Requirement: RBAC 管理 API 骨架
系统 MUST 提供 User、Role、Menu 的完整 CRUD API（list/create/update/delete），供 Admin 系统管理调用；各端点需 `@RequirePermission` 与 Admin Token。

#### Scenario: 角色列表
- **WHEN** 有权限的管理员请求 `GET /roles`
- **THEN** 返回角色列表（可分页）

#### Scenario: 创建角色
- **WHEN** POST `/roles` 提交合法角色数据
- **THEN** 返回 201 及新角色 id

#### Scenario: 用户列表
- **WHEN** 有 `system:user:list` 权限请求 `GET /users`
- **THEN** 返回用户分页列表

#### Scenario: 创建用户
- **WHEN** POST `/users` 提交用户名与密码
- **THEN** 创建 sys_user 并返回用户信息（不含密码 hash）

#### Scenario: 菜单 CRUD
- **WHEN** 对 `/menus` 执行 CRUD
- **THEN** 菜单数据持久化且 `/auth/me/menus` 可反映变更

#### Scenario: 角色分配权限
- **WHEN** PUT `/roles/:id/permissions` 提交 permissionCodes
- **THEN** 该角色关联权限更新，用户重新登录后 permissions 反映变更

#### Scenario: 用户分配角色
- **WHEN** PUT `/users/:id/roles` 提交 roleIds
- **THEN** 用户角色关联更新，重新登录后菜单与权限反映变更
