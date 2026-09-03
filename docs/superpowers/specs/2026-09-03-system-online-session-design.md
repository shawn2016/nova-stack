---
comet_change: system-online-session
role: technical-design
canonical_spec: openspec
status: draft
---

# system-online-session 深度技术设计

## 1. 架构

```
AuthController.login ──► AuthService ──► OnlineSessionService.register(jti, meta)
AuthController.logout ──► AuthService ──► OnlineSessionService.remove(jti)
OnlineSessionController ──► OnlineSessionService.list / kick
JwtAuthGuard ──► JwtService.isBlacklisted(jti)  # 已有，踢下线复用
```

## 2. Redis 模型

```typescript
// Key: online:admin:{jti}
interface OnlineSessionRecord {
  userId: string;
  username: string;
  ip: string;
  userAgent: string | null;
  loginAt: string; // ISO8601
}
// TTL = access token 剩余秒数
```

模块开关：`online_session.module.enabled`（sys_config，默认 true）

## 3. shared-types

```typescript
export interface OnlineSessionListItem {
  tokenId: string; // jti
  userId: string;
  username: string;
  ip: string;
  userAgent: string | null;
  loginAt: string;
}

export interface KickOnlineSessionResult {
  success: true;
}
```

## 4. OnlineSessionService

- `register(jti, payload, ttlSeconds)` — SETEX
- `remove(jti)` — DEL
- `list(query)` — SCAN + 过滤 keyword（username/ip）+ 分页（内存）
- `kick(tokenId, operatorTokenId)` — 禁止 operatorTokenId === tokenId；blacklist + remove
- `isModuleEnabled()` — 读 config

## 5. Auth 集成

- `issueTokenPair` 后 decode access token 取 jti（或 signAccessToken 返回 jti）
- login 上下文传入 ip/userAgent（已有 LoginContext）
- logout 从 access token 取 jti 并 remove

**JwtService 扩展**：`signAccessToken` 返回 `{ token, jti }` 或新增 `decodeJti(token)` 供 auth 使用

## 6. API

| Method | Path | Permission |
|--------|------|------------|
| GET | `/sessions/online` | system:session:list |
| DELETE | `/sessions/online/:tokenId` | system:session:kick |

Query: `page`, `pageSize`, `keyword?`

## 7. Admin

- 路由 `/system/online-session`
- 表格：username、ip、userAgent、loginAt、操作（踢下线）
- 当前用户 tokenId 从 store 或 `/auth/me` 侧车字段获取 — **简化**：kick API 400 即可，前端踢按钮对所有行展示，失败时提示

**获取当前 jti**：login 响应或 getMe 不暴露 jti；前端通过比对 userId + 最近 login 不可靠。**方案**：GET `/sessions/online` 响应增加 `currentTokenId`（当前请求 token 的 jti），仅 list 接口返回。

## 8. Seed

- permissions: `system:session:list`, `system:session:kick`
- menu: 系统管理 → 在线用户 sort=11
- config: `online_session.module.enabled=true`

## 9. 测试

- e2e: login → list 含会话 → logout → list 不含
- e2e: 用户 A 登录，admin kick A → A 请求 401
- e2e: 禁止 kick 自身 400
- seed.spec: 权限与 config
