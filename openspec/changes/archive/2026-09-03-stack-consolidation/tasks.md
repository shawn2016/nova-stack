# stack-consolidation 任务清单

## Phase 1 — 契约与 DevEx 基础

- [x] 1.1 Admin Vite 代理改为单条 `/api`（后端 `setGlobalPrefix('api')`）
- [x] 1.2 修复 `.env.production`：设置 `VITE_API_BASE_URL`；移除 Apifox Mock；同步 `.env.example` 端口 3001
- [x] 1.3 废弃/删除 `utils/http` 业务用途；WangEditor 改接 `api/upload.ts`；路由守卫错误判断改用 `ErrorCode`
- [x] 1.4 Server CORS 从 `CORS_ORIGINS` env 读取；更新 `server/.env.example`
- [x] 1.5 shared-types 增加 `dev: tsc --watch`；根 `postinstall` build shared-types；根 `dev` 并行 watch

## Phase 2 — 后端规范加固

- [x] 2.1 创建 `CoreModule` 或于 `AppModule` 集中注册 Guard；删除空壳 `RolesGuard`
- [x] 2.2 实现 `@AdminOnly()` 装饰器，重构 `AdminAuthGuard` 去除路径硬编码
- [x] 2.3 Upload 加 `@RequirePermission('system:file:upload')`；seed 补权限码
- [x] 2.4 Redis 黑名单 fail-closed：`isBlacklisted` 与 strategy 行为一致
- [x] 2.5 shared-types ID 统一为 string；server mapper 全模块 `String(id)`
- [x] 2.6 RBAC users/roles/menus 真分页 + ListDto；优化 `loadRolesAndPermissions` 查询
- [x] 2.7 `PermissionGuard` request-scoped 缓存
- [x] 2.8 `ValidationPipe` 加 `forbidNonWhitelisted`；HttpExceptionFilter 格式化校验错误

## Phase 3 — Admin 模板瘦身

- [x] 3.1 `system-manage.ts` 删除 `filterPaginated`；对接 RBAC 服务端分页
- [x] 3.2 用户/角色/菜单 views 适配 string id 与分页参数
- [x] 3.3 逐步替换 `Api.*` 全局类型为 shared-types；简化 `userStore.info` 映射
- [x] 3.4 删除死代码：`menusToRoutes.ts`（若确认未引用）；隐藏 register/forget-password 路由
- [x] 3.5 品牌配置改为 Nova Stack；Dashboard mock 降级处理
- [x] 3.6 移除或禁用未引用模板组件（chat/fireworks）

## Phase 4 — 工程化补齐

- [x] 4.1 添加 `docker-compose.yml`（MySQL 8 + Redis 7）
- [x] 4.2 根级 `build`、`test` 聚合脚本
- [x] 4.3 README 全面更新（技术栈、env、seed、端口、docker）
- [x] 4.4 统一 ESLint：根 config 扩展至 server/shared-types
- [x] 4.5 核心 server DTO `implements` shared-types 接口（auth/rbac 优先）
- [x] 4.6 非 production 外禁用 synchronize 文档化；staging env 示例

## 验证

- [x] 5.1 `pnpm --filter @nova/shared-types test` 通过
- [x] 5.2 `pnpm --filter @nova/server test` + `test:e2e` 通过
- [x] 5.3 Admin 构建 `pnpm --filter @nova/admin build` 通过
- [x] 5.4 手动验证：字典/站点配置/审计/RBAC CRUD、上传、登录刷新
- [x] 5.5 `openspec validate stack-consolidation --strict` 通过
