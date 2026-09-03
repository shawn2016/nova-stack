## 1. 数据模型与 shared-types

- [x] 1.1 sys_job + sys_job_log 实体 + 注册 — 验证：entities.spec
- [x] 1.2 shared-types Job/JobLog DTO — 验证：test

## 2. Server 调度与 API

- [x] 2.1 JobHandlerRegistry + JobSchedulerService — 验证：unit/e2e
- [x] 2.2 Job CRUD + status + run + logs API — 验证：e2e
- [x] 2.3 seed 权限/菜单/示例任务 — 验证：seed.spec

## 3. Admin UI

- [x] 3.1 定时任务管理页 — 验证：admin build

## 4. 集成验证

- [x] 4.1 全量 test/build + openspec validate — 验证：通过
