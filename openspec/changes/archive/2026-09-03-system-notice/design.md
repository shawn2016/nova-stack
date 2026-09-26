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
- `system:notice:list|create|update|delete|publish`
- `system:message:list|send|delete`
- 读自己的 inbox / mark read 仅需登录（或复用 `system:message:list`）

### 3. Admin UI

- `/system/notice` — 公告管理（表格 + 对话框 + 发布按钮）
- `/system/message` — 消息中心（Tab：收件箱/发件箱 + 发消息对话框）
- 顶栏未读角标（可选本 change）：调用 unread-count API

### 4. Seed

- permissions + 菜单「通知公告」「消息中心」
- 可选 dev 示例：1 条已发布公告 + 1 条未读消息

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 公告全员可见性能 | MVP 全表已发布 + 读表；用户量小可接受 |
| 消息无推送 | 文档标注；后续 WebSocket change |
| 已发布不可删 | 符合审计习惯；可后续加「下线」状态 |

## Migration

- TypeORM synchronize（dev）新增三表
- seed 增量 permissions/menus

## Open Questions

- [ ] 顶栏铃铛未读聚合 — 本 change 实现 API，UI 角标可选
- [ ] Member 端公告 — 后续 change
