# Comet Design Handoff

- Change: infra-sms
- Phase: design
- Mode: compact
- Context hash: 1d7b92facbf3f2978950dee057a202155ee06b1ed45beaca3eee752659d99d9e

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/infra-sms/proposal.md

- Source: openspec/changes/infra-sms/proposal.md
- Lines: 1-37
- SHA256: 25ed4a5c504995ade32c01766d0f557313da4bcfa99ff7529771321a9f0e9bdf

```md
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

```

## openspec/changes/infra-sms/design.md

- Source: openspec/changes/infra-sms/design.md
- Lines: 1-54
- SHA256: cf8535e89eba3ebedd19836bad7e2d7ebe23e85aa94c875552681881bbf21be6

```md
## Context

在定时任务（infra-scheduled-job）之后，补齐 Infra 短信能力。项目已有 RBAC、seed 菜单「基础设施」目录，可挂载短信子菜单。

## Goals / Non-Goals

**Goals:**
- 通道、模板、日志三表持久化
- Provider 适配器 + mock 实现（e2e/开发零副作用）
- Admin 可 CRUD 通道与模板、查看日志、测试发送

**Non-Goals:**
- 真实云厂商 SDK 完整对接
- Member 注册验证码业务流（后续 change 复用 SmsService）

## Decisions

### 1. Provider 策略

- `SmsProvider` 接口：`send(phone, content, config): Promise<SmsSendResult>`
- 内置 `mock` Provider：仅写日志，返回 success
- `aliyun` / `tencent`：MVP 校验配置 JSON 结构，发送时若未实现则返回 501 或明确错误（可测试配置 CRUD）

### 2. 模板与发送

- 模板 content 支持 `{code}` 占位；发送时替换 params
- `POST /sms/send`（Admin 测试）：phone + templateCode + params
- 每次发送写 `sys_sms_log`（phone、templateCode、content、status、providerMessage）

### 3. 权限

- `infra:sms:channel:list/create/update/delete`
- `infra:sms:template:list/create/update/delete`
- `infra:sms:log:list`
- `infra:sms:send`（测试发送）

### 4. Admin UI

- Tab：通道 | 模板 | 日志
- 测试发送弹窗：选模板 + 手机号 + 参数 JSON

## Risks / Trade-offs

- 无真实 SDK → 生产需后续 change 扩展 Provider 实现
- 配置 JSON 存库 → 敏感 key 需环境变量引用（MVP 明文 dev 配置 + 文档说明）

## Migration Plan

- TypeORM sync / e2e schema 增表
- seed 默认 mock 通道 + 验证码模板示例

## Open Questions

- （无阻塞）真实 SDK 集成留后续迭代

```

## openspec/changes/infra-sms/tasks.md

- Source: openspec/changes/infra-sms/tasks.md
- Lines: 1-18
- SHA256: 83dca0237b3a07b65522670beca5cff5b5c6e39f4012656bdb0bf44591289556

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 sys_sms_channel / sys_sms_template / sys_sms_log 实体 + 注册 — 验证：entities.spec
- [ ] 1.2 shared-types Sms DTO — 验证：test

## 2. Server 发送与 API

- [ ] 2.1 SmsProvider + MockProvider + SmsService — 验证：unit/e2e
- [ ] 2.2 通道/模板 CRUD + send + logs API — 验证：e2e
- [ ] 2.3 seed 权限/菜单/示例通道模板 — 验证：seed.spec

## 3. Admin UI

- [ ] 3.1 短信管理页（通道/模板/日志/测试发送） — 验证：admin build

## 4. 集成验证

- [ ] 4.1 全量 test/build + openspec validate — 验证：通过

```

## openspec/changes/infra-sms/specs/sms-admin-ui/spec.md

- Source: openspec/changes/infra-sms/specs/sms-admin-ui/spec.md
- Lines: 1-16
- SHA256: bf781011cc169c4926912fe663d64bcb361d821070827926fdac75dbb27b5b41

```md
## ADDED Requirements

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

```

## openspec/changes/infra-sms/specs/sms-api/spec.md

- Source: openspec/changes/infra-sms/specs/sms-api/spec.md
- Lines: 1-30
- SHA256: db2dfad14f79ca5c39f81653b187122a095c13e797fd6d3fd770615fa579301b

```md
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

```
