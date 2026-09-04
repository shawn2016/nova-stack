## Purpose

定义独立 Verify Hub 服务：接收项目验证报告、持久化运行记录、提供可视化 Dashboard、导出 AI 修复上下文与基础统计。

## ADDED Requirements

### Requirement: 报告接入 API

Hub MUST 提供 `POST /api/runs` 接收 `verify-report.v1` JSON；MUST 校验 `schema` 字段；同 `runId` 重复提交 MUST 覆盖原记录。

#### Scenario: 成功接入一次验证运行
- **WHEN** Runner POST 合法 verify-report.v1 到 Hub
- **THEN** Hub 返回 201 及 run 摘要（id、status、summary）

#### Scenario: 非法 schema 拒绝
- **WHEN** POST body 缺少 `schema` 或版本不匹配
- **THEN** Hub 返回 400 且不写入

### Requirement: 运行查询 API

Hub MUST 提供 `GET /api/runs`（分页列表）与 `GET /api/runs/:id`（含 tiers、cases、aiFixBundles）。

#### Scenario: Dashboard 加载最近运行
- **WHEN** 客户端 GET `/api/runs?limit=20`
- **THEN** 返回按 startedAt 降序的运行列表及 pass/fail 摘要

### Requirement: Web Dashboard

Hub MUST 提供 Web UI（默认 `/`）展示：运行时间线、各 tier 状态、失败用例列表、通过率趋势（最近 N 次）。

#### Scenario: 查看失败详情
- **WHEN** 用户在 Dashboard 点击 failed run
- **THEN** 展示失败 case 的错误信息、耗时、关联 module/tags

### Requirement: AI 修复上下文导出

Hub MUST 为每个失败 case 生成可复制的 Markdown「AI Fix Bundle」，包含：错误摘要、stack、建议相关文件、复测命令、`AGENTS.md` 规范引用占位。

#### Scenario: 一键复制修复上下文
- **WHEN** 用户点击某失败 case 的「复制 AI 上下文」
- **THEN** 剪贴板获得结构化 Markdown，可直接粘贴给 AI Agent

### Requirement: 基础统计

Hub MUST 提供 `GET /api/stats` 返回：总运行次数、最近 7 天通过率、平均耗时、按 module 失败 Top N。

#### Scenario: 统计随新 run 更新
- **WHEN** 新 run ingest 完成
- **THEN** stats 接口反映最新通过率

### Requirement: 独立进程部署

Hub MUST 作为独立 Node 进程运行，默认端口 9470；MUST NOT 嵌入 Admin 或 Server 进程。

#### Scenario: 本地启动 Hub
- **WHEN** 开发者执行 `pnpm verify:hub`
- **THEN** Hub 在 9470 监听且 Dashboard 可访问
