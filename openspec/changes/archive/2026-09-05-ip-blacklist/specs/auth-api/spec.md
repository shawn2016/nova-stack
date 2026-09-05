## ADDED Requirements

### Requirement: 登录接口配合 IP 自动封禁

Admin 登录接口 MUST 在返回 401 前通知 IP 黑名单模块记录一次失败；若 IP 已处于封禁状态 MUST 直接返回 403 且 MUST NOT 校验密码。

#### Scenario: 已封禁 IP 尝试登录
- **WHEN** 黑名单中的 IP 调用 `POST /auth/login`
- **THEN** 返回 403，不暴露用户名是否存在

#### Scenario: 登录失败计入暴力计数
- **WHEN** 未封禁 IP 提交错误密码导致 401
- **THEN** 该 IP 登录失败计数 +1（供自动封禁模块使用）
