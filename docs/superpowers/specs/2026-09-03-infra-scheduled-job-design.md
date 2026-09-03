---
comet_change: infra-scheduled-job
role: technical-design
canonical_spec: openspec
status: draft
---

# infra-schedcheduled-job 深度技术设计

## 1. 架构

```
JobController ──► JobService ──► sys_job
              ──► JobLogService ──► sys_job_log
JobSchedulerService ──► cron.CronJob + JobHandlerRegistry
JobExecutor ──► 写 log + 调用 Handler
```

## 2. 实体

### sys_job
- name, jobGroup, invokeTarget, cronExpression
- status: 0 暂停 / 1 正常
- concurrent: 0 禁止并发 / 1 允许
- remark

### sys_job_log
- jobId, jobName, jobGroup, invokeTarget
- status: 0 失败 / 1 成功
- message, exceptionInfo
- startTime, endTime, durationMs

## 3. shared-types

JobListItem, JobDetail, CreateJobDto, UpdateJobDto, UpdateJobStatusDto, JobLogListItem

## 4. Handler 白名单

- `demo.heartbeat`：返回固定 message（测试/e2e 用）
- Registry 暴露 `listHandlers()` 供 Admin 下拉

## 5. JobSchedulerService

- `SKIP_JOB_SCHEDULER=true` 时跳过 onModuleInit 自动注册
- `schedule(job)` / `unschedule(jobId)` / `runOnce(jobId)`
- concurrent=0：`runningLocks: Set<string>` 跳过重叠执行

## 6. API

见 OpenSpec delta；run 需 `infra:job:run`

## 7. Admin

- `/infra/job` 任务表格 + 编辑弹窗 + 日志侧栏
- invokeTarget 下拉来自 GET `/jobs/handlers`（可选）或前端写死与 seed 一致

## 8. Seed

- 示例任务：demo 心跳，cron `0 */6 * * *`，默认暂停 status=0（避免测试环境副作用）

## 9. 测试

- e2e: CRUD、非法 target 400、run 写 log、status 切换
- entities.spec 21 实体
