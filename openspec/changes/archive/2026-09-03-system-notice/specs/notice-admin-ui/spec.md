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
