# Comet Design Handoff

- Change: init-monorepo-scaffold
- Phase: design
- Mode: compact
- Context hash: 7158cb01633fcbadf14c7021e4fdf5642db764e8dc482fe9faa83e15c2136ea4

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/init-monorepo-scaffold/proposal.md

- Source: openspec/changes/init-monorepo-scaffold/proposal.md
- Lines: 1-35
- SHA256: 37c3ce252f0042bef00687dcbfdbf8c38765b14b764086ba102d475465c822d2

```md
## Why

当前 `nova-stack` 仓库仅有 Comet/OpenSpec 基础设施，缺少 `admin/`、`uni-app/`、`server/` 三端工程与 pnpm monorepo 骨架。没有统一脚手架，后续鉴权/RBAC 与业务模块无法按既定技术栈并行开发。现在需要先落地可运行的三端基础工程，为后续 change 提供稳定起点。

## What Changes

- 初始化 **pnpm monorepo** 根工程（workspace、eslint、prettier、共享 TS 配置）
- 创建 **`server/`** NestJS 基础工程：MySQL8 + TypeORM + Redis 连接骨架、Swagger、JWT 模块占位、RBAC 模块占位、class-validator 全局校验
- 创建 **`admin/`** Arco Design Pro Vue 管理端：Vue3 + Vite + TS + Pinia + VueRouter4 + Axios + UnoCSS 基础路由与布局骨架
- 创建 **`uni-app/`** 多端应用：UniApp Vue3 + Vite + TS + uview-plus + Pinia 基础页面骨架（微信小程序 + H5）
- 建立 **前后端 TS 类型对齐** 机制（共享 types 包或约定目录）
- 添加 **根级 README** 与本地开发启动说明
- 本 change **不包含** 完整鉴权业务逻辑、RBAC 菜单数据、具体业务 CRUD（留给后续 change）

## Capabilities

### New Capabilities

- `monorepo-workspace`: pnpm workspace 根配置、共享 lint/format/tsconfig、根脚本与开发文档
- `server-scaffold`: NestJS 后端基础工程、数据库/Redis 连接骨架、Swagger、JWT/RBAC 模块占位
- `admin-scaffold`: Arco Design Pro Vue 管理端基础工程、路由/布局/Axios 封装骨架
- `uni-app-scaffold`: uni-app 多端基础工程、uview-plus 集成、Pinia 与请求封装骨架
- `shared-types`: 前后端共享 TypeScript 类型包或约定，支撑 API 契约对齐

### Modified Capabilities

（无 — 当前无既有 spec）

## Impact

- **新增目录**: `admin/`、`uni-app/`、`server/`、`packages/`（如 shared-types）
- **新增配置**: 根 `package.json`、`pnpm-workspace.yaml`、eslint/prettier、各子包独立配置
- **依赖**: NestJS、TypeORM、Redis、Vue3、Arco Design Pro、uni-app、uview-plus 等
- **后续 change 依赖**: `auth-rbac-module`（鉴权/RBAC）、`demo-business-module`（示例业务）将基于本脚手架扩展
- **无破坏性变更**: 当前仓库无既有业务代码

```

## openspec/changes/init-monorepo-scaffold/design.md

- Source: openspec/changes/init-monorepo-scaffold/design.md
- Lines: 1-129
- SHA256: c9ea42f1630c2525c4fee95c33f0780632b613376b3579d2a53fc5a76e1fca7b

[TRUNCATED]

