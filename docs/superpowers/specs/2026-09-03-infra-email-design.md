---
comet_change: infra-email
role: technical-design
canonical_spec: openspec
---

# infra-email 深度技术设计

## 1. 架构

同 infra-sms：`EmailController` → Channel/Template/Log Service → `EmailService` → ProviderFactory

## 2. 实体

- **sys_email_channel**: name, provider (mock|smtp), config, status, remark
- **sys_email_template**: code (unique), name, subject, content, channelId, status
- **sys_email_log**: channelId, templateCode, to, subject, content, status, providerMessage, sentAt

## 3. Provider

- mock: 返回 success
- smtp: NotImplementedException

## 4. API

`/email/channels|templates|logs|send` — 权限 `infra:email:*`

## 5. Admin

`/infra/email` — Tab 布局同 sms

## 6. Seed

Mock 通道 + `welcome` 模板（subject: 欢迎加入 {siteName}）

## 7. 测试

e2e 4 项；entities 27；permissions 78 (68+10)
