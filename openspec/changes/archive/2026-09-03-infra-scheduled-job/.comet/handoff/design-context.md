# Comet Design Handoff

- Change: infra-scheduled-job
- Phase: design
- Mode: compact
- Context hash: 079b1d620413ea0fa8bd4a67984ed533df3bfc464a613b2e91f6779ce1dc0f4e

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/infra-scheduled-job/proposal.md

- Source: openspec/changes/infra-scheduled-job/proposal.md
- Lines: 1-36
- SHA256: 8522195c33901f7be993e9de7f03a632d8f85d06cbc6f219ccccef80941251fc

```md
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

```

## openspec/changes/infra-scheduled-job/design.md

- Source: openspec/changes/infra-scheduled-job/design.md
- Lines: 1-60
- SHA256: 793524fcd9e3a36372a2cb13830eace0f82e26bbf714229a69d509885e1a20f0

```md
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

```

## openspec/changes/infra-scheduled-job/tasks.md

- Source: openspec/changes/infra-scheduled-job/tasks.md
- Lines: 1-18
- SHA256: dba98c2e85fdaa5c7386c6450e70850f6377fe8cd90b68127a6306f66c8e6e83

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 sys_job + sys_job_log 实体 + 注册 — 验证：entities.spec
- [ ] 1.2 shared-types Job/JobLog DTO — 验证：test

## 2. Server 调度与 API

- [ ] 2.1 JobHandlerRegistry + JobSchedulerService — 验证：unit/e2e
- [ ] 2.2 Job CRUD + status + run + logs API — 验证：e2e
- [ ] 2.3 seed 权限/菜单/示例任务 — 验证：seed.spec

## 3. Admin UI

- [ ] 3.1 定时任务管理页 — 验证：admin build

## 4. 集成验证

- [ ] 4.1 全量 test/build + openspec validate — 验证：通过

```

## openspec/changes/infra-scheduled-job/specs/scheduled-job-admin-ui/spec.md

- Source: openspec/changes/infra-scheduled-job/specs/scheduled-job-admin-ui/spec.md
- Lines: 1-16
- SHA256: 65a8ed7f371b0b654e6c5fbdc1320600091c1e5bc1693d5d4d5692c50c32fa92

```md
## ADDED Requirements

### Requirement: 定时任务管理页
Admin MUST 提供定时任务 CRUD、启停、立即执行与日志查看。

#### Scenario: 任务列表
- **WHEN** 有 `infra:job:list` 的用户打开 `/infra/job`
- **THEN** 展示任务名称、cron、状态、invokeTarget

#### Scenario: 立即执行
- **WHEN** 用户点击「执行一次」
- **THEN** 调用 run API 并提示结果

#### Scenario: 查看日志
- **WHEN** 用户打开任务日志
- **THEN** 展示执行时间、状态、耗时、消息

```

## openspec/changes/infra-scheduled-job/specs/scheduled-job-api/spec.md

- Source: openspec/changes/infra-scheduled-job/specs/scheduled-job-api/spec.md
- Lines: 1-30
- SHA256: 72fd4ba7e2f28fb2b75621b517b515486a195bcab1122b3af40b69a21f768777

```md
## ADDED Requirements

### Requirement: 定时任务 CRUD
系统 MUST 持久化 sys_job，支持 create/update/delete/list；cron 表达式合法；invokeTarget 必须在 Handler 白名单内。

#### Scenario: 创建启用任务
- **WHEN** POST `/jobs` 含合法 cron 与白名单 invokeTarget
- **THEN** 返回 201，status 默认或指定值

#### Scenario: 非法 invokeTarget
- **WHEN** POST `/jobs` invokeTarget 不在白名单
- **THEN** 返回 400

### Requirement: 任务启停与立即执行
系统 MUST 支持 PUT status 启停；POST run 立即执行一次并写日志。

#### Scenario: 暂停任务
- **WHEN** PUT `/jobs/:id/status` status=0
- **THEN** 调度器注销该 cron

#### Scenario: 立即执行
- **WHEN** POST `/jobs/:id/run`
- **THEN** 返回成功且 sys_job_log 新增一条记录

### Requirement: 执行日志
GET `/jobs/logs` MUST 分页返回执行历史，含 status、durationMs、message。

#### Scenario: 查询日志
- **WHEN** 有权限用户 GET `/jobs/logs?jobId=`
- **THEN** 返回按时间倒序的 log list

```
