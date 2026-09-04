---
change: ip-blacklist
design-doc: docs/superpowers/specs/2026-09-04-ip-blacklist-design.md
base-ref: cff02908fc090a65eb885a01362fc3620ee209e3
---

# ip-blacklist 实施计划

**Goal:** 应用层 IP 黑名单——全局 403 拦截、登录暴力自动封禁、Admin CRUD 管理页。

**Architecture:** shared-types + Entity → Service/Middleware → Auth 接入 → REST API + seed → Admin UI → e2e

## Global Constraints

- 分支：`comet/ip-blacklist`（已存在）
- MVP 仅 IPv4 字面量；不做 CIDR/IPv6
- 默认阈值：5min/10 次失败 → 封禁 30min
- 白名单：127.0.0.1, ::1

---

## Task 1: 数据模型与 shared-types

**Files:**
- Create: `server/src/database/entities/sys-ip-blacklist.entity.ts`
- Modify: `server/src/database/entities/index.ts`
- Create: `packages/shared-types/src/ip-blacklist.ts`
- Modify: `packages/shared-types/src/index.ts`

- [x] 1.1 `SysIpBlacklistEntity`（ip unique、source、status、expiresAt、remark、createdBy）
- [x] 1.2 shared-types：`IpBlacklistListItem`、`CreateIpBlacklistDto`、列表结果类型
- [x] 1.3 `pnpm --filter @nova/shared-types build`

## Task 2: 配置与工具函数

**Files:**
- Modify: `server/src/config/configuration.ts`
- Create: `server/src/common/utils/resolve-client-ip.ts`
- Create: `server/src/common/utils/is-ipv4.ts`
- Create: 对应 `.spec.ts`

- [x] 2.1 `ipBlacklistConfig` + env 变量
- [x] 2.2 `resolveClientIp`、`isIpv4` 单元测试

## Task 3: IpBlacklistService + Middleware

**Files:**
- Create: `server/src/modules/ip-blacklist/ip-blacklist.service.ts`
- Create: `server/src/modules/ip-blacklist/ip-blacklist.middleware.ts`
- Create: `server/src/modules/ip-blacklist/ip-blacklist.module.ts`

- [x] 3.1 Service：isBlocked、recordLoginFailure、CRUD、Redis 同步
- [x] 3.2 Middleware 全局注册（exclude GET health）
- [x] 3.3 AppModule import IpBlacklistModule

## Task 4: Auth 接入

**Files:**
- Modify: `server/src/modules/auth/auth.service.ts`
- Modify: `server/src/modules/auth/auth.controller.ts`
- Modify: `server/src/modules/auth/auth.module.ts`

- [x] 4.1 login 开头 isBlocked → 403
- [x] 4.2 401 前 recordLoginFailure
- [x] 4.3 resolveClientIp 统一 IP 解析

## Task 5: REST API + RBAC

**Files:**
- Create: `server/src/modules/ip-blacklist/ip-blacklist.controller.ts`
- Create: DTO 文件
- Modify: `server/src/database/seeds/init.seed.ts`

- [x] 5.1 GET/POST/DELETE/PUT `/security/ip-blacklist`
- [x] 5.2 `@RequirePermission` + PERMISSION_SEEDS + MENU_SEEDS

## Task 6: Admin UI

**Files:**
- Create: `admin/src/views/system/ip-blacklist/index.vue`
- Create: `admin/src/views/system/ip-blacklist/modules/ip-blacklist-dialog.vue`
- Create: `admin/src/api/ip-blacklist.ts`
- Modify: admin 路由注册

- [x] 6.1 ArtListPanel 列表页
- [x] 6.2 新增对话框 + v-permission
- [x] 6.3 `pnpm --filter @nova/admin build`

## Task 7: 测试与验证

**Files:**
- Create: `server/test/ip-blacklist.e2e-spec.ts`

- [x] 7.1 e2e：手动封禁/解除、自动封禁、权限拒绝
- [x] 7.2 `pnpm lint` + server test 全绿
- [x] 7.3 `openspec validate ip-blacklist --strict`
