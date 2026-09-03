## 1. 数据模型与 shared-types

- [x] 1.1 `sys_region` 实体 + TypeORM 注册 — 验证：建表成功
- [x] 1.2 shared-types `region.ts`（ListItem、TreeNode、Create/Update Dto） — 验证：编译通过

## 2. Server 地区 API

- [x] 2.1 RegionModule：tree + 分页 list + CRUD + 权限 — 验证：e2e 增删改查
- [x] 2.2 删除约束（有子节点 400）、code 唯一 — 验证：e2e 边界
- [x] 2.3 seed：`china-regions.json` + upsertRegions — 验证：seed 后省市区数量 > 0

## 3. Admin 地区管理 UI

- [x] 3.1 `admin/src/api/region.ts` — 验证：类型编译
- [x] 3.2 地区管理页（树形表格 + 对话框） — 验证：dev smoke CRUD
- [x] 3.3 RBAC 菜单与权限按钮 — 验证：菜单可见、无权限隐藏操作

## 4. 集成验证

- [x] 4.1 server test + e2e、admin build — 验证：全绿
- [x] 4.2 openspec validate system-region --strict — 验证：通过
