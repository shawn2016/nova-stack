---
comet_change: stack-consolidation
role: technical-design
canonical_spec: openspec
archived-with: 2026-09-03-stack-consolidation
status: final
---

# stack-consolidation 深度技术设计

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                     Monorepo (pnpm)                          │
├──────────────┬──────────────────┬───────────────────────────┤
│ shared-types │  server (NestJS) │  admin (Vue3 + Vite)      │
│ 契约 + watch │  Guard/RBAC/API  │  单一 request.ts + proxy  │
└──────────────┴──────────────────┴───────────────────────────┘
         ▲                ▲                    ▲
         └────────────────┴────────────────────┘
                    workspace:* 引用
```

**实施顺序**：Phase 1 DevEx → Phase 2 Server → Phase 3 Admin → Phase 4 工程化 → 集成验证

**原则**：每个 Phase 完成后可独立 smoke test；Phase 2/3 的 ID/pagination 变更需同批合并避免中间态。

## 2. Phase 1 — 契约与 DevEx

### 2.1 API 统一前缀 + Vite 单条代理

**原则**：后端 `setGlobalPrefix('api')`，前端 `VITE_API_BASE_URL=/api`，Vite 仅代理 `/api` —— 避免 catch-all 误触静态资源与 SPA 路由。

**Server**（`bootstrap.ts`）：
```typescript
app.setGlobalPrefix('api');
SwaggerModule.setup('docs', app, document); // → /api/docs
// /uploads 静态资源保持根路径，不走 API 前缀
```

**Admin**（`vite.config.ts`）：
```typescript
proxy: {
  '/api': { target: VITE_API_PROXY_URL, changeOrigin: true }
}
```

**Admin env**：`VITE_API_BASE_URL=/api`；`request.ts` 中 url 仍为 `/auth/login`，实际请求 `/api/auth/login`。

**验证**：`curl http://127.0.0.1:5173/api/health` 返回 200；访问 `/dict/types` 无 `/api` 前缀时不走代理。

### 2.2 环境变量

| 文件 | 变更 |
|------|------|
| `admin/.env.production` | `VITE_API_BASE_URL=https://api.example.com`（占位，部署时替换） |
| `admin/.env.example` | 说明 BASE_URL vs PROXY_URL；PORT 3001 |
| `server/.env.example` | `PORT=3001`；`CORS_ORIGINS=http://localhost:5173,http://localhost:5174` |
| `uni-app/.env.example` | `VITE_API_BASE_URL=http://localhost:3001` |

废弃 `VITE_API_URL` 用于业务请求（模板 HTTP 删除后不再使用）。

### 2.3 单一 HTTP 客户端

**保留**：`admin/src/api/request.ts`

**废弃/删除**：
- `admin/src/utils/http/index.ts` — 删除或仅 re-export request（过渡期）
- `art-wang-editor` — 改 `uploadFile()` from `@/api/upload`

**路由守卫** `beforeEach.ts`：
- 移除 `ApiStatus` / `isHttpError` 依赖
- 401 判断：`error.response?.status === 401`

### 2.4 shared-types watch

**packages/shared-types/package.json**：
```json
"dev": "tsc --watch"
```

**根 package.json**：
```json
"postinstall": "pnpm --filter @nova/shared-types build",
"dev": "concurrently ... \"pnpm --filter @nova/shared-types dev\" ..."
```

### 2.5 Server CORS

**server/src/bootstrap.ts**：
```typescript
const origins = configService.get<string>('app.corsOrigins')?.split(',') ?? ['http://localhost:5173']
app.enableCors({ origin: origins, credentials: true })
```

**configuration.ts**：`corsOrigins: process.env.CORS_ORIGINS`

## 3. Phase 2 — 后端规范加固

### 3.1 Guard 体系重构

**删除**：`modules/rbac/guards/roles.guard.ts` 及 app.module 注册

**新建**：`common/decorators/admin-only.decorator.ts`
```typescript
export const IS_ADMIN_ONLY = 'isAdminOnly'
export const AdminOnly = () => SetMetadata(IS_ADMIN_ONLY, true)
```

**重构 AdminAuthGuard**：
- 默认：非 `@Public()` 且非 member 路由 → 要求 `type === 'admin'`
- Member 路由：`@Controller('member/...')` 或 `@MemberOnly()` 装饰器
- **删除** `ADMIN_PATH_PREFIXES` 硬编码数组

**AppModule providers 顺序**（注释标明）：
1. JwtAuthGuard (APP_GUARD)
2. AdminAuthGuard (APP_GUARD) — 或合并进单一 guard
3. MemberAuthGuard (APP_GUARD)
4. PermissionGuard (APP_GUARD)

**Module 清理**：从 auth/rbac/member-auth module 移除重复的 APP_GUARD 注册。

### 3.2 Upload 权限

**upload.controller.ts**：
```typescript
@RequirePermission('system:file:upload')
@Post('upload')
```

**init.seed.ts**：新增 permission `system:file:upload`，绑定 super_admin。

### 3.3 Redis fail-closed

