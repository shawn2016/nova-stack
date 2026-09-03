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
