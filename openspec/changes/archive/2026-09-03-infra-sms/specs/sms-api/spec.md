## ADDED Requirements

### Requirement: 短信通道 CRUD
系统 MUST 持久化 sys_sms_channel，支持 create/update/delete/list；provider 为 mock/aliyun/tencent 之一；config 为 JSON 字符串。

#### Scenario: 创建 mock 通道
- **WHEN** POST `/sms/channels` 含 provider=mock 与合法 config
- **THEN** 返回 201

#### Scenario: 非法 provider
- **WHEN** POST `/sms/channels` provider 不在枚举内
- **THEN** 返回 400

### Requirement: 短信模板 CRUD
系统 MUST 持久化 sys_sms_template，含 code（唯一）、content、channelId、status。

#### Scenario: 创建模板
- **WHEN** POST `/sms/templates` 含唯一 code 与关联 channelId
- **THEN** 返回 201

### Requirement: 发送与日志
POST `/sms/send` MUST 按模板渲染内容、调用 Provider 并写 sys_sms_log；GET `/sms/logs` 分页返回历史。

#### Scenario: 测试发送 mock
- **WHEN** POST `/sms/send` phone + templateCode + params，通道为 mock
- **THEN** 返回 success 且 logs 新增一条 status=1

#### Scenario: 查询日志
- **WHEN** GET `/sms/logs`
- **THEN** 返回按时间倒序的分页列表
