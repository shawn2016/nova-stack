# Comet Design Handoff

- Change: stack-consolidation
- Phase: design
- Mode: compact
- Context hash: 84954eef4f727161b611ca56150650cfcad21bdae547a6f72f6ab39fbedeef87

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/stack-consolidation/proposal.md

- Source: openspec/changes/stack-consolidation/proposal.md
- Lines: 1-57
- SHA256: d5be2da41c3ef38f7bf79c41046d32e67fd04af9d238acd54b34e684c582c28c

```md
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

```

## openspec/changes/stack-consolidation/design.md

- Source: openspec/changes/stack-consolidation/design.md
- Lines: 1-97
- SHA256: f2c44c754dc45b43ed394aa1f1af40bf33c485f99eb8cd972d6f419188e7de57

[TRUNCATED]

```md
## Context

nova-stack 是 pnpm monorepo（NestJS + Vue3 Admin + uni-app + shared-types）。业务模块已较完整，但模板遗留与快速迭代导致前后端契约、Guard、DevEx 不一致。本 change 在**不改变业务功能范围**的前提下做 consolidation。

## Goals / Non-Goals

**Goals**
- 单一 HTTP 客户端与 env 体系，消除 dev 404 与生产 Mock 风险
- 后端 Guard/权限/分页/ID 策略统一
- Admin 去除 Art Design Pro 双轨残留
- monorepo onboarding 一条命令链路可用

**Non-Goals**
- uni-app 会员中心等业务新功能
- 引入 Turbo/Nx、OpenAPI codegen（仅预留 DTO implements）
- 数据库 schema 变更或 TypeORM migration 文件编写（仅禁用 staging synchronize）
- Hash → History 路由

## Decisions

### 1. Vite 代理：catch-all + bypass 静态

```ts
proxy: {
  '^/(?!@vite|@fs|src/|node_modules/|__devtools__).*': {
    target: VITE_API_PROXY_URL,
    changeOrigin: true,
    bypass(req) {
      if (req.headers.accept?.includes('text/html')) return req.url
    }
  }
}
```

**理由**：新后端模块无需改 vite.config；仅 HTML 导航走 SPA。

**备选**：保留逐路径 proxy — 已证明易漏（dict 404）。

### 2. ID 策略：全局 string

- DB 实体保持 bigint；API/JSON 层统一 `String(id)`
- shared-types 中 RBAC/Article 的 `id: number` 改为 `id: string`

**理由**：JSON 精度安全；与 dict/audit 已有实践一致。

### 3. Guard 重构：CoreModule + 装饰器

- 从 `app.module.ts` 统一注册：`JwtAuthGuard` → `AdminAuthGuard`/`MemberAuthGuard` → `PermissionGuard`
- 删除 `RolesGuard`（无 `@Roles` 使用）
- `@AdminOnly()` 替代 `AdminAuthGuard` 路径前缀白名单
- `@Public()` 保持跳过 JWT

**理由**：新 Controller 默认 admin，member 路由显式标注，消除硬编码列表。

### 4. RBAC 分页：对齐 dict/article 模式

- `ListUsersDto` / `ListRolesDto` / `ListMenusDto` extends `PaginationDto` + keyword
- Service 使用 QueryBuilder `skip/take`
- Admin `system-manage.ts` 删除客户端 `filterPaginated`

### 5. HTTP 层：仅保留 `api/request.ts`

- `utils/http/index.ts` 标记 deprecated 或删除；WangEditor 改 `api/upload.ts`
- 路由守卫错误判断改用 `ErrorCode` / 统一 HttpError

### 6. Permission 缓存

- request-scoped Map：`userId → permissions[]`，同一请求内复用
- 后续可扩展 Redis TTL（本 change 不强制）

### 7. DevEx

- `shared-types`: `"dev": "tsc --watch"`
- 根 `dev`: concurrently shared-types dev + server + admin
- `postinstall`: build shared-types
- `docker-compose.yml`: mysql:8 + redis:7，端口与 .env.example 对齐

## Risks / Trade-offs

| 风险 | 缓解 |

```

Full source: openspec/changes/stack-consolidation/design.md

## openspec/changes/stack-consolidation/tasks.md

- Source: openspec/changes/stack-consolidation/tasks.md
- Lines: 1-46
- SHA256: 04c930e06cae0cb7f30c4127556c6a5109210aee1b182fc9adfe41660da60c20

