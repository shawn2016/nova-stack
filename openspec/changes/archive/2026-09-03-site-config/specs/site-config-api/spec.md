## ADDED Requirements

### Requirement: 站点配置 CRUD
系统 MUST 提供配置项 list/create/update/delete，需 Admin JWT 与 `@RequirePermission`。

#### Scenario: 创建配置
- **WHEN** 有 `system:config:create` 权限 POST 合法 key/name/value
- **THEN** 返回 201 及新配置 id

#### Scenario: config_key 重复
- **WHEN** POST 的 config_key 已存在
- **THEN** 返回 400

### Requirement: 按 key 读取配置
系统 MUST 提供 `GET /config/by-key/:key`，返回单条配置的 key、name、value、group。

#### Scenario: 读取已知 key
- **WHEN** 已登录 Admin 请求 `GET /config/by-key/site.name`
- **THEN** 返回 200 及配置值

#### Scenario: 未知 key
- **WHEN** key 不存在
- **THEN** 返回 404

#### Scenario: Member Token
- **WHEN** Member token 请求 by-key
- **THEN** 返回 403
