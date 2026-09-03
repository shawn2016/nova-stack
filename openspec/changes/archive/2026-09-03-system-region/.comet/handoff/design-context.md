# Comet Design Handoff

- Change: system-region
- Phase: design
- Mode: compact
- Context hash: 690adc1397eb1b8953682d8a2b7545f522303a8d017be1e5765cbb5ce336866f

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/system-region/proposal.md

- Source: openspec/changes/system-region/proposal.md
- Lines: 1-34
- SHA256: 805ec4cd2687b246bd2723def4f71e3bf4d60709eb457fc87d408b7692c3ea3a

```md
## Why

系统管理模块已有用户/角色/菜单/字典等基础能力，但缺少**省市区行政区划**主数据。后续部门组织、地址表单、数据权限（按地区范围）均依赖统一的地区树。这是 System/Infra 扩展批次中**第 1 项**（用户已确认优先），采用多 change 分批交付。

## What Changes

- **Server — 地区树 CRUD**：新增 `sys_region` 实体与 REST API；支持省/市/区三级树形维护
- **Server — 内置 seed**：`pnpm seed` 导入国标省市区数据（可增量 upsert），并支持后台增删改
- **shared-types**：地区节点 DTO、树节点、列表项类型
- **Admin — 地区管理页**：树形表格维护（展开/折叠、增删改），对接 API
- **RBAC 扩展**：地区管理 permission 码与「系统管理」下菜单 seed

## Capabilities

### New Capabilities

- `region-api`: 地区树 CRUD、树形查询、按层级/关键词筛选
- `region-admin-ui`: Admin 地区管理页面

### Modified Capabilities

- （无）— 不修改现有 RBAC 行为，仅新增 permissions/menus seed

## Impact

- **主要影响**：`server/src/modules/region/`（新建）、`server/src/database/entities/`、`server/src/database/seeds/`（含地区 JSON）、`admin/src/views/system/region/`、`packages/shared-types/`
- **不影响**：uni-app、Member 端、通知/部门/数据权限/infra 模块（后续独立 change）

## Non-Goals

- 街道/乡镇四级及以下
- 地区与业务表（用户地址等）的关联绑定 — 后续 change
- 国际化多语言地区名、GeoJSON 边界
- 在线同步民政部最新区划 API

```

## openspec/changes/system-region/design.md

- Source: openspec/changes/system-region/design.md
- Lines: 1-84
- SHA256: f8ee421c1e4d9488efaeb072d4aa152017867a3fd5c73b4a3e30fe5f695537a3

[TRUNCATED]

```md
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


```

Full source: openspec/changes/system-region/design.md

## openspec/changes/system-region/tasks.md

- Source: openspec/changes/system-region/tasks.md
- Lines: 1-21
- SHA256: 3ef61768398d305d36dfacf8f796f9789a8f694f1e4be0f724c9e415cdc832d6

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 `sys_region` 实体 + TypeORM 注册 — 验证：建表成功
- [ ] 1.2 shared-types `region.ts`（ListItem、TreeNode、Create/Update Dto） — 验证：编译通过

## 2. Server 地区 API

- [ ] 2.1 RegionModule：tree + 分页 list + CRUD + 权限 — 验证：e2e 增删改查
- [ ] 2.2 删除约束（有子节点 400）、code 唯一 — 验证：e2e 边界
- [ ] 2.3 seed：`china-regions.json` + upsertRegions — 验证：seed 后省市区数量 > 0

## 3. Admin 地区管理 UI

- [ ] 3.1 `admin/src/api/region.ts` — 验证：类型编译
- [ ] 3.2 地区管理页（树形表格 + 对话框） — 验证：dev smoke CRUD
- [ ] 3.3 RBAC 菜单与权限按钮 — 验证：菜单可见、无权限隐藏操作

## 4. 集成验证

- [ ] 4.1 server test + e2e、admin build — 验证：全绿
- [ ] 4.2 openspec validate system-region --strict — 验证：通过

```

## openspec/changes/system-region/specs/region-admin-ui/spec.md

- Source: openspec/changes/system-region/specs/region-admin-ui/spec.md
- Lines: 1-16
- SHA256: 3bbd0b71c789e8417abc3e15709e657daadc40f383bdf7f636b369b4c4e6c8b6

```md
## ADDED Requirements

### Requirement: 地区管理页
Admin MUST 提供 `/system/region` 页面，树形展示地区，支持增删改与关键词搜索。

#### Scenario: 树形列表
- **WHEN** 管理员进入地区管理
- **THEN** 展示省市区树形表格，可展开/收起

#### Scenario: 新增子地区
- **WHEN** 有 create 权限并提交表单
- **THEN** 调用 POST `/regions` 并刷新树

#### Scenario: 权限控制
- **WHEN** 用户无 `system:region:delete`
- **THEN** 删除按钮不可见

```

## openspec/changes/system-region/specs/region-api/spec.md

- Source: openspec/changes/system-region/specs/region-api/spec.md
- Lines: 1-34
- SHA256: b05c3a1bc4d9deca8623c913560852fb1d108cb55fd4c569af7a73476f89a37c

```md
## ADDED Requirements

### Requirement: 地区树查询
系统 MUST 提供 `GET /regions/tree`，返回启用状态的省/市/区嵌套树，按 level 与 sort 排序。

#### Scenario: 管理页加载完整树
- **WHEN** 有 `system:region:list` 权限请求 tree
- **THEN** 返回嵌套 `{ id, parentId, name, code, level, sort, children? }[]`

#### Scenario: 禁用节点不可见
- **WHEN** 某节点 status=0
- **THEN** tree 响应中不包含该节点及其子孙

### Requirement: 地区 CRUD
系统 MUST 提供地区 list（分页）、create、update、delete API，需 Admin JWT 与 `@RequirePermission`。

#### Scenario: 创建区县
- **WHEN** POST 合法节点（parentId 指向市级、level=3、唯一 code）
- **THEN** 返回 201 及 string id

#### Scenario: code 重复
- **WHEN** POST 的 code 已存在
- **THEN** 返回 400

#### Scenario: 删除有子节点的地区
- **WHEN** DELETE 仍有子节点的记录
- **THEN** 返回 400，不删除

### Requirement: 内置国标 seed
系统 MUST 在 seed 中 upsert 完整省市区国标数据，重复 seed 不倍增记录。

#### Scenario: 首次 seed
- **WHEN** 执行 `pnpm seed`
- **THEN** 存在省级、市级、区县级记录，code 与国标 adcode 一致

```
