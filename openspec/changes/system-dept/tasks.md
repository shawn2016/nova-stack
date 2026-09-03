## 1. 数据模型与 shared-types

- [x] 1.1 `sys_dept` 实体 + `sys_user.dept_id` + 注册 — 验证：建表成功
- [x] 1.2 shared-types `dept.ts` + 用户 DTO 扩展 — 验证：编译 + test

## 2. Server 部门 API

- [x] 2.1 DeptModule：tree/tree-all/CRUD/status/settings — 验证：e2e
- [x] 2.2 删除约束（子部门/关联用户）与模块总开关 — 验证：e2e 边界

## 3. Server 用户部门扩展

- [x] 3.1 User create/update/list/detail 支持 deptId/deptName — 验证：e2e

## 4. Seed 与 RBAC

- [x] 4.1 permissions + 菜单 + 示例部门 + settings + admin 归属 — 验证：seed.spec

## 5. Admin UI

- [x] 5.1 `admin/src/api/dept.ts` — 验证：类型编译
- [x] 5.2 部门管理页（树 + 状态开关 + 功能开关） — 验证：dev smoke
- [x] 5.3 用户管理部门字段 — 验证：选择与展示

## 6. 集成验证

- [x] 6.1 server test + e2e、admin build — 验证：全绿
- [x] 6.2 openspec validate system-dept --strict — 验证：通过
