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