```md
## Context

仓库当前仅有 Comet/OpenSpec 基础设施，无 `admin/`、`uni-app/`、`server/` 目录。目标是以 pnpm monorepo 组织三端工程，技术栈见 proposal.md。本 design 聚焦脚手架层架构决策，深度技术设计（鉴权流程、RBAC 数据模型）留给后续 change。

## Goals / Non-Goals

**Goals:**
- 建立可独立启动/编译的三端基础工程
- 统一 monorepo 工具链（pnpm、eslint、prettier、TS）
- server 端集成 TypeORM + Redis + Swagger + JWT/RBAC 占位
- 建立 `packages/shared-types` 供三端引用
- 提供清晰的本地开发文档

**Non-Goals:**
- 完整登录/登出/Token 刷新业务逻辑
- RBAC 菜单/按钮权限数据与前端动态路由
- 具体业务 CRUD 模块
- CI/CD 流水线
- Docker 部署配置

## Decisions

### 1. Monorepo 工具：pnpm workspace

**选择**: pnpm workspace + 根 `package.json` scripts

**理由**: 用户指定 pnpm monorepo；pnpm 磁盘效率高，workspace 协议支持子包互相引用

**备选**: npm workspaces / turborepo — 暂不引入 turborepo，首 change 保持最小复杂度

### 2. 目录结构

```
nova-stack/
├── admin/              # Arco Design Pro Vue
├── uni-app/            # UniApp 多端
├── server/             # NestJS
├── packages/
│   └── shared-types/   # 共享 TS 类型
├── pnpm-workspace.yaml
├── package.json
├── eslint.config.js
└── README.md
```

### 3. Server 架构

**选择**: NestJS 模块化结构

```
server/src/
├── main.ts
├── app.module.ts
├── config/             # 环境配置（@nestjs/config）
├── common/             # 全局过滤器、拦截器、DTO 基类
├── modules/
│   ├── auth/           # JWT 占位（guard/strategy/service 骨架）
│   ├── rbac/           # RBAC 占位（guard/decorator 骨架）
│   └── health/         # 健康检查
└── database/           # TypeORM entities 占位
```

**技术选型**:
- TypeORM + mysql2（MySQL8）
- ioredis（Redis）
- @nestjs/swagger + swagger-ui-express
- class-validator + class-transformer 全局 ValidationPipe
- @nestjs/jwt 占位（不实现完整 auth flow）

### 4. Admin 架构

**选择**: 基于 Arco Design Pro Vue 脚手架裁剪

```
admin/src/
├── main.ts
├── App.vue
├── router/             # 基础路由（login、layout、404）
├── store/              # Pinia（user、app 占位）
├── api/                # Axios 封装

```

Full source: openspec/changes/init-monorepo-scaffold/design.md

## openspec/changes/init-monorepo-scaffold/tasks.md

- Source: openspec/changes/init-monorepo-scaffold/tasks.md
- Lines: 1-42
- SHA256: 41828e26f9ae557548561c99d964eff118533a8143307ed52526ddfa9067a019

```md
## 1. Monorepo 根工程

- [ ] 1.1 创建根 `package.json`、`pnpm-workspace.yaml`，纳入 `admin`、`uni-app`、`server`、`packages/*` — 验证：`pnpm install` 成功
- [ ] 1.2 配置根级 eslint + prettier + 共享 tsconfig — 验证：根 lint 脚本可执行
- [ ] 1.3 编写根 `README.md`（目录说明、前置依赖、启动步骤） — 验证：文档包含三端分工与技术栈

## 2. 共享类型包

- [ ] 2.1 创建 `packages/shared-types`，导出 `ApiResponse`、`PaginationParams`、`PaginationResult`、`ErrorCode` — 验证：包可被 workspace 引用且 `tsc` 通过
- [ ] 2.2 在 server/admin/uni-app 的 package.json 中添加 `shared-types: workspace:*` 依赖 — 验证：三端 import 共享类型编译通过

## 3. Server 脚手架

- [ ] 3.1 初始化 NestJS 工程（`server/`），配置 `@nestjs/config` 环境变量加载 — 验证：`pnpm --filter server start:dev` 启动成功
- [ ] 3.2 集成 TypeORM + MySQL8 连接配置与 Health 模块 — 验证：配置有效 DB 时启动无连接错误
- [ ] 3.3 集成 Redis（ioredis）连接配置 — 验证：配置有效 Redis 时启动无连接错误
- [ ] 3.4 启用 Swagger（@nestjs/swagger）并注册示例 Controller — 验证：Swagger UI 可访问
- [ ] 3.5 创建 AuthModule 占位（JWT strategy/guard/service 骨架，不含完整登录逻辑） — 验证：模块加载无报错
- [ ] 3.6 创建 RbacModule 占位（RolesGuard/decorator 骨架） — 验证：模块加载无报错
- [ ] 3.7 启用全局 ValidationPipe（class-validator） — 验证：非法 DTO 返回 400
- [ ] 3.8 提供 `server/.env.example` — 验证：包含 DB/Redis/JWT 占位变量

## 4. Admin 脚手架

- [ ] 4.1 初始化 Vue3 + Vite + TS 工程（`admin/`），集成 Arco Design Pro 基础布局 — 验证：开发服务器可访问
- [ ] 4.2 配置 VueRouter4（login、layout、404 路由） — 验证：路由跳转正常
- [ ] 4.3 集成 Pinia（user/app store 占位） — 验证：store 可被组件访问
- [ ] 4.4 封装 Axios request（baseURL、拦截器占位） — 验证：可发起 HTTP 请求
- [ ] 4.5 集成 UnoCSS — 验证：页面可使用 UnoCSS 类名
- [ ] 4.6 提供 `admin/.env.example`（API baseURL） — 验证：环境变量文档完整

