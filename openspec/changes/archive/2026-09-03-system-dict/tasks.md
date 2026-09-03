## 1. 数据模型与 shared-types

- [x] 1.1 `sys_dict_type`、`sys_dict_data` 实体 + migration/sync — 验证：TypeORM 可建表
- [x] 1.2 shared-types 字典 DTO/列表项 — 验证：编译通过

## 2. Server 字典 API

- [x] 2.1 DictModule：类型 CRUD + 权限装饰器 — 验证：e2e 类型增删改查
- [x] 2.2 字典项 CRUD + by-type 查询 — 验证：e2e 项 CRUD 与 by-type 返回启用项
- [x] 2.3 删除类型约束、Member 403 — 验证：e2e 边界（seed 留 Task 3）

## 3. Admin 字典管理 UI

- [x] 3.1 API 层 + `useDict` composable — 验证：类型编译
- [x] 3.2 字典管理页（类型 + 项主从） — 验证：dev smoke CRUD
- [x] 3.3 权限按钮与动态菜单 — 验证：无权限隐藏按钮、菜单可见

## 4. 集成验证

- [x] 4.1 server test + e2e、admin build — 验证：全绿
- [x] 4.2 openspec validate system-dict --strict — 验证：通过
