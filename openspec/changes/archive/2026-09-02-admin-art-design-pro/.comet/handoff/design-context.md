# Comet Design Handoff

- Change: admin-art-design-pro
- Phase: design
- Mode: compact
- Context hash: 5ea183df8e48b1c072eeb0e20461128de89eae1b39a7913bc2c90044e16727d8

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/admin-art-design-pro/proposal.md

- Source: openspec/changes/admin-art-design-pro/proposal.md
- Lines: 1-32
- SHA256: bc3928a0f635e7016b6d9a0c52f0c4af646131de01cbd8cd0577c3be06c6a05b

```md
## Why

当前 Admin 基于自建 Arco Design 脚手架，视觉与交互与主流后台模板差距较大。项目应统一采用 [art-design-pro](https://github.com/Daymychen/art-design-pro) 作为 Admin 模板基底（Vue3 + Element Plus + Tailwind），在保持现有后端 RBAC 语义的前提下，提供**真实可用**的系统管理（用户、角色、菜单）与内容管理，而非按钮占位 demo。

## What Changes

- **BREAKING**：`admin/` 以 art-design-pro 为基底重建（非 Arco + UnoCSS 增量替换）
- 运行 demo 清理，采用模板登录页、布局、表格/表单模式
- **系统管理（真实功能）**：用户管理、角色管理、菜单管理 — 完整 CRUD UI，对接后端 API，`v-permission` 控制操作按钮
- **动态菜单**：登录后 `GET /auth/me/menus` 驱动侧栏与路由注册（非静态路由表）
- **内容管理**：文章 CRUD 迁移至 Element Plus
- **Server 扩展**：补齐 `/users`、`/roles`、`/menus` 的 CRUD API（当前仅 roles/menus 有 list，无 users 管理 API）
- **不变**：双轨鉴权（Admin/Member 分离）、现有权限码命名、`uni-app` C 端

## Capabilities

### New Capabilities

- `admin-system-ui`: Admin 用户/角色/菜单管理页面（真实 CRUD，非占位）

### Modified Capabilities

- `admin-scaffold`: 技术栈迁移为 art-design-pro（Element Plus + Tailwind）
- `admin-auth-ui`: 登录页与鉴权 UI 适配模板；动态菜单与路由
- `article-admin-ui`: 文章管理页迁移 Element Plus
- `rbac-api`: 扩展用户/角色/菜单完整 CRUD API，供 Admin 系统管理调用

## Impact

- **主要影响**：`admin/` 全量重建；`server/src/modules/rbac/` 与用户模块扩展
- **shared-types**：可能新增 User/Role/Menu 管理 DTO
- **不影响**：`uni-app`、Member 鉴权、article C 端 API

```

## openspec/changes/admin-art-design-pro/design.md

- Source: openspec/changes/admin-art-design-pro/design.md
- Lines: 1-48
- SHA256: 6a516e7ac6e6b4cb04b2bf5421c2c8b1e5f672a956db22c7f9874d0130a1dfe1

```md
## Context

见 `proposal.md`。当前 Admin 系统管理页为 Arco 占位按钮；Server 侧 roles/menus 仅有 `GET` list，缺少 users 管理 API 与完整 CRUD。用户要求采用 art-design-pro 模板，且系统管理必须真实可用。

## Goals / Non-Goals

**Goals:**
- art-design-pro 为基底重建 `admin/`
- 登录页使用模板风格；登录后**动态菜单**驱动侧栏与路由
- **真实系统管理**：用户、角色、菜单 — 列表/表单/删除/权限分配（按现有 RBAC 权限码）
- 文章管理完整迁移
- Server 补齐 RBAC 管理 CRUD API + e2e 覆盖核心场景
- Admin build 通过 + 手工 smoke

**Non-Goals:**
- uni-app 改动
- 富文本、工作流审批
- art-design-pro 全部 demo 业务页（仅保留与本项目 API 对接的模块）

## Decisions

1. **模板 + 业务分层**：UI/布局来自 art-design-pro；数据层复用 `api/` + `@nova/shared-types`；系统管理参考模板表格/表单模式（useTable 等）实现真实 CRUD

2. **动态菜单唯一来源**：侧栏与 `addRoute` 仅来自 `GET /auth/me/menus`，禁止硬编码业务菜单（静态路由仅保留 login、404、hidden 表单页如 create/edit）

3. **Server API 先行**：Task 顺序 — RBAC CRUD API（含 users）→ Admin 系统管理页 → 文章页 → 收尾

4. **权限模型不变**：继续 `system:user:*`、`system:role:*`、`system:menu:*` 与 `content:article:*`；按钮级 `v-permission`

5. **角色-权限/用户-角色**：角色编辑支持勾选权限；用户编辑支持分配角色（MVP 可先列表+编辑，复杂树形按 art-design-pro 组件实现）

## Risks / Trade-offs

- **[Risk] 范围扩大（含 Server CRUD）** → 任务分阶段；API 先 e2e 再 UI
- **[Risk] 模板 demo 与 nova 菜单 path 不一致** → menusToRoutes 映射表 + seed 菜单 path 对齐
- **[Trade-off] 菜单管理编辑涉及树形结构** → MVP 支持列表+编辑；树形拖拽可后续迭代

## Migration Plan

1. 分支 `comet/admin-art-design-pro` 上引入 art-design-pro 骨架
2. Server：users/roles/menus CRUD
3. Admin：鉴权 + 动态路由 + 系统管理三页 + 文章管理
4. 移除 Arco/UnoCSS；验证 build 与 smoke

## Open Questions

- 用户管理是否包含重置密码 API（建议 MVP：创建用户时设密码，编辑不改密码或单独 endpoint）
- 菜单管理是否 MVP 仅编辑元数据（path/component/permission），树形排序 Phase 2

```

