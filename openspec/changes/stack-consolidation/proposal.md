## Why

nova-stack 在快速迭代多个业务模块（RBAC、字典、站点配置、审计等）后，前后端与 monorepo 工程化出现明显「双轨」与不一致：Admin 仍保留 Art Design Pro 模板遗留（双 HTTP 客户端、Mock 生产 env、手工 Vite 代理），后端 Guard 分散且路径硬编码，shared-types ID/DTO 漂移，RBAC 假分页与 DevEx 摩擦（端口/env/seed）持续造成 404 与 onboarding 成本。需要在单一 change 内完成规范整合，降低后续模块开发的心智负担与线上风险。

## What Changes

### Phase 1 — 契约与 DevEx 基础
- Admin 统一 HTTP 层：废弃 `utils/http` 业务用途，WangEditor/路由守卫改接 `api/request.ts`
- 修复生产 env：配置 `VITE_API_BASE_URL`，移除 Apifox Mock；统一 `.env.example` 端口为 3001
- Vite 代理改为 catch-all（非静态资源转发后端），删除逐路径维护
- CORS 从 env 读取 `CORS_ORIGINS`
- shared-types 增加 `dev` watch；根级 `postinstall` 构建 shared-types

### Phase 2 — 后端规范加固
- 重构 Guard 体系：集中注册；`AdminAuthGuard` 改 `@AdminOnly()` 装饰器；移除空壳 `RolesGuard`
- 补齐 Upload 等权限缺口；Redis 黑名单 fail-closed 策略
- 统一 ID 输出为 `string`（shared-types + server mapper）
- RBAC users/roles/menus 改为真分页
- `PermissionGuard` 增加 request-scoped 缓存
- `ValidationPipe` 启用 `forbidNonWhitelisted`；校验错误格式化

### Phase 3 — Admin 模板瘦身
- 删除双类型体系：`Api.*` → `@nova/shared-types`；`userStore.info` 直接暴露 `AdminInfo`
- 移除死代码（`menusToRoutes.ts`、未引用模板组件）
- 清理占位页（注册/忘记密码隐藏；Dashboard mock 处理）
- 品牌统一为 Nova Stack
- Admin 对接 RBAC 真分页，删除 `filterPaginated` hack

### Phase 4 — 工程化补齐
- 添加 `docker-compose.yml`（MySQL + Redis）
- 根级 `build`/`test` 聚合脚本
- README 全面更新（技术栈、env、seed、端口）
- 统一 ESLint 根配置扩展
- server DTO `implements` shared-types 接口（核心模块）
- staging/prod 禁用 TypeORM synchronize（文档 + 配置约束）

## Capabilities

### New Capabilities
（无新增独立 capability；本次为现有能力的规范强化）

### Modified Capabilities
- `shared-types`：统一 bigint ID 为 string；列表查询类型补齐
- `rbac-api`：users/roles/menus 真分页与查询参数
- `admin-scaffold`：单一 HTTP 客户端、env/proxy 规范、生产构建
- `server-scaffold`：Guard 集中化、ValidationPipe 增强、CORS 配置化
- `monorepo-workspace`：watch/postinstall、docker-compose、根级脚本、README
- `file-upload-api`：Upload 端点权限校验
- `admin-system-ui`：RBAC 列表对接服务端分页

## Impact

- **代码**：`admin/`（vite、api、store、views/system、utils/http）、`server/`（guards、rbac、mapper、config、bootstrap）、`packages/shared-types/`、根 `package.json`、`.env.example`、`README.md`、`docker-compose.yml`
- **API**：RBAC 列表接口增加 query 参数（**BREAKING** 对依赖全量列表的前端行为；Admin 同步改）
- **类型**：RBAC/Article ID 从 number 改为 string（**BREAKING** 前端比较/路由参数需对齐）
- **运维**：新增 docker-compose；CORS/origin 改 env 配置
- **非影响范围**：uni-app 业务功能、数据库 schema 结构、Hash 路由模式
