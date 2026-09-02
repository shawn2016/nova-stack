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
