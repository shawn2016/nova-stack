# Comet Design Handoff

- Change: system-notice
- Phase: design
- Mode: compact
- Context hash: 5cde2a6bda08414048cf7999079f443d7da3a9022bb036bc103414d57dea5cf4

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/system-notice/proposal.md

- Source: openspec/changes/system-notice/proposal.md
- Lines: 1-37
- SHA256: bd3c0ca15825ca8290e0c1e524a68ad6dfea936a07486e9ea9f2473441ca676a

```md
## Why

系统管理已有用户/角色/菜单/字典/地区等能力，但缺少**通知公告**与**站内消息**通道。Admin 无法发布系统通知，用户也无法在后台查看未读消息与已读记录。这是 System/Infra 扩展批次**第 2 项**（用户已确认 multi-change 拆分），采用与 `system-region` 相同的 Comet 全流程交付。

## What Changes

- **Server — 通知公告 CRUD**：`sys_notice` 实体；草稿/发布状态；Admin 分页管理
- **Server — 已读记录**：`sys_notice_read` 记录用户对公告的已读时间；未读统计
- **Server — 站内消息**：`sys_message` 点对点消息；收件箱/发件箱；标记已读
- **shared-types**：Notice、Message、Read 相关 DTO 与列表项
- **Admin — 通知公告管理页**：公告 CRUD + 发布
- **Admin — 消息中心页**：收件箱、未读数、标记已读
- **RBAC 扩展**：notice/message 权限码与菜单 seed

## Capabilities

### New Capabilities

- `notice-api`: 通知公告 CRUD、发布、我的公告列表、标记已读
- `notice-message-api`: 站内消息发送、收件箱/发件箱、已读
- `notice-admin-ui`: Admin 通知公告管理 + 消息中心 UI

### Modified Capabilities

- （无）— 仅新增 permissions/menus seed

## Impact

- **主要影响**：`server/src/modules/notice/`、`server/src/database/entities/`、`server/src/database/seeds/`、`admin/src/views/system/notice/`、`admin/src/views/system/message/`、`packages/shared-types/`
- **不影响**：uni-app/Member 端推送、WebSocket 实时通知、邮件/短信（后续 infra change）

## Non-Goals

- WebSocket / SSE 实时推送
- Member 端消息中心
- 富文本附件、@提及、消息撤回
- 与定时任务/短信/邮件联动发送

```

## openspec/changes/system-notice/design.md

- Source: openspec/changes/system-notice/design.md
- Lines: 1-112
- SHA256: 53a0af78ff25b670ab8a90ef6e0600fa56da20218af8f64a1eac1bdd35ca0739

[TRUNCATED]

```md
## Context

`system-region` 已归档；项目具备统一 `/api` 前缀、RBAC 分页、string ID、Admin `useTable` + `v-permission` 模式。字典/审计日志模块可作为 CRUD + seed 参考。见 proposal.md — Why。

## Goals / Non-Goals

**Goals:**
- 通知公告：草稿 → 发布，Admin 可 CRUD
- 已读记录：登录用户查看公告时标记已读，支持未读统计
- 站内消息：Admin 用户间点对点消息，收件箱/发件箱，标记已读
- RBAC 权限与菜单 seed

**Non-Goals:**
- 实时推送、Member 端、附件、消息模板引擎
- 按角色/部门批量推送（后续与 dept/data-scope 联动）

## Decisions

### 1. 数据模型

**sys_notice**（通知公告）

| 字段 | 说明 |
|------|------|
| id | bigint → API string |
| title | 标题 |
| content | 正文（text） |
| type | `1` 通知 / `2` 公告 |
| status | `0` 草稿 / `1` 已发布 |
| publisher_id | 发布人 sys_user.id |
| published_at | 发布时间，草稿为 null |
| created_at / updated_at | |

**sys_notice_read**（公告已读）

| 字段 | 说明 |
|------|------|
| notice_id, user_id | 复合主键 |
| read_at | 已读时间 |

**sys_message**（站内消息）

| 字段 | 说明 |
|------|------|
| id | bigint → API string |
| sender_id | 发件人 |
| receiver_id | 收件人 |
| title | 标题 |
| content | 正文 |
| is_read | 0/1 |
| read_at | 已读时间，未读为 null |
| created_at | |

### 2. API 设计

**通知公告**（`/notices`）

```
GET    /notices              — 管理端分页（keyword, status, type）
POST   /notices
PUT    /notices/:id
DELETE /notices/:id          — 仅草稿可删；已发布禁止删（MVP）
PUT    /notices/:id/publish  — 草稿 → 已发布
GET    /notices/my           — 当前用户可见的已发布公告 + 是否已读
POST   /notices/:id/read     — 标记已读
GET    /notices/unread-count — 当前用户未读公告数
```

**站内消息**（`/messages`）

```
GET    /messages/inbox       — 收件箱分页
GET    /messages/sent        — 发件箱分页
POST   /messages             — 发送（receiverId, title, content）
PUT    /messages/:id/read    — 标记已读（仅收件人）
DELETE /messages/:id         — 软删或硬删（发件人/收件人各自可见范围 MVP：收件人删收件箱）
GET    /messages/unread-count
```

**权限码**：

```

Full source: openspec/changes/system-notice/design.md

## openspec/changes/system-notice/tasks.md

- Source: openspec/changes/system-notice/tasks.md
- Lines: 1-29
- SHA256: faa97c7fa3103dce0648c2891bffb218aafefba5df34b299a0237ccd7718d4ee

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 `sys_notice`、`sys_notice_read`、`sys_message` 实体 + 注册 — 验证：建表成功
- [ ] 1.2 shared-types `notice.ts`（Notice/Message DTO、ListItem） — 验证：编译通过

