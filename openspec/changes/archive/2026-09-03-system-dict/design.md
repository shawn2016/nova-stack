## Context

批次 `scaffold-system-base` 第 2 项。现有 RBAC 模块（用户/角色/菜单）与 Admin 系统管理 UI 模式已稳定，可复用 `useTable`、对话框、权限码与 seed 结构。项目尚无字典表与 API。

## Goals / Non-Goals

**Goals:**
- 字典类型（type）与字典项（data）完整 CRUD
- Admin 管理页：类型列表 + 选中类型下的字典项管理
- 按 `typeCode` 查询字典项 API，供 Admin 表单下拉复用
- RBAC 权限与动态菜单 seed

**Non-Goals:**
- 站点配置、审计、uni-app
- Redis 缓存、i18n、树形字典、批量导入导出

## Decisions

### 1. 数据模型

**选择**：两张表 `sys_dict_type`、`sys_dict_data`

| 表 | 关键字段 |
|----|----------|
| `sys_dict_type` | `name`, `code`（唯一）, `status`, `remark` |
| `sys_dict_data` | `type_id`（FK）, `label`, `value`, `sort`, `status`, `remark` |

**理由**：经典字典模型，与若依/ruoyi 等后台惯例一致，便于 Admin 主从 UI

**约束**：同一 `type_id` 下 `value` 唯一；`code` 全局唯一

### 2. API 设计

```
# 字典类型（Admin + RequirePermission）
GET    /dict/types          — 分页列表
POST   /dict/types
PUT    /dict/types/:id
DELETE /dict/types/:id

# 字典项
GET    /dict/data           — 分页，query: typeId | typeCode
POST   /dict/data
PUT    /dict/data/:id
DELETE /dict/data/:id

# 下拉复用（Admin JWT，无需 list 权限也可读？→ 需 system:dict:data:list 或专用 dict:read）
GET    /dict/data/by-type/:code  — 返回 [{ label, value, sort }] 仅启用项
```

**权限码**：
- `system:dict:type:list|create|update|delete`
- `system:dict:data:list|create|update|delete`

**备选**：合并为单资源 `/dict/*` — 拒绝，类型与项生命周期不同

### 3. Admin UI

- 路由：`/system/dict`，组件 `views/system/dict/index`
- 布局：左侧类型表格 + 右侧选中类型的字典项表格（参考常见后台字典页）
- Composable：`useDict(typeCode)` → 调用 `by-type` API，返回 `ref<DictOption[]>`
- 权限：`v-permission` 控制增删改按钮

### 4. Seed

- permissions + 菜单「字典管理」挂到「系统管理」目录（sort 4）
- 可选示例：`user_status`（启用/禁用）、`article_status`（草稿/已发布）— 便于 smoke

### 5. 模块位置

- `server/src/modules/dict/` — DictModule，注册到 AppModule
- 遵循现有 RBAC controller/service/dto 分层

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 字典变更后前端缓存 stale | MVP 无缓存；`useDict` 每次 mount 拉取 |
| 删除类型级联 | 删除类型前检查是否有字典项，有则 400 |
| typeCode 被业务硬编码 | seed 示例 + 文档说明 |

## Migration

- TypeORM migration 或 synchronize（dev）新增两表
- `pnpm seed` 增量 upsert permissions/menus，不破坏现有数据

## Open Questions

- [x] Member 端是否需要字典 API — 否，本 change Non-Goal
- [ ] `by-type` 是否允许无 `dict:data:list` 的只读角色 — MVP：仍需 Admin JWT + 任意已登录管理员可读（或复用 list 权限）
