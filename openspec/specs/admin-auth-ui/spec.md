# admin-auth-ui Specification

## Purpose
Admin 管理端完整登录鉴权 UI：登录页、Token 管理、动态路由与按钮权限。

## Requirements

### Requirement: 登录页对接
Admin MUST 提供可用的登录页，提交用户名密码调用 `POST /auth/login`，成功后存储 Token 并跳转 Dashboard。

#### Scenario: 登录成功跳转
- **WHEN** 输入正确凭据并提交
- **THEN** 跳转至 Dashboard

### Requirement: Axios Token 注入与刷新
Admin MUST 在请求拦截器注入 Bearer Token；401 时尝试 refresh，失败则跳转登录。

#### Scenario: Token 自动刷新
- **WHEN** accessToken 过期但 refreshToken 有效
- **THEN** 自动刷新并重试原请求

### Requirement: 动态路由
Admin MUST 登录后根据 `GET /auth/me/menus` 动态注册业务路由。

#### Scenario: 动态路由注册
- **WHEN** 用户登录成功
- **THEN** 侧边栏展示有权菜单，点击可导航

### Requirement: 按钮权限指令
Admin MUST 提供 `v-permission` 指令，无权限时隐藏或禁用按钮。

#### Scenario: 无权限隐藏按钮
- **WHEN** 用户无 `system:user:add` 权限
- **THEN** 对应新增按钮不可见

### Requirement: 路由守卫
Admin MUST 未登录用户访问受保护路由时重定向至 `/login`。

#### Scenario: 未登录重定向
- **WHEN** 无 Token 访问 `/dashboard`
- **THEN** 重定向至 `/login`
