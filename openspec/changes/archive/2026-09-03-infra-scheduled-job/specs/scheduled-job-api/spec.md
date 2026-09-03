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
