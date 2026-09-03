## Why

Infra 层缺少**短信通道配置、模板管理与发送审计**能力。业务场景（验证码、通知）需要可配置的短信 Provider、模板化内容与发送日志，且开发环境应可 Mock 发送而不调用真实网关。这是 System/Infra 扩展批次**第 7 项**，采用与 `system-region` 相同的 Comet 全流程交付。

## What Changes

- **Server — 短信通道 CRUD**：`sys_sms_channel` 实体；Provider 类型（mock/aliyun/tencent）；JSON 配置；启停
- **Server — 短信模板 CRUD**：`sys_sms_template` 实体；模板 code、内容、参数占位；关联通道
- **Server — 发送服务**：`SmsService` 统一发送；Provider 适配器；写 `sys_sms_log`
- **Server — 发送 API**：Admin 测试发送；内部 `sendByTemplate` 供后续业务/Member 调用
- **shared-types**：SmsChannel / SmsTemplate / SmsLog DTO
- **Admin — 短信管理页**：通道、模板、日志、测试发送
- **RBAC 扩展**：sms 权限码与菜单 seed（基础设施目录下）

## Capabilities

### New Capabilities

- `sms-api`: 短信通道/模板 CRUD、发送、日志查询
- `sms-admin-ui`: Admin 短信通道/模板/日志管理页

### Modified Capabilities

- （无）

## Impact

- **主要影响**：`server/src/modules/sms/`（新建）、`server/src/database/entities/`、`server/src/database/seeds/`、`admin/src/views/infra/sms/`、`packages/shared-types/`
- **依赖**：无强制第三方 SDK（MVP 以 mock Provider + 配置占位为主；aliyun/tencent 可后续扩展真实 SDK）
- **不影响**：Member 端验证码完整流程（本 change 仅提供 Infra 能力与 Admin 测试发送）

## Non-Goals

- 真实阿里云/腾讯云 SDK 生产级集成（MVP 配置结构 + mock 发送）
- 短信营销批量群发、定时群发（可由 scheduled-job Handler 后续扩展）
- 国际短信、多语言模板
- 计费对账与运营商报表
