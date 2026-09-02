# member-auth-api Specification

## Purpose
提供 C 端 Member 会员独立登录鉴权 API，与 B 端 Admin 体系分离。

## Requirements

### Requirement: Member 登录
系统 MUST 提供 `POST /member/auth/login`，校验 member_user（手机号+密码），JWT payload 含 `type: member`。

#### Scenario: Member 登录成功
- **WHEN** 提交有效手机号和密码
- **THEN** 返回 200 及 member Token，不含 RBAC 菜单

#### Scenario: Member 登录失败
- **WHEN** 手机号不存在或密码错误
- **THEN** 返回 401

### Requirement: Member 注册
系统 MUST 提供 `POST /member/auth/register`，创建 member_user 并返回 Token。

#### Scenario: 注册成功
- **WHEN** 提交未注册手机号与合法密码
- **THEN** 返回 201 及 Token

### Requirement: Member 登出与刷新
系统 MUST 提供 `POST /member/auth/logout` 与 `POST /member/auth/refresh`。

#### Scenario: Member 刷新 Token
- **WHEN** 提交有效 member refreshToken
- **THEN** 返回新 accessToken

### Requirement: Member 与 Admin 隔离
Member API MUST NOT 访问 sys_user 或 RBAC 菜单接口；Admin Guard MUST 拒绝 `type: member` 的 Token。

#### Scenario: Member Token 访问 Admin 接口
- **WHEN** Member Token 请求 `GET /auth/me/menus`
- **THEN** 返回 403
