## 1. 模板基底

- [x] 1.1 引入 art-design-pro 骨架至 `admin/` — 验证：dev 可启动
- [x] 1.2 demo 清理 + 接入 `@nova/shared-types` — 验证：predev/build

## 2. Server — RBAC CRUD API

- [x] 2.1 `GET/POST/PUT/DELETE /users` + 权限 — 验证：e2e
- [x] 2.2 `GET/POST/PUT/DELETE /roles` + 角色-权限分配 — 验证：e2e
- [x] 2.3 `GET/POST/PUT/DELETE /menus` — 验证：e2e；变更反映于 `/auth/me/menus`
- [x] 2.4 shared-types 补充管理 DTO — 验证：编译通过

## 3. Admin — 鉴权与动态路由

- [x] 3.1 模板登录页 + Token 刷新 — 验证：`admin/admin123` 登录
- [x] 3.2 `GET /auth/me/menus` 驱动侧栏与 `menusToRoutes` — 验证：不同角色菜单不同
- [x] 3.3 `v-permission` 适配 Element Plus — 验证：无权限按钮隐藏

## 4. Admin — 系统管理（真实 CRUD）

- [x] 4.1 用户管理页 — 验证：列表/创建/编辑/删除
- [x] 4.2 角色管理页 + 权限勾选 — 验证：保存后权限生效
- [x] 4.3 菜单管理页 — 验证：CRUD 后动态菜单更新

## 5. Admin — 内容管理

- [ ] 5.1 文章列表 + 表单（Element Plus）— 验证：CRUD + 发布

## 6. 收尾

- [ ] 6.1 移除 Arco、UnoCSS — 验证：package.json 干净
- [ ] 6.2 `pnpm --filter @nova/admin build` + server e2e — 验证：通过
- [ ] 6.3 smoke：登录 → 用户/角色/菜单任一 CRUD → 文章发布 — 验证：清单通过