## openspec/changes/admin-art-design-pro/tasks.md

- Source: openspec/changes/admin-art-design-pro/tasks.md
- Lines: 1-33
- SHA256: 271e5b03224dff2e029327a57bd00b383752ce373d5197a449bac3ce37f8974e

```md
## 1. 模板基底

- [ ] 1.1 引入 art-design-pro 骨架至 `admin/` — 验证：dev 可启动
- [ ] 1.2 demo 清理 + 接入 `@nova/shared-types` — 验证：predev/build

## 2. Server — RBAC CRUD API

- [ ] 2.1 `GET/POST/PUT/DELETE /users` + 权限 — 验证：e2e
- [ ] 2.2 `GET/POST/PUT/DELETE /roles` + 角色-权限分配 — 验证：e2e
- [ ] 2.3 `GET/POST/PUT/DELETE /menus` — 验证：e2e；变更反映于 `/auth/me/menus`
- [ ] 2.4 shared-types 补充管理 DTO — 验证：编译通过

## 3. Admin — 鉴权与动态路由

- [ ] 3.1 模板登录页 + Token 刷新 — 验证：`admin/admin123` 登录
- [ ] 3.2 `GET /auth/me/menus` 驱动侧栏与 `menusToRoutes` — 验证：不同角色菜单不同
- [ ] 3.3 `v-permission` 适配 Element Plus — 验证：无权限按钮隐藏

## 4. Admin — 系统管理（真实 CRUD）

- [ ] 4.1 用户管理页 — 验证：列表/创建/编辑/删除
- [ ] 4.2 角色管理页 + 权限勾选 — 验证：保存后权限生效
- [ ] 4.3 菜单管理页 — 验证：CRUD 后动态菜单更新

## 5. Admin — 内容管理

- [ ] 5.1 文章列表 + 表单（Element Plus）— 验证：CRUD + 发布

## 6. 收尾

- [ ] 6.1 移除 Arco、UnoCSS — 验证：package.json 干净
- [ ] 6.2 `pnpm --filter @nova/admin build` + server e2e — 验证：通过
- [ ] 6.3 smoke：登录 → 用户/角色/菜单任一 CRUD → 文章发布 — 验证：清单通过

```

## openspec/changes/admin-art-design-pro/specs/admin-auth-ui/spec.md

- Source: openspec/changes/admin-art-design-pro/specs/admin-auth-ui/spec.md
- Lines: 1-15
- SHA256: c13b54ec2f7c2cb684f9d6f2a951bb6a1905bc275a3604f8e5578677fedf5eae

```md
## MODIFIED Requirements

### Requirement: 登录页对接
Admin MUST 提供可用的登录页（Element Plus 表单），提交用户名密码调用 `POST /auth/login`，成功后存储 Token 并跳转 Dashboard。

#### Scenario: 登录成功跳转
- **WHEN** 输入正确凭据并提交
- **THEN** 跳转至 Dashboard

### Requirement: 按钮权限指令
Admin MUST 提供 `v-permission` 指令（或等价权限组件），无权限时隐藏或禁用按钮；与 art-design-pro 按钮/表格操作列兼容。

#### Scenario: 无权限隐藏按钮
- **WHEN** 用户无 `content:article:publish` 权限
- **THEN** 对应发布按钮不可见

```

## openspec/changes/admin-art-design-pro/specs/admin-scaffold/spec.md

- Source: openspec/changes/admin-art-design-pro/specs/admin-scaffold/spec.md
- Lines: 1-19
- SHA256: d907c42bbc0c7033d0529f9bf647aa6e1c7deaec157cf6a4ada6426b3e551229

```md
## MODIFIED Requirements

### Requirement: Admin 应用可启动
系统 MUST 提供可独立启动的 Vue3 + Vite 管理端应用，基于 art-design-pro 模板（Element Plus + Tailwind CSS），默认开发服务器可访问。

#### Scenario: 本地启动 admin
- **WHEN** 开发者启动 admin 子包开发服务器
- **THEN** 浏览器可访问登录/首页布局页面

### Requirement: 路由与布局骨架
系统 MUST 提供基础路由配置（含登录页、主布局、404）及 art-design-pro 布局组件；未登录 MUST 重定向 login，登录后 MUST 支持动态路由注册。

#### Scenario: 路由导航
- **WHEN** 用户访问根路径
- **THEN** 系统展示主布局或重定向至登录页

#### Scenario: 路由守卫
- **WHEN** 未登录访问受保护路由
- **THEN** 重定向至 /login

```

