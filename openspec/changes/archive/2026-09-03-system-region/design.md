## Context

`stack-consolidation` 已统一 API `/api` 前缀、RBAC 分页与 string ID、Admin `useTable`/权限模式。字典模块已提供主从 CRUD 参考；菜单模块提供树形 seed 参考。本 change 为 System 扩展批次首项。

## Goals / Non-Goals

**Goals:**
- 省/市/区三级树形 CRUD
- seed 内置国标行政区划数据（GB/T 2260 风格 adcode），支持 upsert 不重复导入
- Admin 树形表格管理页
- RBAC 权限与菜单

**Non-Goals:**
- 街道级、港澳台特殊规则、批量 Excel 导入
- C 端/Member 地区 API（可后续加 `@Public` 只读接口）
- 与部门/数据权限联动

## Decisions

### 1. 数据模型

**选择**：单表 `sys_region` 自关联树

| 字段 | 说明 |
|------|------|
| `id` | bigint → API string |
| `parent_id` | `'0'` 为省级根的上级占位；省级 parent=`'0'` |
| `name` | 区划名称 |
| `code` | 行政区划代码（adcode，6 位，全局唯一） |
| `level` | `1` 省 / `2` 市 / `3` 区县 |
| `sort` | 同层排序 |
| `status` | `0` 禁用 / `1` 启用 |

**约束**：`code` 唯一；删除前检查子节点；禁用父节点不自动禁用子节点（MVP）

### 2. API 设计

```
GET    /regions/tree          — 完整启用树（管理页/下拉）
GET    /regions               — 分页平铺，query: page, pageSize, keyword, level?, parentId?
GET    /regions/:id           — 详情
POST   /regions
PUT    /regions/:id
DELETE /regions/:id           — 有子节点则 400
```

**权限码**：`system:region:list|create|update|delete`

### 3. Seed 数据

- 静态 JSON：`server/src/database/seeds/data/china-regions.json`（省+市+区完整国标数据集，按 adcode 层级）
- `upsertRegions()`：按 `code` upsert，重复执行不倍增
- seed 体积：约 3000+ 区县行；首次 seed 可接受（仅 dev/初始化）

### 4. Admin UI

- 路由：`/system/region`，`views/system/region/index`
- 树形表格（参考菜单管理）：搜索 name/code，展开/收起
- 对话框：上级地区选择（ElTreeSelect 或 Select + 树数据）、level 随父级推导或只读展示
- Composable（可选本 change）：`useRegionTree()` 缓存树供表单复用

### 5. 模块位置

- `server/src/modules/region/` — RegionModule
- `packages/shared-types/src/region.ts`
- `admin/src/api/region.ts`

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| seed JSON 体积大 | 独立 data 文件，git 可接受；生产仅 upsert |
| 区划变更（撤县设区） | MVP 手工维护；文档说明 seed 可重跑 upsert |
| 树表性能 | 3000 节点前端一次性加载可接受；后续可加 lazy load |

## Migration

- TypeORM synchronize（dev）或 migration 新增 `sys_region`
- seed 增量 permissions/menus

## Open Questions

- [x] 数据来源 — seed 内置国标 + 后台 CRUD
- [ ] Member 只读 tree API — 后续 change
