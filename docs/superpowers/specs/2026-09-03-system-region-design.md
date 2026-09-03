---
comet_change: system-region
role: technical-design
canonical_spec: openspec
archived-with: 2026-09-03-system-region
status: final
---

# system-region 深度技术设计

## 1. 架构总览

```
Admin 地区管理页                 Server RegionModule
───────────────                 ─────────────────
region/index.vue ──CRUD──► RegionController
  树形表格 ◄── GET /regions/tree
  分页/搜索 ◄── GET /regions?page&keyword
```

**实施顺序**：实体 + shared-types → Region API + e2e → seed（国标 JSON）→ Admin UI → 集成验证

## 2. 数据模型

### sys_region

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | API string |
| parent_id | bigint | `'0'` 表示顶级（省级 parent） |
| name | varchar(64) | 区划名称 |
| code | varchar(12) UNIQUE | 国标 adcode |
| level | tinyint | 1 省 / 2 市 / 3 区县 |
| sort | int | 同层排序，默认 0 |
| status | tinyint | 1 启用 0 禁用 |
| created_at / updated_at | datetime | |

**约束**：`code` 全局唯一；删除时若存在 `parent_id = id` 的子节点 → 400

## 3. API

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/regions/tree` | list | 启用节点嵌套树 |
| GET | `/regions` | list | 分页平铺，keyword 搜 name/code |
| GET | `/regions/:id` | list | 详情 |
| POST | `/regions` | create | 创建 |
| PUT | `/regions/:id` | update | 更新 |
| DELETE | `/regions/:id` | delete | 删除（无子节点） |

权限码：`system:region:list|create|update|delete`

## 4. Seed

- 数据文件：`server/src/database/seeds/data/china-regions.flat.json`
- 格式：`[{ code, name, parentCode, level, sort }]`
- 来源：国标省市区 flat 列表（由 `scripts/build-china-regions-seed.mjs` 从公开 pca 数据生成，提交生成物）
- `upsertRegions()`：按 `code` upsert，parent 通过 code 映射为 id

## 5. Admin UI

- 路径：`admin/src/views/system/region/index.vue`
- 模式：参考 `menu/index.vue` 树形表格 + 搜索 + 对话框
- API：`admin/src/api/region.ts`
- 菜单：系统管理下「地区管理」，`permissionCode: system:region:list`

## 6. 测试

- e2e：tree 结构、CRUD、code 重复、删有子节点 400
- seed.spec：seed 后省级数量 = 34（含港澳台则按数据集）

## 7. 非目标

Member 只读 API、街道级、Excel 导入 — 后续 change