```md
# stack-consolidation 任务清单

## Phase 1 — 契约与 DevEx 基础

- [ ] 1.1 Admin Vite 代理改为 catch-all，删除无效 `/api` 与逐路径规则
- [ ] 1.2 修复 `.env.production`：设置 `VITE_API_BASE_URL`；移除 Apifox Mock；同步 `.env.example` 端口 3001
- [ ] 1.3 废弃/删除 `utils/http` 业务用途；WangEditor 改接 `api/upload.ts`；路由守卫错误判断改用 `ErrorCode`
- [ ] 1.4 Server CORS 从 `CORS_ORIGINS` env 读取；更新 `server/.env.example`
- [ ] 1.5 shared-types 增加 `dev: tsc --watch`；根 `postinstall` build shared-types；根 `dev` 并行 watch

## Phase 2 — 后端规范加固

- [ ] 2.1 创建 `CoreModule` 或于 `AppModule` 集中注册 Guard；删除空壳 `RolesGuard`
- [ ] 2.2 实现 `@AdminOnly()` 装饰器，重构 `AdminAuthGuard` 去除路径硬编码
- [ ] 2.3 Upload 加 `@RequirePermission('system:file:upload')`；seed 补权限码
- [ ] 2.4 Redis 黑名单 fail-closed：`isBlacklisted` 与 strategy 行为一致
- [ ] 2.5 shared-types ID 统一为 string；server mapper 全模块 `String(id)`
- [ ] 2.6 RBAC users/roles/menus 真分页 + ListDto；优化 `loadRolesAndPermissions` 查询
- [ ] 2.7 `PermissionGuard` request-scoped 缓存
- [ ] 2.8 `ValidationPipe` 加 `forbidNonWhitelisted`；HttpExceptionFilter 格式化校验错误

## Phase 3 — Admin 模板瘦身

- [ ] 3.1 `system-manage.ts` 删除 `filterPaginated`；对接 RBAC 服务端分页
- [ ] 3.2 用户/角色/菜单 views 适配 string id 与分页参数
- [ ] 3.3 逐步替换 `Api.*` 全局类型为 shared-types；简化 `userStore.info` 映射
- [ ] 3.4 删除死代码：`menusToRoutes.ts`（若确认未引用）；隐藏 register/forget-password 路由
- [ ] 3.5 品牌配置改为 Nova Stack；Dashboard mock 降级处理
- [ ] 3.6 移除或禁用未引用模板组件（chat/fireworks）

## Phase 4 — 工程化补齐

- [ ] 4.1 添加 `docker-compose.yml`（MySQL 8 + Redis 7）
- [ ] 4.2 根级 `build`、`test` 聚合脚本
- [ ] 4.3 README 全面更新（技术栈、env、seed、端口、docker）
- [ ] 4.4 统一 ESLint：根 config 扩展至 server/shared-types
- [ ] 4.5 核心 server DTO `implements` shared-types 接口（auth/rbac 优先）
- [ ] 4.6 非 production 外禁用 synchronize 文档化；staging env 示例

## 验证

- [ ] 5.1 `pnpm --filter @nova/shared-types test` 通过
- [ ] 5.2 `pnpm --filter @nova/server test` + `test:e2e` 通过
- [ ] 5.3 Admin 构建 `pnpm --filter @nova/admin build` 通过
- [ ] 5.4 手动验证：字典/站点配置/审计/RBAC CRUD、上传、登录刷新
- [ ] 5.5 `openspec validate stack-consolidation --strict` 通过

```

## openspec/changes/stack-consolidation/specs/admin-scaffold/spec.md

- Source: openspec/changes/stack-consolidation/specs/admin-scaffold/spec.md
- Lines: 1-34
- SHA256: 07b7eae78c998a6c4c32cdc97d138ac134c9892ad8c12499ffafe10a756edff4

