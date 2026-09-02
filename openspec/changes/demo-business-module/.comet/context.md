# Comet Design Handoff

- Change: demo-business-module
- Phase: design
- Mode: compact
- Context hash: dc6497fd55dd976c3916c7cab6bde2882300c796f6cc20de6eacac325bde242a

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/demo-business-module/proposal.md

- Source: openspec/changes/demo-business-module/proposal.md
- Lines: 1-32
- SHA256: fdbcb0cf40533c68d1a9ccdaeec5551216a5e5ee3ad51ade385afb012e68f404

```md
## Why

`auth-rbac-module` 已完成双轨鉴权，但尚无真实业务 API 与三端页面验证端到端联调。需要首个**示例业务模块**证明 Admin RBAC 管理、Member C 端消费、Server REST API 与 shared-types 类型对齐均可正常工作。

## What Changes

- **Server**：`article` 公告/文章实体与 CRUD API；B 端 Admin 全量 CRUD + RBAC 权限；C 端 Member 只读列表/详情（已发布内容）
- **Admin**：文章管理列表、创建/编辑表单、删除；对接 RBAC 按钮权限；动态菜单 seed 扩展
- **Uni-app**：C 端文章列表与详情页（Member Token 注入 request）
- **shared-types**：Article DTO、分页列表类型
- **Seed**：文章管理菜单 + 权限码 + 可选示例数据

## Capabilities

### New Capabilities

- `article-data-model`: 文章表结构与 TypeORM 实体
- `article-api`: B 端管理 API + C 端只读 API
- `article-admin-ui`: Admin 文章 CRUD 页面与权限按钮
- `article-member-ui`: Uni-app C 端文章列表/详情

### Modified Capabilities

- `shared-types`: 新增 Article 相关共享类型
- `rbac-data-model`: seed 扩展文章管理菜单与权限

## Impact

- **新增数据表**: `article`
- **新增 API**: `/articles`（Admin CRUD）、`/member/articles`（C 端只读）
- **依赖**: `auth-rbac-module` 已归档合并的主 spec（双轨鉴权、RBAC Guard）
- **非目标**: 富文本编辑器深度定制、评论、审核工作流、图片上传服务

```

## openspec/changes/demo-business-module/design.md

- Source: openspec/changes/demo-business-module/design.md
- Lines: 1-66
- SHA256: a6d70b1c488bb052b82c49ceecd88b0308e4b430c566ed16107b77fd54e1daa1

```md
## Context

在 `auth-rbac-module` 双轨鉴权基础上，引入首个示例业务 **Article（公告/文章）**，验证三端 CRUD/只读联调。OpenSpec delta spec 为需求事实源。

## Goals / Non-Goals

**Goals:**
- B 端 Admin：文章完整 CRUD，RBAC 权限控制（list/create/update/delete/publish）
- C 端 Member：已发布文章列表 + 详情（需 Member 登录）
- 三端 shared-types 类型一致
- Seed 扩展菜单/权限，Admin 动态路由可见「内容管理 / 文章管理」

**Non-Goals:**
- 富文本 WYSIWYG（先用 textarea）
- 图片 OSS 上传（cover 字段存 URL 字符串）
- 评论、点赞、审核流
- C 端 RBAC 菜单

## 数据库设计

### `article` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| title | VARCHAR(200) | 标题 |
| summary | VARCHAR(500) | 摘要 |
| content | TEXT | 正文 |
| cover_url | VARCHAR(512) | 封面 URL（可选） |
| status | TINYINT | 0=草稿 1=已发布 |
| author_id | BIGINT | 创建者 sys_user.id |
| published_at | DATETIME | 发布时间（发布时写入） |
| created_at | DATETIME | |
| updated_at | DATETIME | |

## API 设计

### B 端 Admin（需 Admin Token + 权限）

| 方法 | 路径 | 权限码 | 说明 |
|------|------|--------|------|
| GET | /articles | content:article:list | 分页列表 |
| GET | /articles/:id | content:article:view | 详情 |
| POST | /articles | content:article:create | 创建 |
| PUT | /articles/:id | content:article:update | 更新 |
| DELETE | /articles/:id | content:article:delete | 删除 |
| PATCH | /articles/:id/publish | content:article:publish | 发布 |

### C 端 Member（需 Member Token）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /member/articles | 已发布文章分页列表 |
| GET | /member/articles/:id | 已发布文章详情 |

## Decisions

1. **权限前缀** `content:article:*`，挂到「内容管理」菜单下
2. **C 端只读**：Member 不能创建/编辑文章，仅消费已发布内容
3. **状态过滤**：C 端 API 硬过滤 `status=1`，不暴露草稿
4. **作者**：`author_id` 取当前 Admin 用户 id（创建时）

## Risks

- Admin 动态路由需 seed 新菜单 — 在 init.seed 或独立 article seed 中追加
- 与 auth PR 分支依赖 — 基于 `auth-rbac-module` 代码开发

```

