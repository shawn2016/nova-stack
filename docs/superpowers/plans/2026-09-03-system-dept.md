# system-dept 实施计划

base-ref: bafd356e
design: docs/superpowers/specs/2026-09-03-system-dept-design.md

## 任务顺序

- [ ] 1.1 sys_dept 实体 + sys_user.dept_id + shared-types dept.ts + test
- [ ] 2.1 DeptModule tree/CRUD/status/settings + e2e
- [ ] 3.1 User deptId 扩展 + e2e
- [ ] 4.1 seed permissions/menus/depts/settings + seed.spec
- [ ] 5.1 admin api + dept 管理页 + user 部门字段
- [ ] 6.1 全量 test/build + openspec validate

## 参考模块

- region（树形 CRUD + status）
- site-config（sys_config 读写）
- notice（seed 菜单 sort 顺延）
