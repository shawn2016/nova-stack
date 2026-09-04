# Comet Design Handoff

- Change: ip-blacklist
- Phase: design
- Mode: compact
- Context hash: 02e839b9fd329191bcf02fae61f4feedef90a6360e595064c103b0b4bc53f740

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/ip-blacklist/proposal.md

- Source: openspec/changes/ip-blacklist/proposal.md
- Lines: 1-29
- SHA256: ae93987bd300d931be3cc5fe1d8629a6675fe74a922c3879c2c17b90ff10d373

```md
## 背景与动机

当前 API 缺少统一的 IP 访问控制能力：登录接口无法自动抵御暴力猜密码，遇到爬虫或恶意扫描只能依赖防火墙，无法在后台快速封禁。需要在应用层提供 **自动 + 手动 IP 黑名单**，作为安全应急手段，配置即时生效、无需重启服务。

## 变更内容

- 新增 **IP 黑名单模块**：MySQL 持久化 + Redis 运行时缓存，全局 Middleware 拦截
- **登录暴力防护**：同一 IP 在窗口期内登录失败超阈值 → 自动临时封禁
- **Admin 手动封禁**：后台 CRUD 黑名单 IP，立即拒绝访问整个 API
- **白名单**：本地/内网 IP（如 127.0.0.1）默认不封禁
- 配置项：失败阈值、窗口时长、自动封禁时长（可环境变量或站点配置扩展）

## 能力范围

### 新增能力

- `ip-blacklist-api`：黑名单 CRUD、全局拦截、登录失败计数与自动封禁
- `ip-blacklist-admin-ui`：Admin 黑名单管理页（列表、新增、解除、手动封禁）

### 修改能力

- `auth-api`：登录失败时触发 IP 失败计数；被封禁 IP 登录直接拒绝

## 影响范围

- **新增**：`server` ip-blacklist 模块、Entity、Middleware、Admin 页面
- **修改**：`auth` 登录流程、`packages/shared-types`、RBAC seed（权限 + 菜单）
- **依赖**：现有 Redis（计数与热路径缓存）
- **非目标**：IPv6/CIDR、WAF/CDN 层、会员端独立策略（MVP 全局拦截）

```

## openspec/changes/ip-blacklist/design.md

- Source: openspec/changes/ip-blacklist/design.md
- Lines: 1-79
- SHA256: a065e164b0e0b087a42f235fe2ab8a1bb8c05857eb266d4a9376cf8f97f9bbbf

```md
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

```

## openspec/changes/ip-blacklist/tasks.md

- Source: openspec/changes/ip-blacklist/tasks.md
- Lines: 1-34
- SHA256: c8b6140401b81bfae59a577e1e110ab18f1d96ecf8c6f8c43c699f0395674f2b

```md
# ip-blacklist 任务清单

## 1. 数据模型与 shared-types

- [ ] 1.1 新增 `IpBlacklist` Entity（ip、source、status、expiresAt、remark、createdBy）
- [ ] 1.2 `@nova/shared-types` 类型与 DTO（列表/创建/响应）
- [ ] 1.3 seed：权限 `security:ip-blacklist:*` + 菜单 `/system/ip-blacklist`

## 2. Server API 与拦截

- [ ] 2.1 `IpBlacklistModule`：Service（CRUD + Redis 同步 + 白名单）
- [ ] 2.2 `IpBlacklistMiddleware` 全局注册，403 拦截
- [ ] 2.3 登录失败计数与自动封禁（接入 `AuthService.login`）
- [ ] 2.4 `GET/POST/DELETE/PUT` `/security/ip-blacklist` + RBAC
- [ ] 2.5 配置项：阈值、窗口、封禁时长、白名单（env 或常量 MVP）

## 3. Admin UI

- [ ] 3.1 `/system/ip-blacklist` 列表页（ArtListPanel + search）
- [ ] 3.2 新增/删除对话框，`v-permission` 与后端码一致
- [ ] 3.3 API 封装与路由注册

## 4. 测试与验证

- [ ] 4.1 API e2e：手动封禁 → 403；解除 → 恢复；自动封禁触发
- [ ] 4.2 seed 后 Admin 冒烟（可选 browser scenario）
- [ ] 4.3 `pnpm lint` + server test

## 5. 验收标准

- [ ] 暴力登录触发自动封禁，该 IP 后续 API 403
- [ ] Admin 手动添加 IP 立即生效
- [ ] Admin 删除记录后 IP 恢复
- [ ] 本地回环地址（loopback）不被自动封禁

```

## openspec/changes/ip-blacklist/specs/auth-api/spec.md

- Source: openspec/changes/ip-blacklist/specs/auth-api/spec.md
- Lines: 1-13
- SHA256: d165ddfa77fa2c1ce006ca7502f4a7abce9c7fc0ab5061f7b0434f708b222876

```md
## ADDED Requirements

### Requirement: 登录接口配合 IP 自动封禁

Admin 登录接口 MUST 在返回 401 前通知 IP 黑名单模块记录一次失败；若 IP 已处于封禁状态 MUST 直接返回 403 且 MUST NOT 校验密码。

#### Scenario: 已封禁 IP 尝试登录
- **WHEN** 黑名单中的 IP 调用 `POST /auth/login`
- **THEN** 返回 403，不暴露用户名是否存在

#### Scenario: 登录失败计入暴力计数
- **WHEN** 未封禁 IP 提交错误密码导致 401
- **THEN** 该 IP 登录失败计数 +1（供自动封禁模块使用）

```

