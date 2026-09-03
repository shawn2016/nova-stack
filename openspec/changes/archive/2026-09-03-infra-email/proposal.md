## Why

Infra 层缺少**邮件通道配置、模板管理与发送审计**能力。通知类业务需要可配置的 SMTP/Mock Provider、模板化邮件内容与发送日志。这是 System/Infra 扩展批次**最后一项**，采用与 `system-region` 相同的 Comet 全流程交付。

## What Changes

- **Server — 邮件通道 CRUD**：`sys_email_channel`；Provider（mock/smtp）；JSON 配置；启停
- **Server — 邮件模板 CRUD**：`sys_email_template`；code、subject、content、channelId
- **Server — 发送服务**：`EmailService` + Provider 适配器；写 `sys_email_log`
- **Server — 发送 API**：Admin 测试发送
- **shared-types**：EmailChannel / EmailTemplate / EmailLog DTO
- **Admin — 邮件管理页**：通道、模板、日志、测试发送
- **RBAC 扩展**：email 权限码与菜单 seed

## Capabilities

### New Capabilities

- `email-api`: 邮件通道/模板 CRUD、发送、日志查询
- `email-admin-ui`: Admin 邮件管理页

### Modified Capabilities

- （无）

## Impact

- **主要影响**：`server/src/modules/email/`（新建）、entities、seeds、admin、`packages/shared-types/`
- **不影响**：真实 SMTP 生产级集成（MVP mock + 配置占位）

## Non-Goals

- 真实 SMTP/nodemailer 完整对接
- 邮件附件、批量营销
- 退订链接、DKIM/SPF 配置
