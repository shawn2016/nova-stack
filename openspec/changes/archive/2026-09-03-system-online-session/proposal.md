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
