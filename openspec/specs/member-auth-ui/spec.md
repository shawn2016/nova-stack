# member-auth-ui Specification

## Purpose
Uni-app C 端会员登录 UI，对接 `/member/auth/*`，不接入 B 端 RBAC。

## Requirements

### Requirement: C 端登录页
Uni-app MUST 提供会员登录页，调用 `POST /member/auth/login`。

#### Scenario: H5 会员登录
- **WHEN** 输入手机号密码登录
- **THEN** Token 持久化，跳转首页

### Requirement: C 端注册页
Uni-app MUST 提供注册页，调用 `POST /member/auth/register`。

#### Scenario: 注册并登录
- **WHEN** 新用户注册成功
- **THEN** 自动登录并跳转首页

### Requirement: Member Token 注入
request 封装 MUST 注入 Member Bearer Token，401 跳转登录。

#### Scenario: 带 Token 请求
- **WHEN** 已登录会员发起 API 请求
- **THEN** Authorization header 携带 member Token

### Requirement: 不接入 B 端 RBAC
Uni-app MUST NOT 调用 `/auth/me/menus` 或 v-permission 类 B 端权限接口。

#### Scenario: 无菜单权限请求
- **WHEN** uni-app 启动
- **THEN** 不请求 Admin 菜单 API
