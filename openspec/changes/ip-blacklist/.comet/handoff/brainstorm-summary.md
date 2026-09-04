# Brainstorm Summary

- Change: ip-blacklist
- Date: 2026-09-04

## 确认的技术方案

**分类**：Architectural（新安全子系统，全局 Middleware + 新模块 + Admin UI）

**采用方案：MySQL 持久化 + Redis 热路径 + 全局 Middleware（Open 阶段 D1–D6）**

| 组件 | 职责 |
|------|------|
| `sys_ip_blacklist` | 持久化：ip、source(manual/auto)、status、expiresAt、remark、createdBy |
| Redis `ip:blacklist:{ip}` | 运行时 O(1) 判定；TTL 与 expiresAt 对齐 |
| Redis `ip:login-fail:{ip}` | INCR + EXPIRE 实现 5 分钟滑动窗口失败计数 |
| `IpBlacklistMiddleware` | 全局拦截（排除 `GET /health`），403 + reason |
| `IpBlacklistService` | CRUD、缓存同步、白名单、自动封禁触发 |
| `AuthService.login` | 封禁 IP 直接 403；401 前 `recordLoginFailure(ip)` |

**客户端 IP**：新增 `resolveClientIp(req)`；`TRUST_PROXY=true` 时取 `X-Forwarded-For` 首段，否则 `req.ip ?? socket.remoteAddress`；MVP 不做 IPv6/CIDR 规范化，仅校验 IPv4 字面量。

**默认阈值**（env 可覆盖）：窗口 300s、失败 10 次、封禁 1800s；白名单 `127.0.0.1,::1`。

**Middleware 注册**：`IpBlacklistModule implements NestModule`，`consumer.apply(...).exclude('health').forRoutes('*')`；在 `AppModule` imports 中置于 Auth 之前加载。

## 候选方案与取舍

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| A. MySQL + Redis + Middleware **（采用）** | 审计可追溯、与现有 Redis 模式一致、全局最早拦截 | 需缓存一致性 | ✅ |
| B. 仅 Redis | 实现快 | 无持久化、重启丢记录、不符合应急审计 | ❌ |
| C. APP_GUARD 替代 Middleware | 复用 Nest DI | 晚于路由、登录等路径难统一、与 JWT Guard 顺序复杂 | ❌ |

## 关键取舍与风险

- **误封**：白名单 + Admin 一键 DELETE；E2E 用独立测试 IP（如 `203.0.113.1` TEST-NET-3）
- **代理 IP 不准**：默认 `TRUST_PROXY=false`；部署文档说明生产开启方式
- **Redis 不可用**：Middleware/计数降级查 DB；计数失败只打日志，不阻断登录主流程
- **手动过期时间**：`expiresAt` 为空表示永久；自动封禁必带 expiresAt
- **health 探针**：`GET /api/health` 不拦截，避免 K8s 误判

## 测试策略

1. **API e2e**（`server/test/ip-blacklist.e2e-spec.ts`）：
   - 手动 POST 封禁 → 任意 API 403
   - DELETE 解除 → 200 恢复
   - 模拟 10 次登录 401 → 自动封禁 → 403
   - 白名单 IP 不计数、不拦截
   - 无权限写接口 403
2. **单元**：`resolveClientIp`、`isWhitelisted`、IPv4 校验
3. **lint + shared-types build**；Admin 页可选 browser scenario（非 MVP 阻塞）

## Spec Patch

- `ip-blacklist-api/spec.md`：补充 health 豁免、IPv4 校验、Redis 降级场景
- `ip-blacklist-admin-ui/spec.md`：明确 `expiresAt` 空=永久封禁
