## 1. 数据模型与 shared-types

- [x] 1.1 `sys_notice`、`sys_notice_read`、`sys_message` 实体 + 注册 — 验证：建表成功
- [x] 1.2 shared-types `notice.ts`（Notice/Message DTO、ListItem） — 验证：编译通过

## 2. Server 通知公告 API

- [x] 2.1 NoticeModule：CRUD + publish + my + read + unread-count — 验证：e2e
- [x] 2.2 删除约束（已发布不可删）— 验证：e2e 边界

## 3. Server 站内消息 API

- [x] 3.1 MessageModule：inbox/sent/send/read — 验证：e2e
- [x] 3.2 权限与收件人校验 — 验证：e2e 403/404

## 4. Seed 与 RBAC

- [x] 4.1 permissions + 菜单 seed + dev 示例数据 — 验证：seed.spec

## 5. Admin UI

- [x] 5.1 `admin/src/api/notice.ts` — 验证：类型编译
- [x] 5.2 通知公告管理页 — 验证：dev smoke CRUD + 发布
- [x] 5.3 消息中心页 — 验证：收发 + 标记已读

## 6. 集成验证

- [x] 6.1 server test + e2e、admin build — 验证：全绿
- [x] 6.2 openspec validate system-notice --strict — 验证：通过
