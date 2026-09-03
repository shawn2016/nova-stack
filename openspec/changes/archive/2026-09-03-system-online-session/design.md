## Context

现有 Admin 认证使用 JWT（access + refresh），Redis 存储 refresh token 与 access jti 黑名单。logout 仅拉黑当前 access token，未维护「谁在线」的可查询视图。

## Goals / Non-Goals

**Goals:**
- 登录时注册在线会话；logout/kick 时清理
- 提供 REST API 列出在线 Admin 会话并强制踢下线
- Admin 管理页与 RBAC 权限

**Non-Goals:**
- Member 端、全站实时在线统计、会话录制

## Decisions

### 1. Redis 会话模型

- Key：`online:admin:{jti}`，Value：JSON `{ userId, username, ip, userAgent, loginAt }`
- TTL：与 access token 过期时间一致（登录时计算）；refresh 续期不新建会话条目
- 列表：`SCAN online:admin:*` + 反序列化；可按 username 内存过滤（MVP 数据量小）

### 2. 踢下线

- `DELETE /sessions/online/:tokenId`：验证会话存在 → `jwt.blacklist(jti)` → `DEL online:admin:{jti}`
- 禁止踢当前操作者自身会话（400），避免管理员误锁自己
- super_admin 会话可被其他 super_admin 踢（同权）

### 3. 与 Auth 集成

- `AuthService.login` 成功后调用 `OnlineSessionService.register`
- `AuthService.logout` 成功后调用 `OnlineSessionService.remove`
- 不改变 refresh 流程；被踢会话的 refresh 在下次使用时因 access 已拉黑而需重新登录

### 4. 模块开关

- `sys_config`：`online_session.module.enabled`，默认 true；false 时跳过注册/list 返回空

## Risks / Trade-offs

- Redis SCAN 在大量 key 时较慢 → MVP 可接受；后续可改 sorted set
- e2e 使用 Mock Redis → 在线会话逻辑与生产一致，测试可覆盖 register/list/kick

## Migration Plan

- 纯增量：新模块 + seed 权限菜单，无 DB migration

## Open Questions

- （无阻塞项）Member 在线会话留待后续 change
