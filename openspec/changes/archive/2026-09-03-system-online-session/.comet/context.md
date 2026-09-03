# Comet Design Handoff

- Change: system-online-session
- Phase: design
- Mode: compact
- Context hash: 8f3cbc8dfbfe45dcd7580744f700de4822b975f5046c9a50b9311ebecb1c371a

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/system-online-session/proposal.md

- Source: openspec/changes/system-online-session/proposal.md
- Lines: 1-35
- SHA256: d537f0181a1b1d04013a051068b5a04e27a4f592f3c97d2698bbab0836823da6

```md
## Why

Admin 已具备 JWT 登录/登出与 Redis 黑名单，但缺少**在线用户监控**与**强制踢下线**能力。运维与安全场景需要查看当前活跃会话并按会话强制失效。这是 System/Infra 扩展批次**第 5 项**，采用与 `system-region` 相同的 Comet 全流程交付。

## What Changes

- **Server — 在线会话注册**：Admin 登录成功后在 Redis 记录会话（userId、username、ip、userAgent、loginAt、tokenId）
- **Server — 在线用户 API**：分页列表查询当前在线 Admin 会话；按 tokenId 强制踢下线（黑名单 + 清理会话）
- **Server — 登出/过期清理**：主动 logout 或 token 失效时移除在线记录
- **shared-types**：OnlineSession 列表项、Kick 响应类型
- **Admin — 在线用户页**：表格展示在线会话 + 踢下线操作
- **RBAC 扩展**：在线用户 list/kick 权限码与菜单 seed

## Capabilities

### New Capabilities

- `online-session-api`: 在线会话 Redis 追踪、列表、强制踢下线
- `online-session-admin-ui`: Admin 在线用户管理页

### Modified Capabilities

- （无）— auth 登出行为扩展由 online-session-api delta 描述，不修改既有 auth spec 文件

## Impact

- **主要影响**：`server/src/modules/auth/`、`server/src/modules/online-session/`（新建）、`server/src/common/jwt/`、`server/src/database/seeds/`、`admin/src/views/system/online-session/`、`packages/shared-types/`
- **不影响**：Member 端在线会话（后续按需扩展）、定时任务/短信/邮件 infra 模块

## Non-Goals

- Member/C 端在线用户监控
- WebSocket 实时推送在线人数
- 会话地理定位、设备指纹
- 单用户「踢全部设备」批量操作（MVP 仅按会话 tokenId 踢下线）

```

## openspec/changes/system-online-session/design.md

- Source: openspec/changes/system-online-session/design.md
- Lines: 1-50
- SHA256: d383a838a5f06815682349de46e9d223b9889523add8c31035077818133a270e

```md
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

```

## openspec/changes/system-online-session/tasks.md

- Source: openspec/changes/system-online-session/tasks.md
- Lines: 1-18
- SHA256: c1e4a0bcdfcde30bf4bbe44e7ea54e21656e0254cf57dd3865db51948884026a

```md
## 1. shared-types 与 Redis 会话模型

- [ ] 1.1 OnlineSession 类型 + 导出 — 验证：shared-types test
- [ ] 1.2 OnlineSessionService register/remove/list/kick — 验证：unit/e2e

## 2. Server API

- [ ] 2.1 Auth login/logout 挂钩会话注册/清理 — 验证：e2e
- [ ] 2.2 GET /sessions/online + DELETE kick — 验证：e2e
- [ ] 2.3 RBAC 权限 + 模块开关 seed — 验证：seed.spec

## 3. Admin UI

- [ ] 3.1 在线用户页（列表 + 踢下线）— 验证：admin build

## 4. 集成验证

- [ ] 4.1 全量 test/build + openspec validate — 验证：通过

```

## openspec/changes/system-online-session/specs/online-session-admin-ui/spec.md

- Source: openspec/changes/system-online-session/specs/online-session-admin-ui/spec.md
- Lines: 1-16
- SHA256: d3df805b6872bf99202ea7ad73978e9821faecda03fba0370b9d051a4820441e

```md
## ADDED Requirements

### Requirement: 在线用户管理页
Admin MUST 提供在线用户页面，展示会话列表并支持踢下线。

#### Scenario: 查看在线列表
- **WHEN** 有 `system:session:list` 的用户打开 `/system/online-session`
- **THEN** 展示 username、ip、登录时间等列

#### Scenario: 踢下线操作
- **WHEN** 有 `system:session:kick` 的用户点击踢下线
- **THEN** 调用 kick API 并刷新列表

#### Scenario: 当前会话不可踢
- **WHEN** 列表含当前用户会话
- **THEN** 该行踢下线按钮禁用或隐藏

```

## openspec/changes/system-online-session/specs/online-session-api/spec.md

- Source: openspec/changes/system-online-session/specs/online-session-api/spec.md
- Lines: 1-34
- SHA256: a7dd35ce8f1bf299890ddaa95a2076f974264cbf364ecf72b0a9cda994086e58

```md
## ADDED Requirements

### Requirement: 在线会话注册
Admin 登录成功后，系统 MUST 在 Redis 记录在线会话，含 userId、username、ip、userAgent、loginAt、tokenId（access jti）。

#### Scenario: 登录注册会话
- **WHEN** Admin POST `/auth/login` 成功
- **THEN** Redis 存在 `online:admin:{jti}` 且含 username 与 ip

#### Scenario: 登出清理会话
- **WHEN** Admin POST `/auth/logout` 且 token 有效
- **THEN** 对应 `online:admin:{jti}` 被删除

### Requirement: 在线用户列表
系统 MUST 提供 GET `/sessions/online` 返回当前在线 Admin 会话分页列表；需 `system:session:list` 权限。

#### Scenario: 查询在线用户
- **WHEN** 有权限用户 GET `/sessions/online`
- **THEN** 返回含 tokenId、username、ip、loginAt 的 list

#### Scenario: 模块关闭
- **WHEN** `online_session.module.enabled=false`
- **THEN** 列表返回空且登录不注册会话

### Requirement: 强制踢下线
系统 MUST 提供 DELETE `/sessions/online/:tokenId` 强制踢指定会话；需 `system:session:kick` 权限。

#### Scenario: 踢下线成功
- **WHEN** 有权限用户 DELETE 他人会话 tokenId
- **THEN** 会话 key 删除且 jti 进入黑名单；被踢 token 后续请求 401

#### Scenario: 禁止踢自己
- **WHEN** 用户 DELETE 当前自身 tokenId
- **THEN** 返回 400

```