## openspec/changes/ip-blacklist/specs/ip-blacklist-admin-ui/spec.md

- Source: openspec/changes/ip-blacklist/specs/ip-blacklist-admin-ui/spec.md
- Lines: 1-37
- SHA256: b791a6bdce478c37c6b73ea9272f054529a3e07bad853b14331e5bdf39f25c00

```md
## Purpose

为运维/管理员提供 IP 黑名单的可视化管理：查看封禁记录、手动添加恶意 IP、解除误封，支撑安全应急操作。

## ADDED Requirements

### Requirement: 黑名单列表页

Admin MUST 提供「IP 黑名单」菜单页，展示 IP、来源（自动/手动）、状态、过期时间、备注、创建时间，并支持分页与刷新。

#### Scenario: 进入列表页
- **WHEN** 具备 `security:ip-blacklist:list` 的管理员打开 `/system/ip-blacklist`
- **THEN** 表格加载黑名单数据

#### Scenario: 无权限隐藏入口
- **WHEN** 当前用户无 list 权限
- **THEN** 侧栏不展示该菜单（或页面不可访问）

### Requirement: 手动添加封禁

Admin MUST 支持通过表单添加 IPv4 黑名单，可填备注与过期时间；**过期时间为空表示永久封禁**。

#### Scenario: 新增成功
- **WHEN** 用户填写合法 IP 并提交
- **THEN** 列表刷新且该 IP 立即被封禁

#### Scenario: 取消不提交
- **WHEN** 用户在弹窗点击取消
- **THEN** 不创建记录

### Requirement: 解除封禁

Admin MUST 支持删除或停用黑名单记录以解除封禁。

#### Scenario: 删除确认后解除
- **WHEN** 用户点击删除并确认
- **THEN** 记录移除，对应 IP 可再次访问

```

## openspec/changes/ip-blacklist/specs/ip-blacklist-api/spec.md

- Source: openspec/changes/ip-blacklist/specs/ip-blacklist-api/spec.md
- Lines: 1-61
- SHA256: 96a9b74ddfcdf424fea1c5630352231953a0836e56c4872ac8caf0ff3085fa1b

```md
## Purpose

提供 IP 黑名单的持久化、运行时拦截、登录暴力自动封禁及 Admin 管理 API，在应用层拒绝恶意 IP 访问。

## ADDED Requirements

### Requirement: 全局 IP 拦截

系统 MUST 在 HTTP 请求进入业务逻辑前检查客户端 IP 是否处于有效封禁状态；若封禁中 MUST 返回 403 且 MUST NOT 执行后续 Controller。

#### Scenario: 黑名单 IP 被拒绝
- **WHEN** 客户端 IP 存在于有效黑名单（未过期且启用）
- **THEN** 返回 403，响应体含封禁原因摘要

#### Scenario: 非黑名单 IP 正常通过
- **WHEN** 客户端 IP 不在黑名单或记录已过期/停用
- **THEN** 请求继续进入 Nest 管道

#### Scenario: 白名单 IP 不被拦截
- **WHEN** 客户端 IP 为配置的白名单（含 127.0.0.1）
- **THEN** 即使存在黑名单记录也不拦截（或自动封禁跳过白名单）

### Requirement: 登录失败自动封禁

系统 MUST 在 Admin 登录失败（401）时递增该 IP 的失败计数；在滑动窗口内达到阈值 MUST 自动创建临时黑名单记录。

#### Scenario: 未达阈值仅计数
- **WHEN** 同一 IP 在窗口内登录失败但未达阈值
- **THEN** 不写入黑名单，后续非登录请求仍可访问

#### Scenario: 达阈值自动封禁
- **WHEN** 同一 IP 在 5 分钟内登录失败达到配置阈值（默认 10 次）
- **THEN** 自动写入黑名单（source=auto，expiresAt=now+封禁时长），后续该 IP 全部请求 403

### Requirement: 黑名单 CRUD API

系统 MUST 提供 Admin 鉴权下的黑名单管理 API：分页列表、手动添加、删除/解除、启停状态。

#### Scenario: 手动添加 IP
- **WHEN** 具备权限的管理员 POST 合法 IPv4 与可选备注、过期时间
- **THEN** 返回 201，记录 source=manual，并即时生效拦截

#### Scenario: 解除封禁
- **WHEN** 管理员 DELETE 某黑名单记录
- **THEN** 记录删除且 Redis 缓存清除，该 IP 恢复访问

#### Scenario: 无权限拒绝
- **WHEN** 无 `security:ip-blacklist:create` 权限调用写接口
- **THEN** 返回 403

#### Scenario: health 探针不受拦截
- **WHEN** 客户端 IP 处于封禁状态且请求 `GET /health`
- **THEN** 返回 200，不执行 IP 黑名单拦截

#### Scenario: 非法 IP 格式拒绝
- **WHEN** 管理员 POST 非 IPv4 字面量（如 CIDR 或域名）
- **THEN** 返回 400，不创建记录

#### Scenario: Redis 不可用时降级
- **WHEN** Redis 连接不可用且 MySQL 存在有效封禁记录
- **THEN** Middleware 仍通过 DB 判定并返回 403

```
