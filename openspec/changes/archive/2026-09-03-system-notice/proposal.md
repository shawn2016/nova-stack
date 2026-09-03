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
