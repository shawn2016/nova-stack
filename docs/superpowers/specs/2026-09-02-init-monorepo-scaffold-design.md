---
comet_change: init-monorepo-scaffold
role: technical-design
canonical_spec: openspec
archived-with: 2026-09-02-init-monorepo-scaffold
status: final
---

# init-monorepo-scaffold 深度技术设计

## 1. 概述

基于 OpenSpec change `init-monorepo-scaffold`，在空仓库中初始化 pnpm monorepo 三端脚手架。OpenSpec delta spec 为需求事实源，本文档为实现层深度细化。

## 2. Monorepo 工作区

### 2.1 包命名

| 目录 | package name | 说明 |
|------|-------------|------|
| `packages/shared-types` | `@nova/shared-types` | 共享类型 |
| `server` | `@nova/server` | NestJS 后端 |
| `admin` | `@nova/admin` | 管理后台 |
| `uni-app` | `@nova/uni-app` | 多端应用 |

### 2.2 根配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'admin'
  - 'uni-app'
  - 'server'
  - 'packages/*'
```

根 `package.json` scripts:

```json
{
  "dev": "concurrently \"pnpm --filter @nova/server dev\" \"pnpm --filter @nova/admin dev\"",
  "dev:all": "concurrently \"pnpm --filter @nova/server dev\" \"pnpm --filter @nova/admin dev\" \"pnpm --filter @nova/uni-app dev:h5\"",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

共享 `tsconfig.base.json` 供各子包 extend。

## 3. @nova/shared-types

```typescript
// packages/shared-types/src/index.ts

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum ErrorCode {
  SUCCESS = 0,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}
```

构建：使用 `tsup` 或 `tsc` 输出 ESM + 类型声明。

## 4. @nova/server (NestJS)

### 4.1 模块结构

```
server/src/
├── main.ts
├── app.module.ts
├── config/
│   ├── configuration.ts      # 配置工厂
│   └── env.validation.ts     # env 校验
├── common/
│   ├── filters/http-exception.filter.ts
│   ├── interceptors/transform.interceptor.ts
│   └── dto/pagination.dto.ts
├── modules/
│   ├── health/
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts    # POST /auth/login → 501 Not Implemented
│   │   ├── auth.service.ts
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   └── decorators/public.decorator.ts
│   └── rbac/
│       ├── rbac.module.ts
│       ├── guards/roles.guard.ts
│       └── decorators/roles.decorator.ts
└── database/
    └── database.module.ts        # TypeORM forRootAsync
```

### 4.2 全局中间件/管道

```typescript
// main.ts 关键配置
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.useGlobalInterceptors(new TransformInterceptor());
app.useGlobalFilters(new HttpExceptionFilter());
SwaggerModule.setup('api/docs', app, document);
```

### 4.3 TransformInterceptor

所有成功响应包装为 `ApiResponse<T>`:

```typescript
return { code: ErrorCode.SUCCESS, message: 'ok', data: result };
```

### 4.4 环境变量 (.env.example)

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=nova_stack
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
```

### 4.5 Auth/RBAC 占位行为

- `@Public()` 装饰的路由跳过 JWT 校验
- 未标注 `@Public()` 的路由需要 Bearer Token（strategy 验证占位 secret）
- `@Roles('admin')` + `RolesGuard` 骨架：无 roles 元数据时 pass，有 roles 时 TODO 返回 403
- `POST /auth/login` 返回 `{ code: 501, message: 'Not implemented' }`

### 4.6 测试

- e2e: `GET /health` → 200 + ApiResponse
- e2e: `POST /auth/login` with invalid body → 400

## 5. @nova/admin (Vue3)

### 5.1 目录结构

```
admin/src/
├── main.ts
├── App.vue
├── router/
│   ├── index.ts
│   └── routes.ts           # login, layout, 404
├── layouts/
│   └── DefaultLayout.vue   # Arco Layout 侧边栏+顶栏
├── views/
│   ├── login/index.vue
│   ├── dashboard/index.vue
│   └── not-found/index.vue
├── store/
│   ├── index.ts
│   └── modules/user.ts
├── api/
│   └── request.ts          # axios 封装
└── env.d.ts
```

### 5.2 Axios 封装

```typescript
// 响应拦截：解析 ApiResponse<T>
// 请求拦截：占位 Token 注入（从 userStore.token 读取，初始 null）
```

### 5.3 路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/login` | LoginView | 公开，表单占位 |
| `/` | DefaultLayout | 需登录（路由守卫占位，暂时 pass） |
| `/dashboard` | DashboardView | 首页占位 |
| `/*` | NotFoundView | 404 |

### 5.4 UnoCSS

`vite.config.ts` 集成 UnoCSS plugin，`uno.config.ts` 使用 preset-uno。

## 6. @nova/uni-app

### 6.1 初始化

使用 `pnpm create uni` 选择 Vue3 + Vite + TS 模板，迁入 `uni-app/` 目录。

### 6.2 uview-plus 集成

`main.ts`:

```typescript
import uviewPlus from 'uview-plus';
app.use(uviewPlus);
```

`pages.json` 配置 easycom 规则。

### 6.3 请求封装

```typescript
// utils/request.ts
// 基于 uni.request，解析 ApiResponse<T>
// baseURL 从 import.meta.env.VITE_API_BASE_URL 读取
```

### 6.4 页面

- `pages/index/index.vue`: 展示 uview button + 调用 health API 占位

## 7. 集成与开发流程

### 7.1 本地启动顺序

1. 启动 MySQL + Redis（本地或 Docker，文档说明）
2. 复制各子包 `.env.example` → `.env`
3. `pnpm install`
4. `pnpm dev`（server + admin 并行）

### 7.2 类型对齐验证

server Controller 返回类型引用 `@nova/shared-types` 的 `ApiResponse`；admin/uni-app request 解析同一结构。

## 8. 风险与缓解

| 风险 | 缓解 |
|------|------|
| Arco Pro 与手动布局差异 | 首 change 最小布局，auth change 再扩展 |
| uni-app 微信编译环境 | H5 为主验证，微信 build 命令 smoke test |
| DB 不可用阻塞开发 | README 明确依赖；health 路由不依赖 DB |

## 9. 不在本 change 范围

- 完整登录/登出/Token 刷新
- RBAC 菜单/按钮动态权限
- 业务 CRUD
- CI/CD、Docker compose（可文档提及但不实现）
