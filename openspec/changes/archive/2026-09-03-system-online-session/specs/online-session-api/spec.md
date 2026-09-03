## ADDED Requirements

### Requirement: 在线会话注册
Admin 登录成功后，系统 MUST 在 Redis 记录在线会话，含 userId、username、ip、userAgent、loginAt、tokenId（access jti）。

#### Scenario: 登录注册会话
- **WHEN** Admin POST `/auth/login` 成功
- **THEN** Redis 存在 `online:admin:{jti}` 且含 username 与 ip

#### Scenario: 登出清理会话
- **WHEN** Admin POST `/auth/logout` 且 token 有效
- **THEN** 对应 `online:admin:{jti}` 被删除

### Requirement: 在线用户列表
系统 MUST 提供 GET `/sessions/online` 返回当前在线 Admin 会话分页列表；需 `system:session:list` 权限。

#### Scenario: 查询在线用户
- **WHEN** 有权限用户 GET `/sessions/online`
- **THEN** 返回含 tokenId、username、ip、loginAt 的 list

#### Scenario: 模块关闭
- **WHEN** `online_session.module.enabled=false`
- **THEN** 列表返回空且登录不注册会话

### Requirement: 强制踢下线
系统 MUST 提供 DELETE `/sessions/online/:tokenId` 强制踢指定会话；需 `system:session:kick` 权限。

#### Scenario: 踢下线成功
- **WHEN** 有权限用户 DELETE 他人会话 tokenId
- **THEN** 会话 key 删除且 jti 进入黑名单；被踢 token 后续请求 401

#### Scenario: 禁止踢自己
- **WHEN** 用户 DELETE 当前自身 tokenId
- **THEN** 返回 400