**jwt.service.ts `isBlacklisted`**：
```typescript
if (!this.redis.isConnected()) {
  if (process.env.NODE_ENV === 'production') throw new ServiceUnavailableException('Redis unavailable')
  return false // dev only
}
```

与 `JwtStrategy.assertBlacklistAvailable` 对齐。

### 3.4 ID 统一 string

**shared-types 变更**（`rbac.ts`, `article.ts`）：
- `SysUserListItem.id: string`
- `SysRoleListItem.id: string`
- `ArticleListItem.id: string`
- 等所有 `id: number` → `string`

**Server mapper 统一**：
```typescript
function toId(value: string | number | bigint): string {
  return String(value)
}
```

影响文件：`user.service.ts`, `role.service.ts`, `menu.service.ts`, `article.mapper.ts`

### 3.5 RBAC 真分页

**新增 DTO**：
- `ListUsersDto extends PaginationDto` + `keyword?: string`
- `ListRolesDto extends PaginationDto` + `keyword?: string`
- `ListMenusDto extends PaginationDto` + `keyword?: string`

**user.service.list**：
```typescript
const qb = this.userRepo.createQueryBuilder('u')
if (keyword) qb.andWhere('u.username LIKE :kw OR u.nickname LIKE :kw', { kw: `%${keyword}%` })
const [list, total] = await qb.skip((page-1)*pageSize).take(pageSize).getManyAndCount()
return { list: list.map(mapUser), page, pageSize, total }
```

**loadRolesAndPermissions 优化**：
```typescript
// 替换 rolePermissionRepo.find() 全表
const rps = await this.rolePermissionRepo
  .createQueryBuilder('rp')
  .innerJoin('rp.permission', 'p')
  .where('rp.roleId IN (:...roleIds)', { roleIds })
  .getMany()
```

### 3.6 Permission 缓存

**permission.guard.ts**：
```typescript
private cache = new WeakMap<object, Map<string, boolean>>()

canActivate(context) {
  const req = context.switchToHttp().getRequest()
  if (!this.cache.has(req)) this.cache.set(req, new Map())
  const permCache = this.cache.get(req)!
  // ...
}
```

### 3.7 ValidationPipe

**app.module.ts**：
```typescript
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
})
```

**http-exception.filter.ts**：检测 `message: string[]` 格式化为 `{ code: 40001, message: '校验失败', data: { errors: [...] } }`

## 4. Phase 3 — Admin 瘦身

### 4.1 system-manage.ts

删除 `filterPaginated` 函数。改为：

```typescript
export function fetchUserList(params: UserListQuery) {
  return request<PaginationResult<SysUserListItem>>({
    url: '/users',
    method: 'GET',
    params: { page: params.current, pageSize: params.size, keyword: params.keyword },
  }).then(toTableResponse)
}
```

### 4.2 类型迁移

- `store/modules/user.ts`：`info` 直接返回 `AdminInfo | null`
- 逐步删除 `types/api/api.d.ts` 中 `Api.Auth.*` 引用
- system views 中 id 比较改用 string

### 4.3 路由清理

**router/modules/index.ts** 或 asyncRoutes：注释 register、forget-password

**删除**：`router/menusToRoutes.ts`（确认无 import）

### 4.4 品牌

**config/index.ts**：`title: 'Nova Stack'`, `name: 'Nova Stack Admin'`

## 5. Phase 4 — 工程化

### 5.1 docker-compose.yml

```yaml
services:
  mysql:
    image: mysql:8
    ports: ['3306:3306']
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: nova_stack
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
```

### 5.2 根脚本

```json
"build": "pnpm -r build",
"test": "pnpm --filter @nova/shared-types test && pnpm --filter @nova/server test"
```

### 5.3 ESLint

根 `eslint.config.js` 扩展 `@typescript-eslint`，server/shared-types 添加 `"lint": "eslint src"`

### 5.4 DTO implements（示例）

```typescript
// server/src/modules/rbac/user/dto/create-user.dto.ts
import type { CreateUserDto as ICreateUserDto } from '@nova/shared-types'
export class CreateUserDto implements ICreateUserDto { ... }
```

优先 auth/rbac 模块，其他模块后续迭代。

## 6. 测试策略

| 层级 | 覆盖 |
|------|------|
| 单元 | shared-types ID 类型测试；ValidationPipe forbid 测试 |
| E2E | auth login/refresh；users 分页；roles 分页；upload 403 无权限；dict CRUD |
| 构建 | `pnpm --filter @nova/admin build` |
| 手动 | dev proxy 新路由；生产 env 检查；docker compose up + seed + dev |

**E2E 更新点**：
- RBAC list 断言 `page/pageSize/total` 结构
- ID 断言改为 string

## 7. 回滚策略

- 各 Phase 独立 commit，可按 Phase revert
- ID string 变更与分页变更同 PR，避免半迁移状态
- Guard 重构前确保 e2e baseline 绿

## 8. 不在范围

- uni-app 改动（除 .env.example）
- TypeORM migration 文件
- OpenAPI codegen
- Dashboard 真实数据 API