```md
## MODIFIED Requirements

### Requirement: Admin 应用可启动
系统 MUST 提供可独立启动的 Vue3 + Vite 管理端应用，基于 art-design-pro 模板（Element Plus + Tailwind CSS），默认开发服务器可访问；**生产构建 MUST 通过 `VITE_API_BASE_URL` 指向真实后端**，不得依赖 Apifox Mock。

#### Scenario: 本地启动 admin
- **WHEN** 开发者启动 admin 子包开发服务器
- **THEN** 浏览器可访问登录/首页布局页面

#### Scenario: 生产 API 地址
- **WHEN** 执行 `pnpm build` 并使用 production env
- **THEN** API 请求指向配置的 `VITE_API_BASE_URL`，非 mock URL

### Requirement: Axios 请求封装
系统 MUST 提供**单一** Axios 实例封装（`src/api/request.ts`），自动注入 JWT Token；401 时尝试 refresh，403 时提示无权限；**不得存在并行业务 HTTP 客户端**（`utils/http` 仅可 deprecated 或删除）。

#### Scenario: API 请求配置
- **WHEN** 组件通过 `request()` 发起 HTTP 请求
- **THEN** 请求自动携带配置的 baseURL 与 Authorization header

#### Scenario: Token 注入
- **WHEN** 用户已登录且 store 中有 accessToken
- **THEN** 每个请求自动携带 `Bearer` Token

#### Scenario: 成功码对齐
- **WHEN** server 返回 `code: 0`
- **THEN** request 层正确 unwrap `data`，不期望 `code: 200`

### Requirement: 开发代理
Admin 开发服务器 MUST 将 API 请求代理至 `VITE_API_PROXY_URL`；**新增后端路由前缀 MUST 无需修改 vite.config 即可代理**（catch-all 或等价方案）。

#### Scenario: 新模块 API 代理
- **WHEN** 后端新增 `/dict/types` 等路由且 admin dev 运行中
- **THEN** 通过 dev server 发起的 POST/GET 正确转发至后端，不返回 404

```

## openspec/changes/stack-consolidation/specs/admin-system-ui/spec.md

- Source: openspec/changes/stack-consolidation/specs/admin-system-ui/spec.md
- Lines: 1-27
- SHA256: a69a7f3b191d8afb935190633f14d7498f2cf5b28bf7cc419e4ec9e418b9a9ed

```md
## MODIFIED Requirements

### Requirement: 用户管理页
Admin MUST 提供用户管理页：分页列表、创建、编辑、删除（或禁用），对接用户管理 API；操作按钮受 `system:user:*` 权限控制；列表 MUST 使用服务端分页与 keyword 搜索，**不得**在前端全量拉取后 filter。

#### Scenario: 用户列表
- **WHEN** 有 `system:user:list` 权限的管理员访问用户管理
- **THEN** 展示用户分页列表（用户名、昵称、状态等），数据来自服务端 page/pageSize 响应

#### Scenario: 创建用户
- **WHEN** 有 `system:user:create` 权限并提交创建表单
- **THEN** 调用 POST 用户 API 成功并刷新列表

#### Scenario: 用户列表分页
- **WHEN** 管理员翻页或搜索 keyword
- **THEN** 请求携带 page/pageSize/keyword，表格展示服务端返回的分页数据

### Requirement: 角色管理页
Admin MUST 提供角色管理页：列表、创建、编辑、删除，支持为角色分配权限；对接角色 API；列表 MUST 使用服务端分页。

#### Scenario: 角色列表与权限分配
- **WHEN** 编辑某角色并勾选权限后保存
- **THEN** 角色权限更新生效，重新登录或刷新权限后菜单/按钮符合新权限

#### Scenario: 角色列表分页
- **WHEN** 管理员打开角色管理页并翻页
- **THEN** 请求携带 page/pageSize，表格展示服务端分页数据

```

## openspec/changes/stack-consolidation/specs/file-upload-api/spec.md

- Source: openspec/changes/stack-consolidation/specs/file-upload-api/spec.md
- Lines: 1-20
- SHA256: 84dbc1e18ae541071d6487f85d7f50c9127f108d634e8452f8926407138f4df2

```md
## MODIFIED Requirements

### Requirement: Admin 文件上传
系统 MUST 提供 `POST /files/upload`，接受 multipart 单文件，需 Admin JWT 鉴权，**且 MUST 校验 `system:file:upload` 或等价上传权限**，返回可访问 URL。

#### Scenario: 上传成功
- **WHEN** 有上传权限的 Admin 提交合法图片文件（≤ 配置大小限制）
- **THEN** 返回 201 及 `{ url, key, size, mimeType }`

#### Scenario: 无上传权限
- **WHEN** Admin 已登录但无上传权限码
- **THEN** 返回 403

#### Scenario: Member Token 拒绝
- **WHEN** Member Token 请求上传
- **THEN** 返回 403

#### Scenario: 文件过大或类型不允许
- **WHEN** 超过大小限制或非允许 MIME
- **THEN** 返回 400

```