## 5. Uni-app 脚手架

- [ ] 5.1 初始化 uni-app Vue3 + Vite 工程（`uni-app/`） — 验证：H5 开发模式可预览
- [ ] 5.2 集成 uview-plus 并创建首页展示组件 — 验证：uview 组件正常渲染
- [ ] 5.3 集成 Pinia 与请求封装（对齐 admin baseURL 配置） — 验证：request 可调用
- [ ] 5.4 验证微信小程序构建命令 — 验证：`build:mp-weixin` 生成产物无致命错误

## 6. 集成验证

- [ ] 6.1 根级 `pnpm dev` 或等价脚本同时启动 server + admin（uni-app 可选） — 验证：三端可并行开发
- [ ] 6.2 运行 `openspec validate init-monorepo-scaffold --strict` — 验证：change 校验通过

```

## openspec/changes/init-monorepo-scaffold/specs/admin-scaffold/spec.md

- Source: openspec/changes/init-monorepo-scaffold/specs/admin-scaffold/spec.md
- Lines: 1-33
- SHA256: 1465cd49874bdc4f63b3ea0e57741da9d438a061308250b48528e91ae22b218a

```md
## Purpose

提供 Arco Design Pro Vue 管理端基础工程，包含路由、布局、状态管理与 HTTP 请求封装骨架。

## ADDED Requirements

### Requirement: Admin 应用可启动
系统 MUST 提供可独立启动的 Vue3 + Vite 管理端应用，默认开发服务器可访问。

#### Scenario: 本地启动 admin
- **WHEN** 开发者启动 admin 子包开发服务器
- **THEN** 浏览器可访问登录/首页布局页面

### Requirement: 路由与布局骨架
系统 MUST 提供基础路由配置（含登录页、主布局、404）及 Arco Design Pro 布局组件集成。

#### Scenario: 路由导航
- **WHEN** 用户访问根路径
- **THEN** 系统展示主布局或重定向至登录页

### Requirement: Pinia 状态管理
系统 MUST 集成 Pinia 并提供 user/app 等 store 占位，供后续鉴权 change 扩展。

#### Scenario: Store 初始化
- **WHEN** 应用启动
- **THEN** Pinia 被正确注册且 store 可被组件访问

### Requirement: Axios 请求封装
系统 MUST 提供 Axios 实例封装（baseURL、请求/响应拦截器占位），支持后续 JWT Token 注入。

#### Scenario: API 请求配置
- **WHEN** 组件通过封装后的 request 发起 HTTP 请求
- **THEN** 请求自动携带配置的 baseURL 与通用 headers

```

## openspec/changes/init-monorepo-scaffold/specs/monorepo-workspace/spec.md

- Source: openspec/changes/init-monorepo-scaffold/specs/monorepo-workspace/spec.md
- Lines: 1-26
- SHA256: 20733c2c23a4e2481f79a7400c9c2a51f8f52fd9fce3b56cf8d360cce9cfc26d

```md
## Purpose

定义 nova-stack 根级 pnpm monorepo 工作区，统一三端子包的依赖管理、代码规范与开发脚本入口。

## ADDED Requirements

### Requirement: pnpm workspace 根配置
系统 MUST 在仓库根目录提供 pnpm workspace 配置，将 `admin/`、`uni-app/`、`server/` 及 `packages/*` 纳入同一 monorepo。

#### Scenario: 根目录安装依赖
- **WHEN** 开发者在仓库根目录执行 `pnpm install`
- **THEN** 所有 workspace 子包的依赖被正确安装且可互相引用

### Requirement: 共享代码规范配置
系统 MUST 在根目录提供 eslint 与 prettier 配置，各子包 MUST 继承或引用根配置。

#### Scenario: 根级 lint 命令
- **WHEN** 开发者在根目录执行 lint 脚本
- **THEN** 所有子包代码规范检查可统一执行

### Requirement: 根级开发文档
系统 MUST 提供 README，说明 monorepo 结构、前置依赖（Node、pnpm、MySQL、Redis）及本地启动步骤。

#### Scenario: 新开发者 onboarding
- **WHEN** 新开发者阅读根 README
- **THEN** 可了解三端目录分工、技术栈与启动顺序

```

## openspec/changes/init-monorepo-scaffold/specs/server-scaffold/spec.md

- Source: openspec/changes/init-monorepo-scaffold/specs/server-scaffold/spec.md
- Lines: 1-40
- SHA256: 420f5c4703019708bfe064fce4c2922956fcbeafc7ffd8aaa29e41dff0b88c27

```md
## Purpose

