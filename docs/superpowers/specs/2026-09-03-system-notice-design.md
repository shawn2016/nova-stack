---
comet_change: system-notice
role: technical-design
canonical_spec: openspec
---

# system-notice 深度技术设计

## 1. 架构总览

```
Admin 通知/消息页                    Server NoticeModule
─────────────────                   ───────────────────
notice/index.vue ──CRUD/publish──► NoticeController
message/index.vue ──inbox/send───► MessageController
  未读角标 ◄── GET /notices/unread-count + /messages/unread-count
```

**实施顺序**：实体 + shared-types → Notice API + Message API + e2e → seed → Admin UI → 集成验证

## 2. 数据模型

### sys_notice

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | API string |
| title | varchar(128) | 标题 |
| content | text | 正文 |
| type | tinyint | 1 通知 / 2 公告 |
| status | tinyint | 0 草稿 / 1 已发布 |
| publisher_id | bigint | 发布人 |
| published_at | datetime nullable | 发布时间 |
| created_at / updated_at | datetime | |

### sys_notice_read

| 字段 | 类型 | 说明 |
|------|------|------|
| notice_id | bigint | FK 逻辑 |
| user_id | bigint | 读者 |
| read_at | datetime | 复合 PK (notice_id, user_id) |

### sys_message

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | API string |
| sender_id | bigint | 发件人 |
| receiver_id | bigint | 收件人 |
| title | varchar(128) | |
| content | text | |
| is_read | tinyint | 0/1 |
| read_at | datetime nullable | |
| created_at | datetime | |

## 3. API

### 通知公告 `/notices`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/notices` | list | 管理分页 |
| POST | `/notices` | create | 创建草稿 |
| PUT | `/notices/:id` | update | 更新（草稿全量；已发布仅 title/content） |
| DELETE | `/notices/:id` | delete | 仅草稿 |
| PUT | `/notices/:id/publish` | publish | 发布 |
| GET | `/notices/my` | 登录 | 已发布 + isRead |
| POST | `/notices/:id/read` | 登录 | 标记已读 |
| GET | `/notices/unread-count` | 登录 | 未读数 |

### 站内消息 `/messages`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/messages/inbox` | list | 收件箱 |
| GET | `/messages/sent` | list | 发件箱 |
| POST | `/messages` | send | 发送 |
| PUT | `/messages/:id/read` | list | 收件人标记已读 |
| DELETE | `/messages/:id` | delete | 收件人或发件人删除（硬删 MVP） |
| GET | `/messages/unread-count` | 登录 | 未读数 |

权限码：`system:notice:list|create|update|delete|publish`，`system:message:list|send|delete`

## 4. Admin UI

- `/system/notice` — 参考 dict 分页 CRUD + 发布/状态 Tag
- `/system/message` — Tab 收件箱/发件箱 + 发消息对话框（用户 Select 来自 user list API）
- 菜单：系统管理下「通知公告」「消息中心」

## 5. Seed

- permissions + menus
- dev 示例：1 草稿 + 1 已发布公告；admin → admin 一条未读消息

## 6. 测试

- e2e：notice CRUD/publish/read/unread；message send/inbox/read/403
- seed.spec：权限/菜单计数更新

## 7. 非目标

WebSocket 推送、Member 端、富文本附件 — 后续 change
