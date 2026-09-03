## ADDED Requirements

### Requirement: 邮件通道 CRUD
系统 MUST 持久化 sys_email_channel；provider 为 mock/smtp；config 为 JSON。

#### Scenario: 创建 mock 通道
- **WHEN** POST `/email/channels` provider=mock
- **THEN** 返回 201

#### Scenario: 非法 provider
- **WHEN** POST `/email/channels` provider 非法
- **THEN** 返回 400

### Requirement: 邮件模板 CRUD
系统 MUST 持久化 sys_email_template，含唯一 code、subject、content、channelId。

#### Scenario: 创建模板
- **WHEN** POST `/email/templates` 含唯一 code
- **THEN** 返回 201

### Requirement: 发送与日志
POST `/email/send` MUST 渲染模板、调用 Provider、写 sys_email_log。

#### Scenario: mock 发送
- **WHEN** POST `/email/send` to + templateCode + params
- **THEN** 返回 success 且 logs 新增记录

#### Scenario: 查询日志
- **WHEN** GET `/email/logs`
- **THEN** 返回分页列表