## openspec/changes/stack-consolidation/specs/monorepo-workspace/spec.md

- Source: openspec/changes/stack-consolidation/specs/monorepo-workspace/spec.md
- Lines: 1-26
- SHA256: 924bf9dd7223f5fc46df57da81749a6944aac4c6eea2567f7ecc67e3166db444

```md
## MODIFIED Requirements

### Requirement: 共享代码规范配置
系统 MUST 在根目录提供 eslint 与 prettier 配置，各子包 MUST 继承或引用根配置；**server 与 shared-types MUST 可执行 lint**。

#### Scenario: 根级 lint 命令
- **WHEN** 开发者在根目录执行 lint 脚本
- **THEN** 所有子包代码规范检查可统一执行

### Requirement: 根级开发文档
系统 MUST 提供 README，说明 monorepo 结构、前置依赖（Node、pnpm、MySQL、Redis）、**`pnpm seed` 步骤**、**统一端口约定（默认 3001）** 及本地启动步骤；技术栈描述 MUST 与实际一致（Element Plus + Tailwind，非 Arco）。

#### Scenario: 新开发者 onboarding
- **WHEN** 新开发者阅读根 README 并复制 `.env.example`
- **THEN** 可了解三端目录分工、技术栈、seed 与启动顺序，端口与 proxy 一致

### Requirement: 根级开发脚本
系统 MUST 提供根级 `build`、`test` 聚合脚本；**`postinstall` MUST 构建 shared-types**；**`dev` MUST 并行启动 shared-types watch**（或等价 watch 方案）。

#### Scenario: clone 后安装
- **WHEN** 新 clone 执行 `pnpm install`
- **THEN** shared-types dist 可用，IDE 类型不报错

#### Scenario: 本地基础设施
- **WHEN** 开发者执行 `docker compose up -d`
- **THEN** MySQL 与 Redis 可用，与 `.env.example` 端口/凭证一致

```

## openspec/changes/stack-consolidation/specs/rbac-api/spec.md

- Source: openspec/changes/stack-consolidation/specs/rbac-api/spec.md
- Lines: 1-32
- SHA256: eb1697c2b594c2b20ed7ff5247cb851c544a4f93f03cbf497584413790575ef0

```md
## MODIFIED Requirements

### Requirement: RBAC 管理 API 骨架
系统 MUST 提供 User、Role、Menu 的完整 CRUD API（list/create/update/delete），供 Admin 系统管理调用；各端点需 `@RequirePermission` 与 Admin Token；**list 端点 MUST 支持服务端分页**（page、pageSize）与 keyword 筛选。

#### Scenario: 角色列表
- **WHEN** 有权限的管理员请求 `GET /roles?page=1&pageSize=20`
- **THEN** 返回 `{ list, page, pageSize, total }` 分页结果，非全量

#### Scenario: 创建角色
- **WHEN** POST `/roles` 提交合法角色数据
- **THEN** 返回 201 及新角色 id（string）

#### Scenario: 用户列表
- **WHEN** 有 `system:user:list` 权限请求 `GET /users?page=1&pageSize=20&keyword=admin`
- **THEN** 返回用户分页列表，keyword 匹配 username/nickname

#### Scenario: 创建用户
- **WHEN** POST `/users` 提交用户名与密码
- **THEN** 创建 sys_user 并返回用户信息（不含密码 hash）

#### Scenario: 菜单 CRUD
- **WHEN** 对 `/menus` 执行 CRUD；GET list 支持分页
- **THEN** 菜单数据持久化且 `/auth/me/menus` 可反映变更

#### Scenario: 角色分配权限
- **WHEN** PUT `/roles/:id/permissions` 提交 permissionCodes
- **THEN** 该角色关联权限更新，用户重新登录后 permissions 反映变更

#### Scenario: 用户分配角色
- **WHEN** PUT `/users/:id/roles` 提交 roleIds
- **THEN** 用户角色关联更新，重新登录后菜单与权限反映变更

```

## openspec/changes/stack-consolidation/specs/server-scaffold/spec.md

