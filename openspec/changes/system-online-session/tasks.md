## 1. shared-types 与 Redis 会话模型

- [x] 1.1 OnlineSession 类型 + 导出 — 验证：shared-types test
- [x] 1.2 OnlineSessionService register/remove/list/kick — 验证：unit/e2e

## 2. Server API

- [x] 2.1 Auth login/logout 挂钩会话注册/清理 — 验证：e2e
- [x] 2.2 GET /sessions/online + DELETE kick — 验证：e2e
- [x] 2.3 RBAC 权限 + 模块开关 seed — 验证：seed.spec

## 3. Admin UI

- [x] 3.1 在线用户页（列表 + 踢下线）— 验证：admin build

## 4. 集成验证

- [x] 4.1 全量 test/build + openspec validate — 验证：通过
