# admin-system-ui Specification

## Purpose
Admin 系统管理模块：用户、角色、菜单的真实 CRUD 页面，对接 RBAC API，非占位 demo。

## Requirements

### Requirement: 用户管理页
Admin MUST 提供用户管理页：分页列表、创建、编辑、删除（或禁用），对接用户管理 API；操作按钮受 `system:user:*` 权限控制。

#### Scenario: 用户列表
- **WHEN** 有 `system:user:list` 权限的管理员访问用户管理
- **THEN** 展示用户分页列表（用户名、昵称、状态等）

#### Scenario: 创建用户
- **WHEN** 有 `system:user:create` 权限并提交创建表单
- **THEN** 调用 POST 用户 API 成功并刷新列表

### Requirement: 角色管理页
Admin MUST 提供角色管理页：列表、创建、编辑、删除，支持为角色分配权限；对接角色 API。

#### Scenario: 角色列表与权限分配
- **WHEN** 编辑某角色并勾选权限后保存
- **THEN** 角色权限更新生效，重新登录或刷新权限后菜单/按钮符合新权限

### Requirement: 菜单管理页
Admin MUST 提供菜单管理页：列表（或树形）、创建、编辑、删除菜单项；对接菜单 API；菜单变更影响后续 `GET /auth/me/menus` 结果。

#### Scenario: 编辑菜单
- **WHEN** 管理员修改菜单 path 或 permission 并保存
- **THEN** 有相应权限的用户登录后动态菜单反映变更

### Requirement: 动态侧栏菜单
Admin MUST 登录成功后仅根据 `GET /auth/me/menus` 渲染侧栏并注册路由，不得依赖静态业务菜单配置。

#### Scenario: 不同角色不同菜单
- **WHEN** 普通管理员与 super_admin 分别登录
- **THEN** 侧栏菜单集合不同，均来自各自 `/auth/me/menus` 响应
