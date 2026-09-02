---
comet_change: admin-art-design-pro
role: technical-design
canonical_spec: openspec
archived-with: 2026-09-02-admin-art-design-pro
status: final
---

# admin-art-design-pro 深度技术设计

## 1. 架构总览

```
art-design-pro 模板                nova-stack 保留/扩展
─────────────────                 ─────────────────────
Element Plus + Tailwind    +      @nova/shared-types
模板 Layout / Login        +      api/request.ts (JWT refresh)
useTable / 表单模式        +      GET /auth/me/menus → 动态侧栏
                                 menusToRoutes → views/**/*.vue
                                        ↑
Server RBAC CRUD ──────────────────────┘
  /users  /roles  /menus
```

**实施顺序**：Server RBAC API → Admin 模板基底 + 鉴权 → 系统管理 UI → 文章 UI → 收尾。

## 2. Server — RBAC 管理 API

### 2.1 模块结构

```
server/src/modules/rbac/
├── user/
│   ├── user.controller.ts      # NEW
│   ├── user.service.ts
│   └── dto/
├── role/
│   ├── role.controller.ts      # 扩展 CRUD + PUT :id/permissions
│   └── role.service.ts
└── menu/
    ├── menu.controller.ts      # 扩展 CRUD
    └── menu.service.ts
```

`AdminAuthGuard` 扩展：`/users` 前缀与 `/roles`、`/menus` 同级。

### 2.2 API 契约

| 资源 | 方法 | 路径 | 权限码 |
|------|------|------|--------|
| User | GET | /users | system:user:list |
| User | POST | /users | system:user:create |
| User | GET | /users/:id | system:user:list |
| User | PUT | /users/:id | system:user:update |
| User | DELETE | /users/:id | system:user:delete |
| User | PUT | /users/:id/roles | system:user:update |
| Role | GET/POST | /roles | system:role:list/create |
| Role | PUT/DELETE | /roles/:id | system:role:update/delete |
| Role | PUT | /roles/:id/permissions | system:role:update |
| Menu | GET/POST | /menus | system:menu:list/create |
| Menu | PUT/DELETE | /menus/:id | system:menu:update/delete |

**DTO 要点**（shared-types）：
- `CreateUserDto`: username, password, nickname?, status?
- `UpdateUserDto`: nickname?, status?（**MVP 不含改密码**）
- `AssignUserRolesDto`: roleIds: number[]
- `CreateRoleDto` / `UpdateRoleDto`: name, code, status, sort
- `AssignRolePermissionsDto`: permissionCodes: string[]
- `CreateMenuDto` / `UpdateMenuDto`: parentId, name, path, component, icon, type, permissionCode, sort, visible, status

**业务规则**：
- 禁止删除当前登录用户、禁止删除 `super_admin` 角色
- 创建用户 password bcrypt 哈希
- 菜单删除前检查是否有子菜单
- 角色/菜单变更后，已有 Token 的 permissions 仍来自 JWT 缓存 — MVP 接受「重新登录生效」；可选在文档注明

### 2.3 与现有 Auth 的关系

- `GET /auth/me/menus` 逻辑不变，读 sys_menu 树 + 用户权限过滤
- 菜单 CRUD 后，下次登录或 refresh 后菜单更新

## 3. Admin — art-design-pro 集成

### 3.1 引入方式

1. 在分支上将 art-design-pro 内容合并进 `admin/`（或拷贝后 `pnpm clean:dev`）
2. 保留/替换：
   - **保留逻辑**：`src/api/`、`src/store/modules/user.ts`、`src/router/menusToRoutes.ts`、`src/directives/permission.ts`
   - **采用模板**：`layouts`、登录页样式、表格/表单 composable、Tailwind 配置
3. 移除：`@arco-design/web-vue`、`unocss` 及相关配置

### 3.2 动态路由

```
登录成功
  → GET /auth/me/menus
  → menusToRoutes(menus)     // component: views/system/user/index
  → router.addRoute(layoutRoute, children)
  → 模板侧栏渲染同一 menu 树
```

**静态补充路由**（meta.hidden，不进菜单）：
- `/content/articles/create`
- `/content/articles/:id/edit`

**Seed 路径统一**（Build 时修改 init.seed）：
- `system/user/index` → `views/system/user/index`
- `system/role/index` → `views/system/role/index`
- `system/menu/index` → `views/system/menu/index`

### 3.3 系统管理 UI

| 页面 | 组件 | 功能 |
|------|------|------|
| 用户管理 | el-table + dialog 表单 | 列表、创建（含密码）、编辑、删除、分配角色 |
| 角色管理 | el-table + dialog | 列表、CRUD、Checkbox 组分配 permissionCodes |
| 菜单管理 | el-table + dialog | 列表（含 parentId 下拉）、CRUD |

按钮级 `v-permission="'system:user:create'"` 等与现有指令一致。

### 3.4 文章管理

- 列表：el-table + 分页 + status 筛选
- 表单：el-form；发布按钮 `v-permission="'content:article:publish'"`
- API 不变：`admin/src/api/article.ts`

## 4. 测试策略

| 层 | 范围 |
|----|------|
| Server unit | UserService/RoleService/MenuService 核心逻辑 |
| Server e2e | users/roles/menus CRUD、403、角色赋权后 permissions 变化（登录验证） |
| Admin | `pnpm --filter @nova/admin build` |
| 回归 | 现有 auth/article e2e 全绿 |
| Smoke | admin 登录 → 动态菜单 → 创建用户 → 角色赋权 → 文章 CRUD |

## 5. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 模板与 monorepo workspace 冲突 | 对齐 package.json name `@nova/admin`，保留 shared-types 依赖 |
| menusToRoutes 与模板 Layout 菜单数据结构不一致 | 适配函数：MenuNode → 模板 SidebarItem |
| PR 过大 | 按 tasks.md 6 段分批 commit |
| JWT permissions 不随 RBAC 编辑即时更新 | MVP 文档说明重新登录；后续可加 refresh 时重载 permissions |

## 6. 非目标（Design 级）

- 用户密码重置/改密 API
- 菜单拖拽排序
- 富文本编辑器
- uni-app / Member 端改动
