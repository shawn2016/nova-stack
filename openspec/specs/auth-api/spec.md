# auth-api Specification

## Purpose
提供 B 端 Admin 用户的 JWT 登录鉴权 API 及共享 JWT/Redis 基础设施。

## Requirements

### Requirement: Admin 用户登录
系统 MUST 提供 `POST /auth/login`，校验 sys_user 用户名密码，成功返回 accessToken、refreshToken 及管理员信息。

#### Scenario: Admin 登录成功
- **WHEN** 提交有效管理员用户名和密码
- **THEN** 返回 200，JWT payload 含 `type: admin`

#### Scenario: Admin 登录失败
- **WHEN** 提交错误密码
- **THEN** 返回 401

### Requirement: Admin 登出与刷新
系统 MUST 提供 `POST /auth/logout` 与 `POST /auth/refresh`，行为同设计文档 B 端流程。

#### Scenario: Admin 登出
- **WHEN** Admin 携带 Token 登出
- **THEN** Token 入 Redis 黑名单

### Requirement: Redis JWT 黑名单
系统 MUST 维护 Redis 黑名单，Admin 与 Member Token 均适用。

#### Scenario: 黑名单拒绝
- **WHEN** 使用已登出 Token
- **THEN** 返回 401

### Requirement: 生产 JWT 密钥校验
系统 MUST 在 production 环境 fail-fast 弱 JWT_SECRET。

#### Scenario: 弱密钥拒绝启动
- **WHEN** NODE_ENV=production 且 JWT_SECRET 为默认值
- **THEN** 启动失败

### Requirement: 当前管理员更新资料
系统 MUST 提供 `PUT /auth/me`，允许当前登录管理员更新 `nickname` 与 `avatar`（URL 字符串）。

#### Scenario: 更新昵称成功
- **WHEN** 携带有效 Admin Token 提交 `{ nickname: "新昵称" }`
- **THEN** 返回 200 及更新后的管理员信息

#### Scenario: 更新头像 URL
- **WHEN** 提交合法 avatar URL（通常来自文件上传接口）
- **THEN** 持久化至 sys_user.avatar 并在后续 `GET /auth/me` 中返回

### Requirement: 当前管理员修改密码
系统 MUST 提供 `PUT /auth/me/password`，校验旧密码后更新 passwordHash。

#### Scenario: 改密成功
- **WHEN** 提交正确 oldPassword 与符合长度要求的 newPassword
- **THEN** 返回 200；使用新密码可登录

#### Scenario: 旧密码错误
- **WHEN** oldPassword 不正确
- **THEN** 返回 400 或 401，不修改密码
