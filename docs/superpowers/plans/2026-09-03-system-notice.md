# system-notice 实施计划

base-ref: 22133c5d7c3bfc1512ff71c86b67d5f220202e74
design: docs/superpowers/specs/2026-09-03-system-notice-design.md

## 任务顺序

- [ ] 1.1 三实体 + shared-types notice.ts + test
- [ ] 2.1 NoticeModule CRUD/publish/my/read/unread-count + e2e
- [ ] 3.1 MessageModule inbox/sent/send/read + e2e
- [ ] 4.1 seed permissions/menus/dev samples + seed.spec
- [ ] 5.1 admin api + notice 管理页 + message 中心页
- [ ] 6.1 全量 test/build + openspec validate

## 参考模块

- dict（CRUD + 分页 + seed）
- region（权限 + 菜单 seed 模式）
- audit-log（列表页 ArtTable 模式）
