# Comet Design Handoff

- Change: auth-rbac-module
- Phase: design
- Mode: compact
- Context hash: b42650447c78198b091916a8645ff2e30ee79bef4383201e81c78e7ea8ec62f0

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/auth-rbac-module/proposal.md

- Source: openspec/changes/auth-rbac-module/proposal.md
- Lines: 1-43
- SHA256: e2f8d3c9fa4fe4bcfcde4af0e1a9aa530ddd3d66c9a4e764e891a353cc34ae50

```md
## Why

脚手架阶段（`init-monorepo-scaffold`）仅提供 JWT/RBAC **占位**模块。管理后台（B 端）需要完整的 RBAC 菜单/按钮权限；Uni-app（C 端/客户端）需要**独立的会员登录体系**，与后台管理员账号分离。同时需修复 CORS、JWT 生产 fail-fast 等脚手架遗留问题。

## What Changes

- **Server — B 端鉴权**：Admin 用户登录/登出/刷新、Redis JWT 黑名单、SysUser/Role/Permission/Menu RBAC
- **Server — C 端鉴权**：Member 会员独立登录体系（独立用户表与 API，不走 RBAC 菜单）
- **Server — 共享基础设施**：JWT 签发服务、Redis 黑名单、CORS、生产密钥校验
- **Admin**：B 端登录、动态路由、v-permission 按钮权限
- **Uni-app**：C 端会员登录/注册（简化），Token 持久化，**不接入 B 端 RBAC 菜单**
- **shared-types**：B 端与 C 端分离的 DTO/类型
- **数据库**：完整表结构设计（见 design.md §数据库设计）

## Capabilities

### New Capabilities

- `auth-api`: B 端 Admin 登录/登出/刷新 + Redis 黑名单 + JWT 基础设施
- `member-auth-api`: C 端 Member 登录/注册/登出/刷新（独立 API 前缀 `/member/auth`）
- `rbac-data-model`: B 端 SysUser/Role/Permission/Menu 实体、关联表、seed
- `rbac-api`: B 端 RBAC 管理 API、当前管理员菜单/权限查询
- `admin-auth-ui`: Admin B 端登录、动态路由、按钮权限
- `member-auth-ui`: Uni-app C 端会员登录页与 Token 管理

### Modified Capabilities

- `server-scaffold`: JWT/RBAC 占位 → 完整实现；启用 CORS
- `admin-scaffold`: 路由守卫、Axios 鉴权集成
- `uni-app-scaffold`: C 端会员 request/Token 集成（非 B 端 RBAC）
- `shared-types`: 扩展 Admin/Member 分离类型

## Impact

- **新增数据表**: `sys_user`, `sys_role`, `sys_permission`, `sys_menu`, `sys_user_role`, `sys_role_permission`, `member_user`
- **API 分离**: `/auth/*`（B 端 Admin）、`/member/auth/*`（C 端 Member）
- **后续 change**: `demo-business-module` 基于 Member 身份做 C 端业务

## Non-Goals

- C 端 RBAC 菜单/按钮权限（C 端仅认证，不做后台式权限树）
- OAuth/第三方登录、多租户
- 完整用户/会员管理后台 CRUD UI

```

## openspec/changes/auth-rbac-module/design.md

- Source: openspec/changes/auth-rbac-module/design.md
- Lines: 1-166
- SHA256: 9f1fc668aa85dad6ec442cb4f55e3a3a6750c057b613b8abeccf414e86d119f9

[TRUNCATED]

```md
## Context

在脚手架基础上实现 **B 端（Admin）与 C 端（Uni-app Member）双轨鉴权体系**，共享 JWT/Redis 基础设施但用户表与 API 分离。OpenSpec delta spec 为需求事实源，本文档含完整数据库表设计。

## Goals / Non-Goals

**Goals:**
- B 端：经典 RBAC（SysUser ↔ Role ↔ Permission ↔ Menu 树）
- C 端：Member 独立登录/register，JWT 认证，无 RBAC 菜单
- 共享：JWT 签发、Redis 黑名单、CORS、生产密钥 fail-fast
- **完整数据库表设计**（见下文）

**Non-Goals:**
- C 端权限树、OAuth、多租户

## 数据库设计

### ER 关系

```
[B 端 RBAC]
sys_user ──M:N── sys_role ──M:N── sys_permission
sys_menu（树形，type: directory | menu | button）
sys_menu.permission_code → sys_permission.code（可选关联）

[C 端 Member]
member_user（独立表，与 sys_user 无关联）
```

### 表结构

#### `sys_user` — B 端管理员

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| username | VARCHAR(64) UNIQUE | 登录名 |
| password_hash | VARCHAR(255) | bcrypt |
| nickname | VARCHAR(64) | 昵称 |
| avatar | VARCHAR(512) | 头像 URL |
| status | TINYINT | 0=禁用 1=正常 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### `sys_role`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| name | VARCHAR(64) | 角色名 |
| code | VARCHAR(64) UNIQUE | 如 `super_admin` |
| status | TINYINT | 0/1 |
| sort | INT | 排序 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### `sys_permission`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| name | VARCHAR(64) | 权限名 |
| code | VARCHAR(128) UNIQUE | 如 `system:user:list` |
| type | VARCHAR(16) | menu / button / api |
| created_at | DATETIME | |

#### `sys_menu`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| parent_id | BIGINT | 父菜单 ID，0=根 |
| name | VARCHAR(64) | 菜单名 |
| path | VARCHAR(256) | 前端路由 path |
| component | VARCHAR(256) | 组件路径 |
| icon | VARCHAR(64) | 图标 |
| type | VARCHAR(16) | directory / menu / button |
| permission_code | VARCHAR(128) | 关联权限码 |
| sort | INT | 排序 |
| visible | TINYINT | 是否可见 |

```

Full source: openspec/changes/auth-rbac-module/design.md

## openspec/changes/auth-rbac-module/tasks.md

- Source: openspec/changes/auth-rbac-module/tasks.md
- Lines: 1-42
- SHA256: 37438c44b29d574cecc020f9739f89e34b7000af4e7348100728bc6bb97b5f62

```md
## 1. 共享类型扩展

- [ ] 1.1 新增 AdminLoginResponse、MemberLoginResponse、UserInfo、MemberInfo、MenuNode 等类型 — 验证：三端编译通过

## 2. 数据库与 Seed

- [ ] 2.1 创建实体与 migration：sys_user、sys_role、sys_permission、sys_menu、sys_user_role、sys_role_permission、member_user — 验证：表结构与设计文档一致
- [ ] 2.2 实现 seed（admin/admin123 + RBAC 基础 + 测试会员） — 验证：`pnpm seed` 成功
- [ ] 2.3 生产 JWT_SECRET fail-fast — 验证：弱密钥 production 启动失败

## 3. Server — B 端 Auth API

- [ ] 3.1 `POST /auth/login|logout|refresh`（sys_user） — 验证：admin e2e
- [ ] 3.2 Redis JWT 黑名单 — 验证：登出后 401
- [ ] 3.3 `GET /auth/me` + `GET /auth/me/menus` — 验证：返回菜单树
- [ ] 3.4 `@RequirePermission()` + PermissionGuard — 验证：403
- [ ] 3.5 Role/Menu CRUD API 骨架 — 验证：Swagger 可见
- [ ] 3.6 启用 CORS — 验证：admin 跨域 OK

## 4. Server — C 端 Member Auth API

- [ ] 4.1 `POST /member/auth/login|register|logout|refresh`（member_user） — 验证：member e2e
- [ ] 4.2 AdminGuard 拒绝 member Token 访问 B 端接口 — 验证：403
- [ ] 4.3 JWT payload type 区分 admin/member — 验证：解码正确

## 5. Admin B 端 UI

- [ ] 5.1 登录页对接 `/auth/login` — 验证：admin 可登录
- [ ] 5.2 Axios Token + refresh — 验证：401 自动刷新
- [ ] 5.3 动态路由 + v-permission — 验证：菜单与按钮权限
- [ ] 5.4 路由守卫 — 验证：未登录跳转 login

## 6. Uni-app C 端 UI

- [ ] 6.1 会员登录/注册页 — 验证：H5 登录成功
- [ ] 6.2 Member Token 注入 — 验证：带 Token 请求
- [ ] 6.3 不请求 B 端菜单 API — 验证：无 `/auth/me/menus` 调用

## 7. 集成验证

- [ ] 7.1 Admin 与 Member 分别登录 smoke — 验证：双轨互不干扰
- [ ] 7.2 `openspec validate auth-rbac-module --strict` — 验证：通过

```

## openspec/changes/auth-rbac-module/specs/admin-auth-ui/spec.md

- Source: openspec/changes/auth-rbac-module/specs/admin-auth-ui/spec.md
- Lines: 1-40
- SHA256: c9d433c80885bb9fc9577f391131c3993e0c7b97c1ea3821321bcd81326ca225

```md
## Purpose

Admin 管理端完整登录鉴权 UI：登录页、Token 管理、动态路由与按钮权限。

## ADDED Requirements

### Requirement: 登录页对接
Admin MUST 提供可用的登录页，提交用户名密码调用 `POST /auth/login`，成功后存储 Token 并跳转 Dashboard。

#### Scenario: 登录成功跳转
- **WHEN** 输入正确凭据并提交
- **THEN** 跳转至 Dashboard

### Requirement: Axios Token 注入与刷新
Admin MUST 在请求拦截器注入 Bearer Token；401 时尝试 refresh，失败则跳转登录。

#### Scenario: Token 自动刷新
- **WHEN** accessToken 过期但 refreshToken 有效
- **THEN** 自动刷新并重试原请求

### Requirement: 动态路由
Admin MUST 登录后根据 `GET /auth/me/menus` 动态注册业务路由。

#### Scenario: 动态路由注册
- **WHEN** 用户登录成功
- **THEN** 侧边栏展示有权菜单，点击可导航

### Requirement: 按钮权限指令
Admin MUST 提供 `v-permission` 指令，无权限时隐藏或禁用按钮。

#### Scenario: 无权限隐藏按钮
- **WHEN** 用户无 `system:user:add` 权限
- **THEN** 对应新增按钮不可见

### Requirement: 路由守卫
Admin MUST 未登录用户访问受保护路由时重定向至 `/login`。

#### Scenario: 未登录重定向
- **WHEN** 无 Token 访问 `/dashboard`
- **THEN** 重定向至 `/login`

```

## openspec/changes/auth-rbac-module/specs/admin-scaffold/spec.md

- Source: openspec/changes/auth-rbac-module/specs/admin-scaffold/spec.md
- Lines: 1-23
- SHA256: 2f9d92c5c758196c5d7470e93966515f485344ae5b95ecf187c6140467745019

```md
## MODIFIED Requirements

### Requirement: Axios 请求封装
系统 MUST 提供 Axios 实例封装，自动注入 JWT Token；401 时尝试 refresh，403 时提示无权限；并保留 baseURL 与通用 headers 配置。

#### Scenario: API 请求配置
- **WHEN** 组件通过封装后的 request 发起 HTTP 请求
- **THEN** 请求自动携带配置的 baseURL 与通用 headers

#### Scenario: Token 注入
- **WHEN** 用户已登录且 store 中有 accessToken
- **THEN** 每个请求自动携带 Authorization header

### Requirement: 路由与布局骨架
系统 MUST 提供基础路由配置（含登录页、主布局、404）及 Arco Design 布局组件；未登录 MUST 重定向 login，登录后 MUST 支持动态路由注册。

#### Scenario: 路由导航
- **WHEN** 用户访问根路径
- **THEN** 系统展示主布局或重定向至登录页

#### Scenario: 路由守卫
- **WHEN** 未登录访问受保护路由
- **THEN** 重定向至 /login

```

## openspec/changes/auth-rbac-module/specs/auth-api/spec.md

- Source: openspec/changes/auth-rbac-module/specs/auth-api/spec.md
- Lines: 1-37
- SHA256: 1c9c610236154281d72e49154e1e03ad61892d18c870000f8d7b4a7af0c8b7d7

```md
## Purpose

提供 B 端 Admin 用户的 JWT 登录鉴权 API 及共享 JWT/Redis 基础设施。

## ADDED Requirements

### Requirement: Admin 用户登录
系统 MUST 提供 `POST /auth/login`，校验 sys_user 用户名密码，成功返回 accessToken、refreshToken 及管理员信息。

#### Scenario: Admin 登录成功
- **WHEN** 提交有效管理员用户名和密码
- **THEN** 返回 200，JWT payload 含 `type: admin`

#### Scenario: Admin 登录失败
- **WHEN** 提交错误密码
- **THEN** 返回 401

### Requirement: Admin 登出与刷新
系统 MUST 提供 `POST /auth/logout` 与 `POST /auth/refresh`，行为同设计文档 B 端流程。

#### Scenario: Admin 登出
- **WHEN** Admin 携带 Token 登出
- **THEN** Token 入 Redis 黑名单

### Requirement: Redis JWT 黑名单
系统 MUST 维护 Redis 黑名单，Admin 与 Member Token 均适用。

#### Scenario: 黑名单拒绝
- **WHEN** 使用已登出 Token
- **THEN** 返回 401

### Requirement: 生产 JWT 密钥校验
系统 MUST 在 production 环境 fail-fast 弱 JWT_SECRET。

#### Scenario: 弱密钥拒绝启动
- **WHEN** NODE_ENV=production 且 JWT_SECRET 为默认值
- **THEN** 启动失败

```

## openspec/changes/auth-rbac-module/specs/member-auth-api/spec.md

- Source: openspec/changes/auth-rbac-module/specs/member-auth-api/spec.md
- Lines: 1-37
- SHA256: fd8328da2bbb2fc83cfdd68a09d84236f35f525ea1384bfbddf933e79de4f48a

```md
## Purpose

提供 C 端 Member 会员独立登录鉴权 API，与 B 端 Admin 体系分离。

## ADDED Requirements

### Requirement: Member 登录
系统 MUST 提供 `POST /member/auth/login`，校验 member_user（手机号+密码），JWT payload 含 `type: member`。

#### Scenario: Member 登录成功
- **WHEN** 提交有效手机号和密码
- **THEN** 返回 200 及 member Token，不含 RBAC 菜单

#### Scenario: Member 登录失败
- **WHEN** 手机号不存在或密码错误
- **THEN** 返回 401

### Requirement: Member 注册
系统 MUST 提供 `POST /member/auth/register`，创建 member_user 并返回 Token。

#### Scenario: 注册成功
- **WHEN** 提交未注册手机号与合法密码
- **THEN** 返回 201 及 Token

### Requirement: Member 登出与刷新
系统 MUST 提供 `POST /member/auth/logout` 与 `POST /member/auth/refresh`。

#### Scenario: Member 刷新 Token
- **WHEN** 提交有效 member refreshToken
- **THEN** 返回新 accessToken

### Requirement: Member 与 Admin 隔离
Member API MUST NOT 访问 sys_user 或 RBAC 菜单接口；Admin Guard MUST 拒绝 `type: member` 的 Token。

#### Scenario: Member Token 访问 Admin 接口
- **WHEN** Member Token 请求 `GET /auth/me/menus`
- **THEN** 返回 403

```

## openspec/changes/auth-rbac-module/specs/member-auth-ui/spec.md

- Source: openspec/changes/auth-rbac-module/specs/member-auth-ui/spec.md
- Lines: 1-33
- SHA256: 4f44d179ec5d589a0e44b77661bb8417ba69f464540339fa859a872c4debbea5

```md
## Purpose

Uni-app C 端会员登录 UI，对接 `/member/auth/*`，不接入 B 端 RBAC。

## ADDED Requirements

### Requirement: C 端登录页
Uni-app MUST 提供会员登录页，调用 `POST /member/auth/login`。

#### Scenario: H5 会员登录
- **WHEN** 输入手机号密码登录
- **THEN** Token 持久化，跳转首页

### Requirement: C 端注册页
Uni-app MUST 提供注册页，调用 `POST /member/auth/register`。

#### Scenario: 注册并登录
- **WHEN** 新用户注册成功
- **THEN** 自动登录并跳转首页

### Requirement: Member Token 注入
request 封装 MUST 注入 Member Bearer Token，401 跳转登录。

#### Scenario: 带 Token 请求
- **WHEN** 已登录会员发起 API 请求
- **THEN** Authorization header 携带 member Token

### Requirement: 不接入 B 端 RBAC
Uni-app MUST NOT 调用 `/auth/me/menus` 或 v-permission 类 B 端权限接口。

#### Scenario: 无菜单权限请求
- **WHEN** uni-app 启动
- **THEN** 不请求 Admin 菜单 API

```

## openspec/changes/auth-rbac-module/specs/rbac-api/spec.md

- Source: openspec/changes/auth-rbac-module/specs/rbac-api/spec.md
- Lines: 1-33
- SHA256: 297a208dac7d477b35b59c45f5f4b94bed7dc191761192bc8ac52e82ed3ffc57

```md
## Purpose

提供 RBAC 管理 API 与当前用户权限查询接口。

## ADDED Requirements

### Requirement: 当前用户信息
系统 MUST 提供 `GET /auth/me`，返回当前登录用户信息与角色列表。

#### Scenario: 获取当前用户
- **WHEN** 携带有效 Token 请求
- **THEN** 返回 user、roles、permissions

### Requirement: 当前用户菜单
系统 MUST 提供 `GET /auth/me/menus`，返回当前用户有权访问的菜单树（不含 button 或按需包含）。

#### Scenario: 获取菜单树
- **WHEN** 超级管理员请求
- **THEN** 返回完整菜单树

### Requirement: 权限校验 Guard
系统 MUST 提供 `@RequirePermission()` 装饰器与 PermissionGuard，无权限时返回 403。

#### Scenario: 无权限访问
- **WHEN** 用户访问需要 `system:role:list` 的接口但无该权限
- **THEN** 返回 403

### Requirement: RBAC 管理 API 骨架
系统 MUST 提供 Role/Menu 的基础 CRUD API（至少 list/create/update/delete 骨架），供 admin 后续扩展。

#### Scenario: 角色列表
- **WHEN** 有权限的管理员请求 `GET /roles`
- **THEN** 返回角色分页列表

```

## openspec/changes/auth-rbac-module/specs/rbac-data-model/spec.md

- Source: openspec/changes/auth-rbac-module/specs/rbac-data-model/spec.md
- Lines: 1-40
- SHA256: 5a41bc628234e6ebce1a0e86582ad66828f2f128c0f3333b9d9959c601027700

```md
## Purpose

定义 B 端 RBAC 数据库表结构：sys_user、sys_role、sys_permission、sys_menu 及关联表；C 端 member_user 独立表。

## ADDED Requirements

### Requirement: sys_user 表
系统 MUST 创建 sys_user 表，字段含 id、username、password_hash、nickname、avatar、status、created_at、updated_at。

#### Scenario: 表结构迁移
- **WHEN** 执行 migration 或 sync
- **THEN** sys_user 表存在且 username 唯一索引生效

### Requirement: sys_role 与 sys_permission 表
系统 MUST 创建 sys_role、sys_permission 表及 sys_user_role、sys_role_permission 关联表。

#### Scenario: 角色权限关联
- **WHEN** 为角色分配权限
- **THEN** sys_role_permission 存在对应记录

### Requirement: sys_menu 树形表
系统 MUST 创建 sys_menu 表，支持 parent_id 树形结构，type 为 directory/menu/button。

#### Scenario: 菜单树存储
- **WHEN** 插入父子菜单
- **THEN** 可按 parent_id 构建树

### Requirement: member_user 独立表
系统 MUST 创建 member_user 表（phone 唯一），与 sys_user 无 FK 关联。

#### Scenario: C 端用户独立
- **WHEN** 注册会员
- **THEN** 数据写入 member_user，不写入 sys_user

### Requirement: Seed 数据
系统 MUST seed：admin/admin123 超级管理员 + RBAC 基础数据；dev 环境 seed 测试会员。

#### Scenario: 首次 seed
- **WHEN** 执行 seed
- **THEN** 可分别用 admin 与测试手机号登录

```

## openspec/changes/auth-rbac-module/specs/server-scaffold/spec.md

- Source: openspec/changes/auth-rbac-module/specs/server-scaffold/spec.md
- Lines: 1-23
- SHA256: abf977a91e5cbc02069c9b7f43be4a3e8f5f3e018cbe5e3fb4d445a10d0e20b8

```md
## MODIFIED Requirements

### Requirement: JWT 与 RBAC 模块占位
系统 MUST 提供完整的 AuthModule 与 RbacModule 实现（非占位），含真实登录/登出/刷新、PermissionGuard 及 Redis 黑名单；占位 501 响应 MUST 被移除。

#### Scenario: 模块注册
- **WHEN** 应用启动
- **THEN** Auth 与 RBAC 模块加载完整业务逻辑

#### Scenario: 真实登录
- **WHEN** 调用 `POST /auth/login` 提交有效凭据
- **THEN** 返回 200 及 Token，而非 501

### Requirement: NestJS 应用可启动
系统 MUST 提供可独立启动的 NestJS 应用，默认监听可配置端口，启动后无致命错误；并 MUST 启用 CORS，允许 admin 与 uni-app dev origin 跨域访问。

#### Scenario: 本地启动 server
- **WHEN** 开发者配置环境变量并启动 server 子包
- **THEN** NestJS 应用成功启动并响应健康检查或根路由

#### Scenario: 跨域请求
- **WHEN** admin 从 localhost:5173 请求 API
- **THEN** 浏览器不阻止跨域响应

```

## openspec/changes/auth-rbac-module/specs/shared-types/spec.md

- Source: openspec/changes/auth-rbac-module/specs/shared-types/spec.md
- Lines: 1-12
- SHA256: dd7f809e3b7cfd1765488e89266b2dd4b1888a78764f63fc26d02cc747224767

```md
## MODIFIED Requirements

### Requirement: 共享 types 包
系统 MUST 提供 `packages/shared-types` workspace 包，导出 API 通用类型及 LoginRequest、LoginResponse、UserInfo、MenuNode、TokenPair 等鉴权/RBAC 类型。

#### Scenario: 子包引用共享类型
- **WHEN** admin 或 server 子包 import 共享 types
- **THEN** TypeScript 编译通过且类型定义一致

#### Scenario: 三端类型对齐
- **WHEN** server 返回 LoginResponse
- **THEN** admin 与 uni-app 可使用相同类型解析

```

## openspec/changes/auth-rbac-module/specs/uni-app-scaffold/spec.md

- Source: openspec/changes/auth-rbac-module/specs/uni-app-scaffold/spec.md
- Lines: 1-12
- SHA256: 99c7c39cc0e0de0829cb0c6530543e31def983f937d17230c886f6f446484218

```md
## MODIFIED Requirements

### Requirement: Pinia 与请求封装
系统 MUST 集成 Pinia user store（token/userInfo），并在 request 封装中注入 Bearer Token、处理 401 跳转登录；保留统一 baseURL 配置。

#### Scenario: 跨端请求
- **WHEN** 页面通过封装 request 发起 API 调用
- **THEN** 请求携带统一 baseURL 配置

#### Scenario: 带 Token 请求
- **WHEN** 已登录用户发起 API 请求
- **THEN** 请求头携带 Authorization Bearer Token

```
