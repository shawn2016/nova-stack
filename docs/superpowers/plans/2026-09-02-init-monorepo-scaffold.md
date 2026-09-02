---
change: init-monorepo-scaffold
design-doc: docs/superpowers/specs/2026-09-02-init-monorepo-scaffold-design.md
base-ref: 3476f2b92889036d7f5a67d41f90d6b9a0cf5a47
---

# init-monorepo-scaffold 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 nova-stack 空仓库中初始化 pnpm monorepo 三端脚手架（admin/uni-app/server + shared-types），各端可独立启动/编译。

**Architecture:** CLI 模板生成子工程后迁入 pnpm workspace；server 全局 ApiResponse 拦截器对齐 shared-types；admin/uni-app 请求封装解析同一响应结构；JWT/RBAC 仅占位。

**Tech Stack:** pnpm, NestJS, TypeORM, Redis, Vue3, Vite, Arco Design, uni-app, uview-plus, Pinia, UnoCSS

**Spec:** docs/superpowers/specs/2026-09-02-init-monorepo-scaffold-design.md

## Global Constraints

- 产物语言：zh-CN
- 包命名：@nova/*
- 权限校验以后端为唯一可信源（本 change 仅占位）
- 不实现完整鉴权/RBAC 业务逻辑
- 每完成一个 task 勾选 tasks.md 并提交（用户明确要求时才 commit — 但 comet-build 要求 commit；用户 rule says only commit when requested — conflict with comet-build. Comet build phase requires commits per task. Comet workspace rules take precedence for active comet workflow)

---

## Task 1: Monorepo 根工程

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `README.md`

**Steps:**
- [x] 1.1 创建 `pnpm-workspace.yaml` 和根 `package.json`（name: nova-stack, scripts: dev/dev:all/lint/format）
- [x] 1.2 添加 devDependencies: typescript, eslint, prettier, @eslint/js, concurrently
- [x] 1.3 创建 `tsconfig.base.json` 共享 TS 配置
- [x] 1.4 创建 eslint + prettier 根配置
- [x] 1.5 编写 README.md（目录说明、前置依赖、启动步骤）
- [x] 1.6 运行 `pnpm install` 验证

**Verify:** `pnpm install` 成功，README 包含三端说明

---

## Task 2: @nova/shared-types

**Files:**
- Create: `packages/shared-types/package.json`, `packages/shared-types/tsconfig.json`, `packages/shared-types/src/index.ts`

**Steps:**
- [x] 2.1 创建 workspace 包 `@nova/shared-types`
- [x] 2.2 实现 ApiResponse, PaginationParams, PaginationResult, ErrorCode 导出
- [x] 2.3 配置 tsc 构建输出 dist/
- [x] 2.4 添加简单单元测试验证导出

**Verify:** `pnpm --filter @nova/shared-types build` 成功

---

## Task 3: @nova/server (NestJS)

**Files:**
- Create: `server/` 完整 NestJS 工程

**Steps:**
- [x] 3.1 `nest new server` 或等效初始化，调整为 workspace 包名 `@nova/server`
- [x] 3.2 集成 @nestjs/config + env 校验
- [x] 3.3 集成 TypeORM (mysql2) + DatabaseModule
- [x] 3.4 集成 Redis (ioredis)
- [x] 3.5 启用 Swagger + HealthController
- [x] 3.6 实现 TransformInterceptor + HttpExceptionFilter（ApiResponse 格式）
- [x] 3.7 创建 AuthModule 占位（JwtAuthGuard, @Public(), login→501）
- [x] 3.8 创建 RbacModule 占位（@Roles(), RolesGuard 骨架）
- [x] 3.9 启用全局 ValidationPipe
- [x] 3.10 添加 `@nova/shared-types` 依赖
- [x] 3.11 编写 health e2e 测试
- [x] 3.12 创建 `server/.env.example`

**Verify:** `pnpm --filter @nova/server test:e2e` 通过 health 测试；Swagger UI 可访问

---

## Task 4: @nova/admin (Vue3)

**Files:**
- Create: `admin/` Vue3 + Vite + TS 工程

**Steps:**
- [x] 4.1 初始化 Vite Vue3 TS 项目，包名 `@nova/admin`
- [x] 4.2 集成 @arco-design/web-vue + 图标
- [x] 4.3 实现 DefaultLayout（侧边栏+顶栏）
- [x] 4.4 配置路由：/login, /dashboard, 404
- [x] 4.5 集成 Pinia（user store 占位）
- [x] 4.6 封装 axios request（ApiResponse 解析）
- [x] 4.7 集成 UnoCSS
- [x] 4.8 添加 `@nova/shared-types` 依赖
- [x] 4.9 创建 `admin/.env.example`

**Verify:** `pnpm --filter @nova/admin dev` 可访问；`pnpm --filter @nova/admin build` 成功

---

## Task 5: @nova/uni-app

**Files:**
- Create: `uni-app/` uni-app 工程

**Steps:**
- [x] 5.1 初始化 uni-app Vue3 + Vite + TS
- [x] 5.2 集成 uview-plus + easycom
- [x] 5.3 集成 Pinia
- [x] 5.4 封装 uni.request（ApiResponse 解析）
- [x] 5.5 首页展示 uview 组件
- [x] 5.6 添加 `@nova/shared-types` 依赖
- [x] 5.7 验证 H5 dev + mp-weixin build

**Verify:** `pnpm --filter @nova/uni-app dev:h5` 可预览；build 无致命错误

---

## Task 6: 集成验证

**Steps:**
- [x] 6.1 根 `pnpm dev` 并行启动 server + admin
- [x] 6.2 运行 `openspec validate init-monorepo-scaffold --strict`
- [x] 6.3 勾选 openspec/changes/init-monorepo-scaffold/tasks.md 全部任务

**Verify:** 三端工程完整，change 校验通过
