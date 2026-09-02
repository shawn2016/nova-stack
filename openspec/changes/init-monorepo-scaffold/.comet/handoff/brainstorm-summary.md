# Brainstorm Summary

- Change: init-monorepo-scaffold
- Date: 2026-09-02
- Status: 已确认

## 确认的技术方案

### 方案选择：CLI 模板 + Monorepo 整合（推荐）

采用各框架官方 CLI 生成子工程，再迁入 pnpm workspace 并裁剪冗余，比从零手写配置更快且符合社区最佳实践。

| 子包 | 初始化方式 | 裁剪策略 |
|------|-----------|---------|
| server | `nest new` + 手动加 TypeORM/Redis/Swagger | 保留模块化结构，Auth/RBAC 仅留空壳 |
| admin | Vite Vue3 TS + `@arco-design/web-vue` + 参考 Pro 布局 | 不引入完整 Pro 示例页，仅 login/layout/404 |
| uni-app | `pnpm create uni` (Vue3+Vite) + uview-plus | 保留 H5 + mp-weixin 双端配置 |
| shared-types | 手写最小 workspace 包 `@nova/shared-types` | 导出 ApiResponse/Pagination/ErrorCode |

### Monorepo 结构

```
nova-stack/
├── package.json              # scripts: dev/lint/format
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.js
├── admin/                    # @nova/admin
├── uni-app/                  # @nova/uni-app
├── server/                   # @nova/server
└── packages/
    └── shared-types/         # @nova/shared-types
```

### Server 深度设计

- **配置**: `@nestjs/config` + Joi/class-validator 校验 env
- **响应格式**: 全局 `TransformInterceptor` 包装为 `{ code, message, data }`，对齐 shared-types
- **异常**: 全局 `HttpExceptionFilter` 统一错误响应
- **Auth 占位**: `JwtAuthGuard` + `@Public()` 装饰器 + 空 `AuthService.login()` 返回 501
- **RBAC 占位**: `@Roles()` 装饰器 + `RolesGuard` 骨架（始终 pass 或 TODO）
- **DB 启动策略**: TypeORM 连接失败时应用启动报错（明确失败），README 说明需本地 MySQL/Redis

### Admin 深度设计

- **布局**: Arco Layout（侧边栏 + 顶栏）最小实现，非完整 Pro 脚手架
- **路由**: `/login`（公开）、`/`（layout 子路由 dashboard 占位）、`/*`（404）
- **Request**: axios 实例 + 响应拦截解析 `ApiResponse<T>`
- **UnoCSS**: `@unocss/preset-uno` + `@unocss/preset-icons`

### Uni-app 深度设计

- **请求**: 封装 `uni.request` 对齐 ApiResponse
- **首页**: uview-plus button + text 验证组件库
- **env**: `VITE_API_BASE_URL` 与 admin 对齐

## 关键取舍与风险

| 取舍 | 决策 | 风险缓解 |
|------|------|---------|
| 不用完整 Arco Pro 模板 | 减小体积，手动布局 | 后续 auth change 再补 Pro 特性 |
| DB 必须可用才启动 | 避免 silent failure | README 明确前置依赖 |
| 不引入 turborepo | 首 change 最小化 | 后续按需升级 |
| JWT/RBAC 仅占位 | 范围控制 | `@TODO(comet:auth-rbac-module)` 标注 |

## 测试策略

- **server**: 健康检查 e2e 测试（`GET /health` 返回 200）
- **shared-types**: 单元测试验证类型导出
- **admin/uni-app**: 构建验证（`pnpm build` 无错误），H5 dev 手动 smoke
- **集成**: 根 `pnpm dev` 并行启动 server + admin

## Spec Patch

无 — OpenSpec delta spec 已覆盖验收场景，无需回写。
