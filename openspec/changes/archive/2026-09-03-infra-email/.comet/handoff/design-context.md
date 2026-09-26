# Comet Design Handoff

- Change: infra-email
- Phase: design
- Mode: compact
- Context hash: 4faebba29484200cd6b9f810bf52c1cfd355062b22e4dd068fdef5b6e5eb1d1a

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/infra-email/proposal.md

- Source: openspec/changes/infra-email/proposal.md
- Lines: 1-35
- SHA256: beef5a0a36d67f2d7a3466d38720cb7263cf94deae27f32dd6bcfdb86f8e3282

```md
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

```

## openspec/changes/infra-email/design.md

- Source: openspec/changes/infra-email/design.md
- Lines: 1-24
- SHA256: 1876156e8c3032f4ae769c19132a8195e7bab9cdcf5081109f21ff25c7f53b50

```md
## Context

在 infra-sms 之后补齐邮件 Infra 能力，架构与短信模块对称。

## Goals / Non-Goals

**Goals:** 通道/模板/日志三表；mock Provider；Admin CRUD + 测试发送

**Non-Goals:** 真实 SMTP SDK；附件发送

## Decisions

- Provider：`mock` | `smtp`（MVP smtp 未实现返回 501）
- 模板含 subject + content，均支持 `{param}` 占位
- 权限前缀 `infra:email:*`
- Admin `/infra/email` Tab 布局同 sms

## Risks / Trade-offs

- 无真实 SMTP → 生产需后续扩展

## Migration Plan

- seed mock 通道 + welcome 模板

```

## openspec/changes/infra-email/tasks.md

- Source: openspec/changes/infra-email/tasks.md
- Lines: 1-18
- SHA256: 37339dd9e91e2f0dd4f596af82328d3551251e5ef7b148acac160d25ead6ed97

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 sys_email_* 实体 + 注册
- [ ] 1.2 shared-types Email DTO

## 2. Server

- [ ] 2.1 EmailProvider + EmailService
- [ ] 2.2 REST API + e2e
- [ ] 2.3 seed + seed.spec

## 3. Admin UI

- [ ] 3.1 邮件管理页

## 4. 集成验证

- [ ] 4.1 全量 test/build + openspec validate

```

## openspec/changes/infra-email/specs/email-admin-ui/spec.md

- Source: openspec/changes/infra-email/specs/email-admin-ui/spec.md
- Lines: 1-16
- SHA256: 0cc755ae5e612beb2d008224cb37a2596658dbb877eec2e13994210bcc7e2ef2

```md
## ADDED Requirements

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

```

## openspec/changes/infra-email/specs/email-api/spec.md

- Source: openspec/changes/infra-email/specs/email-api/spec.md
- Lines: 1-30
- SHA256: 2352a30cdff43201a7658dbb52f62c7a6dc4e9c808f2f0feccc09b8e49d1b6af

```md
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

```