## 2. Server 通知公告 API

- [ ] 2.1 NoticeModule：CRUD + publish + my + read + unread-count — 验证：e2e
- [ ] 2.2 删除约束（已发布不可删）— 验证：e2e 边界

## 3. Server 站内消息 API

- [ ] 3.1 MessageModule 或 Notice 子模块：inbox/sent/send/read — 验证：e2e
- [ ] 3.2 权限与收件人校验 — 验证：e2e 403/404

## 4. Seed 与 RBAC

- [ ] 4.1 permissions + 菜单 seed + dev 示例数据 — 验证：seed.spec

## 5. Admin UI

- [ ] 5.1 `admin/src/api/notice.ts` + `message.ts` — 验证：类型编译
- [ ] 5.2 通知公告管理页 — 验证：dev smoke CRUD + 发布
- [ ] 5.3 消息中心页 — 验证：收发 + 标记已读

## 6. 集成验证

- [ ] 6.1 server test + e2e、admin build — 验证：全绿
- [ ] 6.2 openspec validate system-notice --strict — 验证：通过

```

## openspec/changes/system-notice/specs/notice-admin-ui/spec.md

- Source: openspec/changes/system-notice/specs/notice-admin-ui/spec.md
- Lines: 1-27
- SHA256: cf74ebedee9985d6c6f67c1dffdd7b384460734547d68794d4cdc891d1fc845e

```md
## Purpose

Provides Admin UI pages for managing system notices and viewing/sending in-site messages with RBAC-controlled actions.

## ADDED Requirements

### Requirement: 通知公告管理页
Admin MUST 提供 `/system/notice` 页面，支持公告 CRUD 与发布。

#### Scenario: 列表与发布
- **WHEN** 管理员进入通知公告页
- **THEN** 展示分页列表，草稿可编辑/发布/删除，已发布可查看不可删

#### Scenario: 权限控制
- **WHEN** 用户无 `system:notice:create`
- **THEN** 新增按钮不可见

### Requirement: 消息中心页
Admin MUST 提供 `/system/message` 页面，支持收件箱、发件箱与发消息。

#### Scenario: 收件箱标记已读
- **WHEN** 用户点击未读消息并标记已读
- **THEN** 调用 read API 并刷新列表

#### Scenario: 发送消息
- **WHEN** 有 `system:message:send` 并选择收件用户提交
- **THEN** 消息出现在发件箱，收件人 inbox 可见

```

## openspec/changes/system-notice/specs/notice-api/spec.md

- Source: openspec/changes/system-notice/specs/notice-api/spec.md
- Lines: 1-35
- SHA256: b20dae5ded593b7016ed97a51e9c109f3a1a981bd8384e23235df5468018a572

```md
## Purpose

Provides Admin REST APIs for system notices (announcements): CRUD, publish workflow, per-user read tracking, and unread counts.

## ADDED Requirements

### Requirement: 通知公告 CRUD
系统 MUST 提供通知公告的分页列表、创建、更新、删除 API，需 Admin JWT 与 `@RequirePermission`。

#### Scenario: 创建草稿公告
- **WHEN** 有 `system:notice:create` 权限 POST 合法公告（title、content、type）
- **THEN** 返回 201，status=0（草稿），published_at 为空

#### Scenario: 发布草稿
- **WHEN** PUT `/notices/:id/publish` 且公告为草稿
- **THEN** status=1，published_at 写入当前时间

#### Scenario: 删除已发布公告
- **WHEN** DELETE 已发布（status=1）的公告
- **THEN** 返回 400，不删除

### Requirement: 我的公告与已读
系统 MUST 允许登录用户查看已发布公告列表，并标记已读、查询未读数。

#### Scenario: 查看我的公告
- **WHEN** GET `/notices/my` 且存在已发布公告
- **THEN** 返回列表含 `isRead` 字段

#### Scenario: 标记已读
- **WHEN** POST `/notices/:id/read` 且公告已发布
- **THEN** 写入 `sys_notice_read` 记录，未读数减 1

#### Scenario: 未读数
- **WHEN** GET `/notices/unread-count`
- **THEN** 返回当前用户未读已发布公告数量

```

## openspec/changes/system-notice/specs/notice-message-api/spec.md

- Source: openspec/changes/system-notice/specs/notice-message-api/spec.md
- Lines: 1-31
- SHA256: 0754cf65f8fac6a0dadc52eabe9cf63d8b07c642d7bd9c9504a9bb360b680ac1

```md
## Purpose

Provides Admin REST APIs for in-site point-to-point messages between system users: send, inbox, sent box, read status, and unread counts.

## ADDED Requirements

### Requirement: 站内消息收发
系统 MUST 提供站内消息的发送、收件箱、发件箱分页 API。

#### Scenario: 发送消息
- **WHEN** 有 `system:message:send` 权限 POST（receiverId、title、content）
- **THEN** 返回 201，receiver 可在 inbox 看到，is_read=0

#### Scenario: 收件箱分页
- **WHEN** GET `/messages/inbox` 以收件人身份请求
- **THEN** 仅返回 receiver_id=当前用户的记录

#### Scenario: 标记消息已读
- **WHEN** 收件人 PUT `/messages/:id/read`
- **THEN** is_read=1，read_at 写入

#### Scenario: 非收件人标记已读
- **WHEN** 其他用户 PUT `/messages/:id/read`
- **THEN** 返回 403 或 404

### Requirement: 未读消息统计
系统 MUST 提供当前用户未读站内消息数量。

#### Scenario: 未读数
- **WHEN** GET `/messages/unread-count`
- **THEN** 返回 is_read=0 且 receiver=当前用户的计数

```
