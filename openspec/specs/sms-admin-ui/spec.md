# sms-admin-ui Specification

## Purpose
TBD - created by archiving change infra-sms. Update Purpose after archive.

## Requirements

### Requirement: 短信管理页
Admin MUST 在 `/infra/sms` 提供通道、模板、日志 Tab 及测试发送。

#### Scenario: 通道列表
- **WHEN** 有 `infra:sms:channel:list` 的用户打开短信页
- **THEN** 展示通道名称、provider、状态

#### Scenario: 测试发送
- **WHEN** 用户填写手机号与模板并提交
- **THEN** 调用 send API 并提示结果

#### Scenario: 查看日志
- **WHEN** 用户切换到日志 Tab
- **THEN** 展示手机号、模板、状态、发送时间
