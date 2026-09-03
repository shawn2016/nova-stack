# notice-message-api Specification

## Purpose
Provides Admin REST APIs for in-site point-to-point messages between system users: send, inbox, sent box, read status, and unread counts.

## Requirements

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
