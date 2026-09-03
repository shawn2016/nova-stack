---
change: stack-consolidation
design-doc: docs/superpowers/specs/2026-09-03-stack-consolidation-design.md
base-ref: 5a178f6d58994e27fa76e8a50c7d201127c547e5
---

# stack-consolidation 实施计划

> **For agentic workers:** 推荐使用 subagent-driven-development，按 Phase 派发 Task。

**Goal:** 统一 nova-stack 前后端契约、Guard、分页、HTTP/DevEx，消除模板双轨与技术债。

**Architecture:** Phase 1 DevEx → Phase 2 Server → Phase 3 Admin → Phase 4 工程化 → 集成验证

**Spec:** docs/superpowers/specs/2026-09-03-stack-consolidation-design.md

## Global Constraints

- 产物语言：zh-CN
- 分支：`comet/stack-consolidation`
- 不动 uni-app 业务代码（仅 .env.example）
- Phase 2 ID/pagination 与 Phase 3 Admin 同批合并，避免半迁移
- 每 Task 末运行相关 test/build smoke

---

## Task 1: Phase 1 — Vite 代理与 env

- [ ] 1.1 `admin/vite.config.ts` catch-all proxy，删除逐路径规则
- [ ] 1.2 修复 `admin/.env.production`、`.env.example`；`server/.env.example` PORT/CORS
- [ ] 1.3 验证：`curl POST /dict/types` via 5173 非 404

## Task 2: Phase 1 — 单一 HTTP 客户端

- [ ] 2.1 WangEditor 改 `api/upload.ts`；路由守卫移除 utils/http 依赖
- [ ] 2.2 删除或 deprecated `utils/http/index.ts`
- [ ] 2.3 验证：grep 无业务 import `@/utils/http`

## Task 3: Phase 1 — CORS 与 shared-types watch

- [ ] 3.1 `bootstrap.ts` + `configuration.ts` CORS_ORIGINS
- [ ] 3.2 shared-types `dev: tsc --watch`；根 postinstall + dev concurrently
- [ ] 3.3 验证：`pnpm --filter @nova/shared-types build` 通过

## Task 4: Phase 2 — Guard 重构

- [ ] 4.1 删除 RolesGuard；集中 APP_GUARD 到 AppModule
- [ ] 4.2 实现 `@AdminOnly()`；重构 AdminAuthGuard 去硬编码
- [ ] 4.3 验证：server e2e auth 通过

## Task 5: Phase 2 — 权限与 Redis

- [ ] 5.1 Upload `@RequirePermission('system:file:upload')` + seed
- [ ] 5.2 Redis fail-closed isBlacklisted
- [ ] 5.3 PermissionGuard request-scoped 缓存
- [ ] 5.4 验证：e2e upload 403 无权限

## Task 6: Phase 2 — ID 统一 string

- [ ] 6.1 shared-types rbac/article id → string
- [ ] 6.2 server mapper 全模块 String(id)
- [ ] 6.3 验证：shared-types test + server build

## Task 7: Phase 2 — RBAC 真分页

- [ ] 7.1 ListUsersDto/ListRolesDto/ListMenusDto + Service QueryBuilder
- [ ] 7.2 优化 loadRolesAndPermissions JOIN 查询
- [ ] 7.3 验证：e2e users/roles 分页结构

## Task 8: Phase 2 — ValidationPipe 增强

- [ ] 8.1 forbidNonWhitelisted + HttpExceptionFilter 格式化
- [ ] 8.2 验证：e2e 非法字段 400

## Task 9: Phase 3 — Admin RBAC 对接

- [ ] 9.1 `system-manage.ts` 删除 filterPaginated，服务端分页
- [ ] 9.2 user/role views 适配 string id
- [ ] 9.3 验证：dev 用户/角色列表翻页

## Task 10: Phase 3 — Admin 瘦身

- [ ] 10.1 类型迁移 shared-types；userStore 简化
- [ ] 10.2 删除 menusToRoutes；隐藏 register/forget-password
- [ ] 10.3 品牌 Nova Stack；禁用 chat/fireworks
- [ ] 10.4 验证：admin build 通过

## Task 11: Phase 4 — 工程化

- [ ] 11.1 docker-compose.yml
- [ ] 11.2 根 build/test 脚本；README 更新
- [ ] 11.3 ESLint 扩展 server/shared-types
- [ ] 11.4 核心 DTO implements shared-types（auth/rbac）
- [ ] 11.5 验证：docker compose up + README 步骤可 follow

## Task 12: 集成验证

- [ ] 12.1 `pnpm --filter @nova/server test` + `test:e2e`
- [ ] 12.2 `pnpm --filter @nova/admin build`
- [ ] 12.3 手动冒烟：登录/RBAC/字典/上传/审计
- [ ] 12.4 `openspec validate stack-consolidation --strict`
