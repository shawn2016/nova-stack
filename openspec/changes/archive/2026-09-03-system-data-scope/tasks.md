## 1. 数据模型与 shared-types

- [x] 1.1 sys_role.data_scope + sys_role_dept + 注册 — 验证：建表
- [x] 1.2 shared-types DataScope 枚举 + Role DTO 扩展 — 验证：test

## 2. Server 数据范围

- [x] 2.1 DataScopeModule + resolveDeptIds + 模块开关 — 验证：unit/e2e
- [x] 2.2 Role CRUD 支持 dataScope/customDeptIds — 验证：e2e
- [x] 2.3 User list 按数据范围过滤 — 验证：e2e

## 3. Seed

- [x] 3.1 super_admin ALL + data_scope settings — 验证：seed.spec

## 4. Admin UI

- [x] 4.1 角色编辑 dataScope + 自定义部门 — 验证：build

## 5. 集成验证

- [x] 5.1 全量 test/build + openspec validate — 验证：通过