## openspec/changes/demo-business-module/tasks.md

- Source: openspec/changes/demo-business-module/tasks.md
- Lines: 1-32
- SHA256: 98d50218ef9aad92647ffbf7650650bccfeca00c5f315615f8e423fbe716f2b9

```md
## 1. 共享类型

- [ ] 1.1 新增 Article、ArticleListItem、CreateArticleDto 等类型 — 验证：三端编译通过

## 2. 数据库与 Seed

- [ ] 2.1 ArticleEntity + migration/sync — 验证：表结构与 design 一致
- [ ] 2.2 扩展 RBAC seed：文章管理菜单 + 5 权限码 — 验证：Admin 菜单可见
- [ ] 2.3 示例文章 seed（dev） — 验证：`pnpm seed` 或 seed 单测

## 3. Server — Article API

- [ ] 3.1 B 端 `/articles` CRUD + publish — 验证：e2e + PermissionGuard 403
- [ ] 3.2 C 端 `/member/articles` 只读列表/详情 — 验证：member e2e，草稿不可见
- [ ] 3.3 Admin Token 不可访问 `/member/articles` 混淆测试（可选）— 验证：隔离

## 4. Admin UI

- [ ] 4.1 文章列表页（分页、状态筛选） — 验证：admin 登录可访问
- [ ] 4.2 创建/编辑表单 + 发布/删除 — 验证：v-permission 按钮
- [ ] 4.3 动态路由对接新菜单 — 验证：侧边栏「文章管理」

## 5. Uni-app C 端 UI

- [ ] 5.1 文章列表页 — 验证：H5 登录后可浏览
- [ ] 5.2 文章详情页 — 验证：仅已发布内容
- [ ] 5.3 不调用 B 端 `/articles` 管理 API — 验证：仅用 `/member/articles`

## 6. 集成验证

- [ ] 6.1 Admin 创建发布 + Member 可见 smoke — 验证：双轨联调
- [ ] 6.2 `openspec validate demo-business-module --strict` — 验证：通过

```

## openspec/changes/demo-business-module/specs/article-admin-ui/spec.md

- Source: openspec/changes/demo-business-module/specs/article-admin-ui/spec.md
- Lines: 1-15
- SHA256: 74f17ef5e27a4ad8d19c3c1b5b88a0ec1571127d78fae170ac4fc2941bdf4c76

```md
## ADDED Requirements

### Requirement: 文章列表页
Admin MUST 提供文章管理列表页，展示标题、状态、发布时间，支持分页。

#### Scenario: 列表加载
- **WHEN** Admin 登录并访问文章管理
- **THEN** 调用 GET /articles 展示数据

### Requirement: 文章表单
Admin MUST 提供创建/编辑表单，支持保存草稿与发布。

#### Scenario: 发布按钮权限
- **WHEN** 用户无 content:article:publish 权限
- **THEN** 发布按钮不可见或禁用（v-permission）

```

## openspec/changes/demo-business-module/specs/article-api/spec.md

- Source: openspec/changes/demo-business-module/specs/article-api/spec.md
- Lines: 1-23
- SHA256: 350292525a2f630607c77bb52b9c71b98b6bda01827e69af927684d3cd2ab815

