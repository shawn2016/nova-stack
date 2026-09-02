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
