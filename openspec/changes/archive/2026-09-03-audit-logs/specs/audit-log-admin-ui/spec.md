## ADDED Requirements

### Requirement: 审计日志查看页
Admin MUST 提供审计日志页，含登录日志与操作日志两个视图，只读。

#### Scenario: 登录日志 Tab
- **WHEN** 有 `system:audit:login:list` 访问
- **THEN** 展示登录日志表格，支持 username/status 筛选

#### Scenario: 操作日志 Tab
- **WHEN** 有 `system:audit:oper:list` 访问
- **THEN** 展示操作日志表格，支持 module/username 筛选