提供 NestJS 后端基础工程骨架，包含数据库/Redis 连接、Swagger 文档、JWT 与 RBAC 模块占位，供后续鉴权 change 扩展。

## ADDED Requirements

### Requirement: NestJS 应用可启动
系统 MUST 提供可独立启动的 NestJS 应用，默认监听可配置端口，启动后无致命错误。

#### Scenario: 本地启动 server
- **WHEN** 开发者配置环境变量并启动 server 子包
- **THEN** NestJS 应用成功启动并响应健康检查或根路由

### Requirement: 数据库与 Redis 连接骨架
系统 MUST 集成 TypeORM（MySQL8）与 Redis 连接配置，通过环境变量注入连接参数；连接失败时 MUST 输出明确错误。

#### Scenario: 数据库连接配置
- **WHEN** 提供有效的 MySQL 与 Redis 环境变量
- **THEN** 应用启动时成功建立数据库与 Redis 连接

### Requirement: Swagger 自动文档
系统 MUST 暴露 Swagger UI 端点，可浏览已注册的控制器与 DTO 文档。

#### Scenario: 访问 API 文档
- **WHEN** 开发者访问 Swagger UI 路径
- **THEN** 可看到 API 分组与接口列表（含占位接口）

### Requirement: JWT 与 RBAC 模块占位
系统 MUST 提供 AuthModule 与 RbacModule 占位结构（guard/decorator/service 骨架），不含完整业务逻辑。

#### Scenario: 模块注册
- **WHEN** 应用启动
- **THEN** Auth 与 RBAC 模块被正确加载，后续 change 可在占位基础上扩展

### Requirement: 全局参数校验
系统 MUST 启用 class-validator 全局校验管道，非法请求体 MUST 返回 400 及校验错误信息。

#### Scenario: 非法 DTO 提交
- **WHEN** 客户端提交不符合 DTO 约束的请求体
- **THEN** 系统返回 400 及字段级错误描述

```

## openspec/changes/init-monorepo-scaffold/specs/shared-types/spec.md

- Source: openspec/changes/init-monorepo-scaffold/specs/shared-types/spec.md
- Lines: 1-19
- SHA256: be4313c8f76f0576a53526a027bb92c95576342f5ef45feb416e1a836129f9d2

```md
## Purpose

提供前后端共享的 TypeScript 类型定义，确保 API 契约在 admin、uni-app、server 三端对齐。

## ADDED Requirements

### Requirement: 共享 types 包
系统 MUST 提供 `packages/shared-types`（或等价目录）作为 workspace 包，导出 API 通用类型（如 ApiResponse、Pagination、ErrorCode 占位）。

#### Scenario: 子包引用共享类型
- **WHEN** admin 或 server 子包 import 共享 types
- **THEN** TypeScript 编译通过且类型定义一致

### Requirement: API 响应类型约定
共享 types MUST 定义统一 API 响应结构（code、message、data），三端 MUST 引用该结构。

#### Scenario: 响应类型对齐
- **WHEN** server 返回标准响应结构
- **THEN** admin 与 uni-app 可使用相同类型解析响应

```

## openspec/changes/init-monorepo-scaffold/specs/uni-app-scaffold/spec.md

- Source: openspec/changes/init-monorepo-scaffold/specs/uni-app-scaffold/spec.md
- Lines: 1-30
- SHA256: 570c1b13b82ecc877aebf34d04682e0fb69a3be4faf64d1322b5fb0a77955a55

```md
## Purpose

提供 uni-app 多端（微信小程序 + H5）基础工程，集成 uview-plus 与 Pinia，供后续业务页面扩展。

## ADDED Requirements

### Requirement: Uni-app 应用可编译
系统 MUST 提供可编译至微信小程序与 H5 的 uni-app 工程，开发模式可本地预览。

#### Scenario: H5 开发预览
- **WHEN** 开发者启动 uni-app H5 开发模式
- **THEN** 浏览器可访问首页

#### Scenario: 微信小程序编译
- **WHEN** 开发者执行微信小程序构建命令
- **THEN** 生成可导入微信开发者工具的产物

### Requirement: uview-plus 组件库集成
系统 MUST 集成 uview-plus 并完成全局注册，首页 MUST 展示至少一个 uview 组件以验证集成。

#### Scenario: 组件库可用
- **WHEN** 页面使用 uview-plus 组件
- **THEN** 组件正常渲染无报错

### Requirement: Pinia 与请求封装
系统 MUST 集成 Pinia 并提供与 admin 对齐的请求封装占位（baseURL、拦截器占位）。

#### Scenario: 跨端请求
- **WHEN** 页面通过封装 request 发起 API 调用
- **THEN** 请求携带统一 baseURL 配置

```
