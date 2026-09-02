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
├── views/              # 占位页面
└── utils/              # request 拦截器占位
```

**技术**: Vue3 + Vite + TS + Pinia + VueRouter4 + Axios + UnoCSS

### 5. Uni-app 架构

**选择**: uni-app Vue3 + Vite 模板 + uview-plus

```
uni-app/src/
├── pages/              # 首页占位
├── store/              # Pinia
├── api/                # 请求封装
└── utils/
```

**编译目标**: 微信小程序 + H5（首 change 验证 H5 开发模式即可）

### 6. 共享类型

**选择**: `packages/shared-types` 作为独立 workspace 包

导出:
- `ApiResponse<T>`
- `PaginationParams` / `PaginationResult<T>`
- `ErrorCode` 枚举占位

admin/server/uni-app 通过 `"shared-types": "workspace:*"` 引用

### 7. 环境变量

**选择**: 各子包独立 `.env.example`，server 必需 `DB_*`、`REDIS_*`、`JWT_SECRET` 占位

## Risks / Trade-offs

- **[Risk] Arco Design Pro 脚手架体积大** → 裁剪至最小可用布局，不引入示例业务页面
- **[Risk] uni-app 微信小程序编译环境依赖** → 首 change 以 H5 开发模式验证为主，微信编译作为构建命令验证
- **[Risk] 占位模块过多导致后续 change 重构** → 占位保持最小接口，明确标注 `@TODO` 供后续 auth change 扩展
- **[Trade-off] 不引入 turborepo/nx** → 首 change 简单，后续可按需引入构建编排

## Migration Plan

不适用 — 绿色field 初始化，无既有代码迁移。

## Open Questions

（无 — 脚手架层决策已足够支撑 tasks 拆分）