## openspec/changes/admin-art-design-pro/specs/admin-system-ui/spec.md

- Source: openspec/changes/admin-art-design-pro/specs/admin-system-ui/spec.md
- Lines: 1-37
- SHA256: 9629870df9f6f44d596696dde9a282c6668b9c4fd9f989237f9a5f44789fee15

```md
## Purpose

Admin 系统管理模块：用户、角色、菜单的真实 CRUD 页面，对接 RBAC API，非占位 demo。

## ADDED Requirements

### Requirement: 用户管理页
Admin MUST 提供用户管理页：分页列表、创建、编辑、删除（或禁用），对接用户管理 API；操作按钮受 `system:user:*` 权限控制。

#### Scenario: 用户列表
- **WHEN** 有 `system:user:list` 权限的管理员访问用户管理
- **THEN** 展示用户分页列表（用户名、昵称、状态等）

#### Scenario: 创建用户
- **WHEN** 有 `system:user:create` 权限并提交创建表单
- **THEN** 调用 POST 用户 API 成功并刷新列表

### Requirement: 角色管理页
Admin MUST 提供角色管理页：列表、创建、编辑、删除，支持为角色分配权限；对接角色 API。

#### Scenario: 角色列表与权限分配
- **WHEN** 编辑某角色并勾选权限后保存
- **THEN** 角色权限更新生效，重新登录或刷新权限后菜单/按钮符合新权限

### Requirement: 菜单管理页
Admin MUST 提供菜单管理页：列表（或树形）、创建、编辑、删除菜单项；对接菜单 API；菜单变更影响后续 `GET /auth/me/menus` 结果。

#### Scenario: 编辑菜单
- **WHEN** 管理员修改菜单 path 或 permission 并保存
- **THEN** 有相应权限的用户登录后动态菜单反映变更

### Requirement: 动态侧栏菜单
Admin MUST 登录成功后仅根据 `GET /auth/me/menus` 渲染侧栏并注册路由，不得依赖静态业务菜单配置。

#### Scenario: 不同角色不同菜单
- **WHEN** 普通管理员与 super_admin 分别登录
- **THEN** 侧栏菜单集合不同，均来自各自 `/auth/me/menus` 响应

```

## openspec/changes/admin-art-design-pro/specs/article-admin-ui/spec.md

- Source: openspec/changes/admin-art-design-pro/specs/article-admin-ui/spec.md
- Lines: 1-15
- SHA256: 55c6e45caee6d14fe6f357c6ce4cb1dd3dda5b9b37b03b769b41854fba11bc8d

```md
## MODIFIED Requirements

### Requirement: 文章列表页
Admin MUST 提供文章管理列表页（Element Plus 表格），展示标题、状态、发布时间，支持分页与状态筛选。

#### Scenario: 列表加载
- **WHEN** Admin 登录并访问文章管理
- **THEN** 调用 GET /articles 展示数据

### Requirement: 文章表单
Admin MUST 提供创建/编辑表单（Element Plus 表单组件），支持保存草稿与发布。

#### Scenario: 发布按钮权限
- **WHEN** 用户无 content:article:publish 权限
- **THEN** 发布按钮不可见或禁用（v-permission）

```

## openspec/changes/admin-art-design-pro/specs/rbac-api/spec.md

- Source: openspec/changes/admin-art-design-pro/specs/rbac-api/spec.md
- Lines: 1-32
- SHA256: 55c40a114f193019d19852ffa48e933a8c49654dac3e5924d38e60da00fda46d

```md
## MODIFIED Requirements

### Requirement: RBAC 管理 API 骨架
系统 MUST 提供 User、Role、Menu 的完整 CRUD API（list/create/update/delete），供 Admin 系统管理调用；各端点需 `@RequirePermission` 与 Admin Token。

#### Scenario: 角色列表
- **WHEN** 有权限的管理员请求 `GET /roles`
- **THEN** 返回角色列表（可分页）

#### Scenario: 创建角色
- **WHEN** POST `/roles` 提交合法角色数据
- **THEN** 返回 201 及新角色 id

#### Scenario: 用户列表
- **WHEN** 有 `system:user:list` 权限请求 `GET /users`
- **THEN** 返回用户分页列表

#### Scenario: 创建用户
- **WHEN** POST `/users` 提交用户名与密码
- **THEN** 创建 sys_user 并返回用户信息（不含密码 hash）

#### Scenario: 菜单 CRUD
- **WHEN** 对 `/menus` 执行 CRUD
- **THEN** 菜单数据持久化且 `/auth/me/menus` 可反映变更

#### Scenario: 角色分配权限
- **WHEN** PUT `/roles/:id/permissions` 提交 permissionCodes
- **THEN** 该角色关联权限更新，用户重新登录后 permissions 反映变更

#### Scenario: 用户分配角色
- **WHEN** PUT `/users/:id/roles` 提交 roleIds
- **THEN** 用户角色关联更新，重新登录后菜单与权限反映变更

```
