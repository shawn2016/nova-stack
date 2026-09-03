## Context

项目尚无 `@nestjs/schedule` 或 cron 调度。需可持久化、可运维的 RuoYi 风格任务管理，MVP 以**白名单 Handler** 保证安全。

## Goals / Non-Goals

**Goals:**
- DB 持久化任务定义 + 执行日志
- cron 动态注册/注销
- 手动触发 + 启停
- Admin 管理与日志查看

**Non-Goals:**
- 集群调度、脚本沙箱、MQ 延迟队列

## Decisions

### 1. 数据模型

**sys_job**：name, jobGroup, invokeTarget, cronExpression, status(0停/1启), concurrent(0禁止/1允许), remark

**sys_job_log**：jobId, jobName, invokeTarget, status(0失败/1成功), message, exceptionInfo, startTime, endTime, durationMs

### 2. Handler 白名单

- `JobHandlerRegistry` 注册 `demo.heartbeat` 等内置 Handler
- invokeTarget 必须是已注册 key，否则 CRUD 400
- 执行时写 log（成功/失败 + 耗时）

### 3. 调度器

- `JobSchedulerService` 使用 `cron` 包的 `CronJob`
- `onModuleInit` 加载 status=1 的任务注册；CRUD/启停时 refresh 单个任务
- e2e/测试环境：`SKIP_JOB_SCHEDULER=true` 跳过自动注册（手动 run 仍可测）

### 4. API

| Method | Path | Permission |
|--------|------|------------|
| GET | `/jobs` | infra:job:list |
| POST | `/jobs` | infra:job:create |
| PUT | `/jobs/:id` | infra:job:update |
| PUT | `/jobs/:id/status` | infra:job:update |
| POST | `/jobs/:id/run` | infra:job:run |
| DELETE | `/jobs/:id` | infra:job:delete |
| GET | `/jobs/logs` | infra:job:log:list |

### 5. Admin

- 路由 `/infra/job`（Infra 分组菜单）
- 任务列表 + 编辑对话框 + 日志抽屉/Tab

## Risks / Trade-offs

- 单进程 cron：重启后从 DB 重建，可接受 MVP
- concurrent=0 时用内存锁防重入

## Open Questions

- （无阻塞项）
