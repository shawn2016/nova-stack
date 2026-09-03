# email-admin-ui Specification

## Purpose
TBD - created by archiving change infra-email. Update Purpose after archive.

## Requirements

### Requirement: 邮件管理页
Admin MUST 在 `/infra/email` 提供通道、模板、日志与测试发送。

#### Scenario: 通道列表
- **WHEN** 有权限用户打开邮件页
- **THEN** 展示通道列表

#### Scenario: 测试发送
- **WHEN** 用户提交测试发送
- **THEN** 调用 send API 并提示结果

#### Scenario: 查看日志
- **WHEN** 用户查看日志 Tab
- **THEN** 展示收件人、主题、状态、时间
