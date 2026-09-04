## Context

nova-stack 是 pnpm monorepo（NestJS + Vue3 Admin + uni-app + shared-types）。业务模块已较完整，但模板遗留与快速迭代导致前后端契约、Guard、DevEx 不一致。本 change 在**不改变业务功能范围**的前提下做 consolidation。

## Goals / Non-Goals

**Goals**
- 单一 HTTP 客户端与 env 体系，消除 dev 404 与生产 Mock 风险
- 后端 Guard/权限/分页/ID 策略统一
- Admin 去除 Art Design Pro 双轨残留
- monorepo onboarding 一条命令链路可用

**Non-Goals**
- uni-app 会员中心等业务新功能
- 引入 Turbo/Nx、OpenAPI codegen（仅预留 DTO implements）
- 数据库 schema 变更或 TypeORM migration 文件编写（仅禁用 staging synchronize）
- Hash → History 路由

## Decisions

### 1. API 统一前缀 + Vite 单条 `/api` 代理

**Server**：`app.setGlobalPrefix('api')`；Swagger 挂载为 `/api/docs`；静态 `/uploads` 保持根路径。

**Admin**：
```ts
// VITE_API_BASE_URL=/api
proxy: { '/api': { target: VITE_API_PROXY_URL, changeOrigin: true } }
```

**理由**：接口边界清晰，不会误触 SPA/静态资源；新模块自动生效。

**备选（已否决）**：catch-all 正则 + HTML bypass — 易误触、难调试。

### 2. ID 策略：全局 string

- DB 实体保持 bigint；API/JSON 层统一 `String(id)`
- shared-types 中 RBAC/Article 的 `id: number` 改为 `id: string`

**理由**：JSON 精度安全；与 dict/audit 已有实践一致。

### 3. Guard 重构：CoreModule + 装饰器

- 从 `app.module.ts` 统一注册：`JwtAuthGuard` → `AdminAuthGuard`/`MemberAuthGuard` → `PermissionGuard`
- 删除 `RolesGuard`（无 `@Roles` 使用）
- `@AdminOnly()` 替代 `AdminAuthGuard` 路径前缀白名单
- `@Public()` 保持跳过 JWT

**理由**：新 Controller 默认 admin，member 路由显式标注，消除硬编码列表。

### 4. RBAC 分页：对齐 dict/article 模式

- `ListUsersDto` / `ListRolesDto` / `ListMenusDto` extends `PaginationDto` + keyword
- Service 使用 QueryBuilder `skip/take`
- Admin `system-manage.ts` 删除客户端 `filterPaginated`

### 5. HTTP 层：仅保留 `api/request.ts`

- `utils/http/index.ts` 标记 deprecated 或删除；WangEditor 改 `api/upload.ts`
- 路由守卫错误判断改用 `ErrorCode` / 统一 HttpError

### 6. Permission 缓存

- request-scoped Map：`userId → permissions[]`，同一请求内复用
- 后续可扩展 Redis TTL（本 change 不强制）

### 7. DevEx

- `shared-types`: `"dev": "tsc --watch"`
- 根 `dev`: concurrently shared-types dev + server + admin
- `postinstall`: build shared-types
- `docker-compose.yml`: mysql:8 + redis:7，端口与 .env.example 对齐

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| ID string 破坏现有 Admin 比较 | 全量 grep 替换；e2e 覆盖 |
| catch-all proxy 误转发静态资源 | bypass accept text/html + 明确 exclude |
| Guard 顺序变更导致 403 | e2e auth/rbac 全跑；逐模块验证 |
| 改动面大、单 change 周期长 | tasks 分 Phase 勾选；Verify 分阶段检查 |

## Migration Plan

1. Phase 1 合并后可独立验证 dev 环境
2. Phase 2 需 Admin Phase 3 分页改动配合（可同 PR 内顺序执行）
3. 部署前：更新 `.env.production`、确认 CORS_ORIGINS
4. 无需 DB migration；seed 不变

## Open Questions

- Dashboard 保留 mock 还是接真实统计 API？→ 本 change **隐藏或占位**，不接新 API
- frontend 路由模式是否保留？→ 保留代码，backend 模式为默认