- Source: openspec/changes/stack-consolidation/specs/server-scaffold/spec.md
- Lines: 1-42
- SHA256: 98d3a19264f06e9c29e29e2b1dc5289567ef46702489270397a590276e5ada1d

```md
## MODIFIED Requirements

### Requirement: NestJS 应用可启动
系统 MUST 提供可独立启动的 NestJS 应用，默认监听可配置端口，启动后无致命错误；CORS allowed origins MUST 从环境变量 `CORS_ORIGINS` 读取（逗号分隔），默认包含 admin/uni-app dev 端口。

#### Scenario: 本地启动 server
- **WHEN** 开发者配置环境变量并启动 server 子包
- **THEN** NestJS 应用成功启动并响应健康检查或根路由

#### Scenario: 跨域请求
- **WHEN** admin 从配置的 origin 请求 API
- **THEN** 浏览器不阻止跨域响应

### Requirement: 全局参数校验
系统 MUST 启用 class-validator 全局校验管道，非法请求体 MUST 返回 400 及校验错误信息；**MUST 启用 `forbidNonWhitelisted: true`**，未知字段 MUST 导致 400。

#### Scenario: 非法 DTO 提交
- **WHEN** 客户端提交不符合 DTO 约束的请求体
- **THEN** 系统返回 400 及字段级错误描述

#### Scenario: 未知字段拒绝
- **WHEN** 客户端提交 DTO 未声明的额外字段
- **THEN** 系统返回 400，不静默剥离

### Requirement: JWT 与 RBAC 模块占位
系统 MUST 提供完整的 AuthModule 与 RbacModule 实现；**全局 Guard MUST 在 AppModule 集中注册**，执行顺序明确；**不得保留无实现的 RolesGuard**；Admin 路由 MUST 通过 `@AdminOnly()` 或等价装饰器标识，不得依赖硬编码路径前缀列表。

#### Scenario: 模块注册
- **WHEN** 应用启动
- **THEN** Auth 与 RBAC 模块加载完整业务逻辑

#### Scenario: 真实登录
- **WHEN** 调用 `POST /auth/login` 提交有效凭据
- **THEN** 返回 200 及 Token，而非 501

#### Scenario: 新 Controller 默认可访问
- **WHEN** 新增 B 端 Controller 未标注 `@Public()` 或 member 路由
- **THEN** Admin JWT 可访问，无需修改 Guard 白名单文件

#### Scenario: Permission 缓存
- **WHEN** 同一 HTTP 请求内多次触发 PermissionGuard
- **THEN** 用户 permissions 不重复查库（request-scoped 缓存）

```

## openspec/changes/stack-consolidation/specs/shared-types/spec.md

- Source: openspec/changes/stack-consolidation/specs/shared-types/spec.md
- Lines: 1-27
- SHA256: 426894b5a14d4a17a9ce38c97cfe386b4e3df34ddcc7ccd133a0c0721029ee99

```md
## MODIFIED Requirements

### Requirement: 共享 types 包
系统 MUST 提供 `packages/shared-types` workspace 包，导出 API 通用类型、鉴权/RBAC 类型及 Article、ArticleListItem、CreateArticleDto、UpdateArticleDto 等业务类型；**所有实体主键 id 在 JSON/API 层 MUST 使用 string 类型**（对应 DB bigint）。

#### Scenario: 子包引用共享类型
- **WHEN** admin 或 server 子包 import 共享 types
- **THEN** TypeScript 编译通过且类型定义一致

#### Scenario: 三端类型对齐
- **WHEN** server 返回 Article 列表或 LoginResponse
- **THEN** admin 与 uni-app 可使用相同类型解析

#### Scenario: ID 类型统一
- **WHEN** server 返回 RBAC 用户/角色/菜单或 Article 的 id 字段
- **THEN** JSON 中 id 为 string，shared-types 定义与之一致

### Requirement: API 响应类型约定
共享 types MUST 定义统一 API 响应结构（code、message、data），三端 MUST 引用该结构；成功码 MUST 为 `ErrorCode.SUCCESS`（0）。

#### Scenario: 响应类型对齐
- **WHEN** server 返回标准响应结构
- **THEN** admin 与 uni-app 可使用相同类型解析响应

#### Scenario: 开发 watch
- **WHEN** 开发者修改 shared-types 源码
- **THEN** `pnpm --filter @nova/shared-types dev` 可 watch 编译，根 `pnpm dev` MUST 并行启动 watch

```
