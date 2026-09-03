## ADDED Requirements

### Requirement: 站点配置管理页
Admin MUST 提供站点配置页，展示 KV 列表并支持创建、编辑、删除。

#### Scenario: 配置列表
- **WHEN** 有 `system:config:list` 权限访问页面
- **THEN** 展示分页配置列表（key、名称、值、分组）

#### Scenario: 编辑配置值
- **WHEN** 有 `system:config:update` 并保存
- **THEN** 调用 PUT API 成功并刷新列表

#### Scenario: 权限控制
- **WHEN** 无 create 权限
- **THEN** 不显示新增按钮
