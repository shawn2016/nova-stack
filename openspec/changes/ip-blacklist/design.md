## 上下文

见 `proposal.md`。项目已有 Redis（JWT 黑名单、在线会话）、登录审计日志（`LoginLogService`），尚无 IP 级访问控制。

## 目标 / 非目标

**目标：**

- 全局 Middleware 在 Nest 入口拦截黑名单 IP，返回 **403**（附简短 reason）
- 登录接口失败计数 → 超阈值自动写入临时黑名单（Redis + DB）
- Admin 可手动添加/删除/启停黑名单记录，变更即时同步 Redis
- 白名单 IP 跳过自动封禁与拦截（127.0.0.1、::1 默认）

**非目标（MVP）：**

- CIDR / IP 段、IPv6 规范化
- 按路径差异化策略（除登录计数外）
- Hub/WAF/CDN 联动

## 技术决策

### D1：双层存储

| 层 | 用途 |
|---|---|
| MySQL `sys_ip_blacklist` | 持久化、来源（manual/auto）、过期时间、备注、操作人 |
| Redis `ip:blacklist:{ip}` | 运行时快速判定；Redis `ip:login-fail:{ip}` 滑动窗口计数 |

手动/自动封禁写入 DB 后刷新 Redis；删除/过期时清除 Redis key。

### D2：拦截点

```
Request → IpBlacklistMiddleware（全局，除 health 可选）
         → 若命中 → 403 Forbidden
         → 否则继续 Nest 管道
```

客户端 IP 解析顺序：`X-Forwarded-For` 首段（若信任代理配置开启）→ `req.ip`。

### D3：自动封禁策略（默认，可配置）

- 窗口：**5 分钟**
- 阈值：**10 次**登录失败（Admin `POST /auth/login`）
- 封禁时长：**30 分钟**
- 仅统计 **401 登录失败**，不计成功

触发后写入 `sys_ip_blacklist`（source=auto, expiresAt）并 set Redis。

### D4：Admin API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/security/ip-blacklist` | 分页列表 |
| POST | `/security/ip-blacklist` | 手动添加 |
| DELETE | `/security/ip-blacklist/:id` | 删除/解除 |
| PUT | `/security/ip-blacklist/:id/status` | 启停 |

权限码：`security:ip-blacklist:list|create|delete|update`。

### D5：Admin UI

`ArtListPanel` CRUD 页 `/system/ip-blacklist`：IP、来源、过期时间、状态、备注；支持手动添加与解除。

### D6：shared-types

新增 `IpBlacklistItem`、列表 DTO、创建 DTO；API 响应走 `@nova/shared-types`。

## 风险与权衡

| 风险 | 缓解 |
|------|------|
| 误封内网/开发机 | 白名单 + Admin 一键解除 |
| 代理后 IP 不准 | 文档说明 `TRUST_PROXY`；MVP 本地 dev 用直连 IP |
| Redis 不可用 | Middleware 降级查 DB；计数失败时只记日志不阻断主流程 |

## 开放问题

- 生产环境是否启用 `X-Forwarded-For` 信任（默认 false，部署文档说明）
