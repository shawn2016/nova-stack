## Why

Infra 层缺少**定时任务调度**与**执行日志**能力。Admin 无法配置 cron 任务、暂停/恢复调度，也无法审计任务执行结果。这是 System/Infra 扩展批次**第 6 项**，采用与 `system-region` 相同的 Comet 全流程交付。

## What Changes

- **Server — 任务定义 CRUD**：`sys_job` 实体；cron 表达式；invokeTarget（白名单 Handler）；状态启停
- **Server — 调度引擎**：启动加载启用任务；动态注册/注销 cron；立即执行一次
- **Server — 执行日志**：`sys_job_log` 记录每次执行结果、耗时、异常
- **shared-types**：Job / JobLog DTO 与列表项
- **Admin — 定时任务页**：任务 CRUD + 启停 + 立即执行 + 日志查看
- **RBAC 扩展**：job 权限码与菜单 seed

## Capabilities

### New Capabilities

- `scheduled-job-api`: 定时任务 CRUD、启停、立即执行、日志查询
- `scheduled-job-admin-ui`: Admin 定时任务管理页

### Modified Capabilities

- （无）

## Impact

- **主要影响**：`server/src/modules/job/`（新建）、`server/src/database/entities/`、`server/src/database/seeds/`、`admin/src/views/infra/job/`、`packages/shared-types/`
- **依赖**：新增 `cron` 包用于动态调度
- **不影响**：分布式调度（Quartz 集群）、任意脚本执行（invokeTarget 仅白名单 Handler）

## Non-Goals

- 分布式任务锁 / 多节点协调
- 任意 Groovy/Shell 脚本 invokeTarget
- 任务依赖链、DAG 编排
- 短信/邮件发送任务（后续 infra-sms/email change 可注册 Handler）
