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