```md
## ADDED Requirements

### Requirement: B 端文章 CRUD
系统 MUST 提供 Admin 文章管理 API：`GET/POST /articles`、`GET/PUT/DELETE /articles/:id`、`PATCH /articles/:id/publish`，需 Admin Token 与对应 RBAC 权限。

#### Scenario: 创建文章
- **WHEN** Admin 提交 title、content 等字段
- **THEN** 返回 201 及文章 id，默认 status=草稿

#### Scenario: 无权限创建
- **WHEN** Admin 无 content:article:create 权限
- **THEN** 返回 403

### Requirement: C 端文章只读
系统 MUST 提供 `GET /member/articles` 与 `GET /member/articles/:id`，仅返回 status=已发布 的文章，需 Member Token。

#### Scenario: Member 浏览列表
- **WHEN** Member 已登录请求列表
- **THEN** 返回已发布文章分页列表，不含草稿

#### Scenario: 草稿不可见
- **WHEN** Member 请求草稿 id 详情
- **THEN** 返回 404

```

## openspec/changes/demo-business-module/specs/article-data-model/spec.md

- Source: openspec/changes/demo-business-module/specs/article-data-model/spec.md
- Lines: 1-8
- SHA256: 99c9360655346663812408925080d28686bcae0660bdf93b6b09b709206f8163

```md
## ADDED Requirements

### Requirement: article 表
系统 MUST 创建 article 表，字段含 id、title、summary、content、cover_url、status、author_id、published_at、created_at、updated_at。

#### Scenario: 表结构同步
- **WHEN** 非 production 环境启动或执行 seed
- **THEN** article 表存在且 title 非空约束生效

```

## openspec/changes/demo-business-module/specs/article-member-ui/spec.md

- Source: openspec/changes/demo-business-module/specs/article-member-ui/spec.md
- Lines: 1-22
- SHA256: 405de49649e3922948ce2229283ec2b5cad8e0cd20ed4d96d3bd73d07ba5f8aa

```md
## ADDED Requirements

### Requirement: C 端文章列表
Uni-app MUST 提供文章列表页，调用 `/member/articles`，需 Member 登录。

#### Scenario: 列表展示
- **WHEN** Member 登录后进入文章列表
- **THEN** 展示已发布文章标题与摘要

### Requirement: C 端文章详情
Uni-app MUST 提供文章详情页，调用 `/member/articles/:id`。

#### Scenario: 详情展示
- **WHEN** 点击列表项
- **THEN** 展示标题、正文、封面

### Requirement: 不接入 B 端管理 API
Uni-app MUST NOT 调用 `/articles` Admin 管理 API。

#### Scenario: API 隔离
- **WHEN** 检查 uni-app 源码
- **THEN** 无 `/articles`（非 `/member/articles`）管理端点调用

```

## openspec/changes/demo-business-module/specs/rbac-data-model/spec.md

- Source: openspec/changes/demo-business-module/specs/rbac-data-model/spec.md
- Lines: 1-12
- SHA256: debe8b26e4bfb87fd0ca83e1d5bbd9521c518bc3a20c304350e53a17c829f2ee

```md
## MODIFIED Requirements

### Requirement: Seed 数据
系统 MUST seed：admin/admin123 超级管理员 + RBAC 基础数据；dev 环境 seed 测试会员；并扩展**内容管理 / 文章管理**菜单及 content:article:* 权限。

#### Scenario: 首次 seed
- **WHEN** 执行 seed
- **THEN** 可分别用 admin 与测试手机号登录

#### Scenario: 文章菜单 seed
- **WHEN** 执行 seed
- **THEN** sys_menu 含「内容管理」目录与「文章管理」子菜单，super_admin 拥有文章权限

```

## openspec/changes/demo-business-module/specs/shared-types/spec.md

- Source: openspec/changes/demo-business-module/specs/shared-types/spec.md
- Lines: 1-12
- SHA256: 1d466c2419936eb7d90ca1a79de947a97874f6a6d0dd50395dc056425f3b46db

```md
## MODIFIED Requirements

### Requirement: 共享 types 包
系统 MUST 提供 `packages/shared-types` workspace 包，导出 API 通用类型、鉴权/RBAC 类型及 Article、ArticleListItem、CreateArticleDto、UpdateArticleDto 等业务类型。

#### Scenario: 子包引用共享类型
- **WHEN** admin 或 server 子包 import 共享 types
- **THEN** TypeScript 编译通过且类型定义一致

#### Scenario: 三端类型对齐
- **WHEN** server 返回 Article 列表或 LoginResponse
- **THEN** admin 与 uni-app 可使用相同类型解析

```
