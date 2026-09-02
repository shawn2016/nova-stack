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
