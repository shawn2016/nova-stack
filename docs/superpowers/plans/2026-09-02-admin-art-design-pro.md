---
change: admin-art-design-pro
design-doc: docs/superpowers/specs/2026-09-02-admin-art-design-pro-design.md
base-ref: aed24ad460b750420efbb6f91ab1b562d84d7bb0
---

# admin-art-design-pro 实施计划

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Goal:** 以 art-design-pro 重建 Admin，补齐 RBAC 管理 API，实现用户/角色/菜单/文章真实 CRUD，动态菜单驱动路由。

**Architecture:** Server RBAC CRUD 先行 → art-design-pro 模板基底 → 鉴权+动态路由 → 系统管理 UI → 文章 UI

**Spec:** docs/superpowers/specs/2026-09-02-admin-art-design-pro-design.md

## Global Constraints

- 产物语言：zh-CN
- 分支：`comet/admin-art-design-pro`
- 不动 uni-app / Member 端
- MVP：用户编辑不含改密码；JWT 权限变更需重新登录生效
- 菜单 component 统一 `views/...` 路径

---

## Task 1: 模板基底

- [x] 1.1 合并 art-design-pro 至 `admin/`，执行 demo 清理 — 验证：`pnpm --filter @nova/admin dev` 可启动
- [x] 1.2 接入 `@nova/shared-types`，对齐 monorepo 脚本 — 验证：根级 `predev` + build shared-types
- [x] 1.3 移除 Arco/UnoCSS 依赖残留 — 验证：`package.json` 无 `@arco-design/web-vue`

## Task 2: Server RBAC CRUD API

- [x] 2.1 shared-types：User/Role/Menu 管理 DTO — 验证：三端编译
- [x] 2.2 `GET/POST/PUT/DELETE /users` + `PUT /users/:id/roles` — 验证：e2e + 403
- [x] 2.3 `GET/POST/PUT/DELETE /roles` + `PUT /roles/:id/permissions` — 验证：e2e
- [x] 2.4 `GET/POST/PUT/DELETE /menus` — 验证：e2e；变更反映于 `/auth/me/menus`
- [x] 2.5 扩展 `AdminAuthGuard` `/users` — 验证：member token 403

## Task 3: Admin 鉴权与动态路由

- [x] 3.1 迁移 `api/request.ts`、`api/auth.ts`、user store — 验证：登录/刷新
- [x] 3.2 模板 Layout + `menusToRoutes` 对接 `GET /auth/me/menus` — 验证：侧栏动态渲染
- [x] 3.3 `v-permission` 适配 Element Plus — 验证：无权限按钮隐藏
- [x] 3.4 统一 seed menu component 路径 + 静态 hidden 路由（文章 create/edit）— 验证：路由可达

## Task 4: Admin 系统管理 UI

- [x] 4.1 用户管理页（列表/创建/编辑/删除/分配角色）— 验证：CRUD smoke
- [x] 4.2 角色管理页 + 权限 Checkbox — 验证：赋权后重新登录菜单变化
- [x] 4.3 菜单管理页（parentId 下拉）— 验证：CRUD 后动态菜单更新

## Task 5: Admin 文章管理 UI

- [x] 5.1 文章列表 + 表单 Element Plus — 验证：CRUD + publish + v-permission

## Task 6: 集成验证

- [x] 6.1 server test + e2e、admin build — 验证：全绿
- [x] 6.2 openspec validate admin-art-design-pro --strict — 验证：通过
- [x] 6.3 smoke：登录 → 用户 CRUD → 角色赋权 → 文章发布 — 验证：清单
