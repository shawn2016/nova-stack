# Comet Design Handoff

- Change: verify-loop-mvp
- Phase: design
- Mode: compact
- Context hash: 1dd8b4fbe9d4dc86c76c8fd40b4283c71b6b263f66784d34a353409ba048615f

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/verify-loop-mvp/proposal.md

- Source: openspec/changes/verify-loop-mvp/proposal.md
- Lines: 1-30
- SHA256: 92fc89b9b07c0efb3cf9678207e57aba92e1f65d74397dcc9a807597e724b513

```md
## 背景与动机

nova-stack 已有 Server API e2e（Jest + supertest），但缺少**面向用户界面**的自动化验证和**可视化报告中心**。每次功能合并后，无法快速确认现有功能是否仍正常，也缺少供 AI 辅助修复的结构化失败上下文。需要一条命令启动验证、独立 Hub 收集报告，形成可复测、可统计的最小闭环。

## 变更内容

- 新增独立 **Verify Hub** 服务（`tools/verify-hub/`，独立进程/端口，不嵌入 Admin/Server）
- 新增项目侧 **Verify Runner** 配置与编排（`.verify/config.yaml` + `scripts/verify.mjs`）
- 新增统一报告协议 **verify-report.v1**（JSON），Runner 执行后上传 Hub
- 根目录新增 **`pnpm verify`**：执行 Tier-1 验证并上报 Hub
- Hub Web UI：运行列表、失败详情、**一键复制 AI 修复上下文**、复测命令、基础统计
- MVP 范围：static + server test:e2e + 一条浏览器 smoke（登录进入后台），验证闭环可用

## 能力范围

### 新增能力

- `verify-hub`：独立验证报告接入、Dashboard、AI 上下文导出、统计
- `verify-runner`：项目侧编排（配置、分层命令、报告生成与上报、根级 `pnpm verify`）

### 修改能力

- `monorepo-workspace`：根级脚本新增 `verify` 与 Verify Hub 启动说明

## 影响范围

- **新增**：`tools/verify-hub/`、`e2e/`（MVP smoke）、`.verify/`、`scripts/verify.mjs`
- **修改**：根 `package.json` scripts；`docs/standards/`（后续补充 verify 规范）
- **不变**：Admin/Server 运行时、生产部署路径
- **依赖**：Node 20+、Playwright（MVP smoke）、可选 MySQL（浏览器测试需 seed 后的开发环境）

```

## openspec/changes/verify-loop-mvp/design.md

- Source: openspec/changes/verify-loop-mvp/design.md
- Lines: 1-95
- SHA256: a0d3376878edf8e04968758eb1ba2d0f5ccf21ba8456a6426660083d3b25ea9a

[TRUNCATED]

```md
## 上下文

见 `proposal.md`。当前测试资产：shared-types 单元测试、server 单元 + API e2e（约 156 条），Admin 无自动化。用户期望：**Runner 在项目内、Hub 在系统外**，通过配置 + 标准用例接入。

## 目标 / 非目标

**目标：**

- 一条命令 `pnpm verify` 完成 Tier-1 并在 Hub 查看结果
- Hub 独立运行（本地 `pnpm verify:hub`），默认 `http://localhost:9470`
- 失败 case 支持一键 **AI 修复包**（错误、相关文件、复测命令、AGENTS.md 引用）
- 报告含 git 上下文、分层摘要、用例级 artifact
- MVP 演示：成功 run → 故意失败 → 复制 → 复测 → 统计更新

**非目标（MVP 不做）：**

- 全 18 模块浏览器覆盖、视觉回归、uni-app E2E
- Hub 远程触发 Runner（Webhook 调度）— 仅展示复测 CLI
- 多项目租户、OAuth、trace/视频对象存储
- GitHub Actions CI 集成（设计预留，MVP 不实现）

## 技术决策

### D1：Runner / Hub 分离（用户模型已确认）

```
┌─────────────────┐     verify-report.v1      ┌──────────────────┐
│  项目           │  ───────────────────────► │  Verify Hub      │
│  pnpm verify    │      POST /api/runs       │  :9470           │
│  .verify/config │                           │  SQLite + Web UI │
└─────────────────┘                           └──────────────────┘
```

**理由**：Hub 可服务多个项目；Runner 只跑本地命令并上报。比纯 Allure 报告更轻，且面向 AI 修复场景。

### D2：报告协议 verify-report.v1

JSON 字段：`runId`、`project`、`git`、`tiers[]`、`cases[]`、`summary`、`aiFixBundles[]`。

每个 case：`id`、`module`、`tags`、`status`、`durationMs`、`error`、`artifacts`、`retestCommand`。

Hub 接入对同 `runId` 幂等覆盖。

### D3：分层 Tier（MVP 仅 Tier-1）

| Tier | 命令 | MVP |
|------|------|-----|
| static | lint + shared-types test/build + admin build | 是 |
| api-e2e | `pnpm --filter @nova/server test:e2e` | 是 |
| browser-smoke | Playwright `@smoke`（登录 + 菜单） | 是（1 条） |

Tier-2/3 通过 config 扩展，Hub 协议无需变更。

### D4：Hub 技术栈

- **运行时**：Node + Fastify
- **存储**：SQLite（`tools/verify-hub/data/hub.db`）
- **UI**：Vue3 SPA（与 admin 技术栈一致）
- **AI 修复包**：Markdown 模板，含错误、stack、文件、`pnpm verify --tier …`、AGENTS.md 摘要

### D5：项目配置 `.verify/config.yaml`

声明项目名、hub url/token、tier 命令、module 标签映射。

### D6：一条命令入口

根脚本：`verify`、`verify:hub`、`verify:tier:*`。

`scripts/verify.mjs`：读配置 → 跑 tier → 解析输出 → 生成报告 → POST Hub → 有失败则 exit 1。

### D7：浏览器 smoke 环境

Playwright `webServer` 启动 server + admin preview；需 seed（文档说明）。

MVP 断言：登录 admin/admin123 → 侧边栏可见「系统管理」。

## 风险与权衡

| 风险 | 缓解 |
|------|------|

```

Full source: openspec/changes/verify-loop-mvp/design.md

## openspec/changes/verify-loop-mvp/tasks.md

- Source: openspec/changes/verify-loop-mvp/tasks.md
- Lines: 1-37
- SHA256: 35f2a7714a8de42862ecb3859ffd92458ca649ec36f77edcf135091924074fee

```md
# verify-loop-mvp 任务清单

## 1. Verify Hub 服务（`tools/verify-hub`）

- [ ] 1.1 初始化 `@nova/verify-hub` 包（Fastify + SQLite + 静态 UI）
- [ ] 1.2 实现 `POST /api/runs`、`GET /api/runs`、`GET /api/runs/:id`、`GET /api/stats`
- [ ] 1.3 Dashboard：运行列表、run 详情、失败 case、通过率趋势
- [ ] 1.4 「复制 AI 修复上下文」按钮（Markdown 模板）
- [ ] 1.5 根脚本 `pnpm verify:hub`，端口 9470

## 2. Verify Runner（项目侧）

- [ ] 2.1 新增 `.verify/config.yaml`（tiers + hub + modules）
- [ ] 2.2 实现 `scripts/verify.mjs`（读配置、跑 tier、生成 verify-report.v1、POST Hub）
- [ ] 2.3 tier 子命令：`verify:tier:static`、`verify:tier:api-e2e`、`verify:tier:browser-smoke`
- [ ] 2.4 根 `package.json` 添加 `pnpm verify` 与 `--tier` 过滤
- [ ] 2.5 定义 verify-report.v1 schema（`.verify/schema.json` 或 shared-types）

## 3. MVP 浏览器 Smoke

- [ ] 3.1 初始化 `e2e/` Playwright（admin baseURL、webServer）
- [ ] 3.2 `@smoke` 用例：登录 admin → 侧边栏「系统管理」可见
- [ ] 3.3 Playwright JSON reporter 适配到 verify-report cases

## 4. 闭环演示与文档

- [ ] 4.1 编写 `docs/standards/verify.md`（配置、写用例、AI 修复流程）
- [ ] 4.2 手动走通：启动 Hub → verify 成功 → 故意失败 → 复制 AI 包 → `--tier` 复测 → 统计更新
- [ ] 4.3 Comet Verify 附 run id 或截图

## 5. MVP 验收标准

- [ ] `pnpm verify:hub` 可打开 Dashboard
- [ ] `pnpm verify` 一条命令跑完 static + api-e2e + browser-smoke
- [ ] Hub 可见 run 详情与 tier 分解
- [ ] 失败 case 可一键复制 AI 上下文
- [ ] `pnpm verify --tier browser-smoke` 可单独复测

```

## openspec/changes/verify-loop-mvp/specs/monorepo-workspace/spec.md

- Source: openspec/changes/verify-loop-mvp/specs/monorepo-workspace/spec.md
- Lines: 1-20
- SHA256: 2c6dc7431d17cde1fb162930aa87adf4103c5bfa78b32edc3b3d44bf11e33ec7

```md
## MODIFIED Requirements

### Requirement: 根级开发脚本

系统 MUST 提供根级 `build`、`test` 聚合脚本；**`postinstall` MUST 构建 shared-types**；**`dev` MUST 并行启动 shared-types watch**（或等价 watch 方案）。**系统 MUST 提供 `verify` 脚本作为 Tier-1 自动化验证入口，以及 `verify:hub` 启动独立 Verify Hub 服务。**

#### Scenario: clone 后安装

- **WHEN** 新 clone 执行 `pnpm install`
- **THEN** shared-types dist 可用，IDE 类型不报错

#### Scenario: 本地基础设施

- **WHEN** 开发者需要本地联调
- **THEN** 可通过根 README 或 verify 文档了解 seed、端口与 `pnpm verify` / `pnpm verify:hub` 用法

#### Scenario: 一条命令验证

- **WHEN** 开发者在根目录执行 `pnpm verify`
- **THEN** Tier-1 验证执行且结果可上报 Verify Hub

```

## openspec/changes/verify-loop-mvp/specs/verify-hub/spec.md

- Source: openspec/changes/verify-loop-mvp/specs/verify-hub/spec.md
- Lines: 1-57
- SHA256: 99ff66c9786325bffb16f562ac5ae92d08117381bafb5aa07c5a013d77cb4446

```md
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

```

## openspec/changes/verify-loop-mvp/specs/verify-runner/spec.md

- Source: openspec/changes/verify-loop-mvp/specs/verify-runner/spec.md
- Lines: 1-53
- SHA256: 509d3baf24e0a9ad792b3e206d5e76501161eeb0dd6b5f4109a492521869a10d

```md
## Purpose

定义项目侧验证编排：配置文件、分层命令执行、verify-report.v1 生成与 Hub 上报，以及根级一条命令入口。

## ADDED Requirements

### Requirement: 项目配置文件

项目 MUST 在 `.verify/config.yaml` 声明 project 名、hub.url、hub.token、tiers 列表及 modules 标签映射。

#### Scenario: Runner 读取配置
- **WHEN** 执行 `pnpm verify`
- **THEN** Runner 从 `.verify/config.yaml` 加载 tier 命令与 Hub 地址

### Requirement: 分层验证执行

Runner MUST 按 config 中 tiers 顺序执行；任 tier 失败 MUST 继续后续 tier（收集完整报告）并最终 exit 1。

#### Scenario: Tier-1 全量执行
- **WHEN** 执行 `pnpm verify` 且 config 含 static、api-e2e、browser-smoke
- **THEN** 三层均被执行且报告含各 tier 的 pass/fail 与耗时

### Requirement: verify-report.v1 生成

Runner MUST 将各 tier 结果聚合为 verify-report.v1，含 git（branch、commit、dirty）、summary、cases[]。

#### Scenario: 报告含 git 上下文
- **WHEN** 验证在 git 仓库内执行
- **THEN** 报告包含当前 branch 与 commit sha

### Requirement: Hub 上报

Runner MUST 在验证结束后 POST 报告到 config 中 hub.url；上报失败 MUST 仍输出本地报告路径并 exit 非 0。

#### Scenario: Hub 在线时自动上报
- **WHEN** Hub 运行于 config.url 且 token 正确
- **THEN** Runner 控制台输出 run 链接（如 `http://localhost:9470/runs/<id>`）

### Requirement: 根级一条命令

monorepo 根 package.json MUST 提供 `pnpm verify` 作为 Tier-1 验证入口。

#### Scenario: 开发者快速验证
- **WHEN** 开发者在根目录执行 `pnpm verify`
- **THEN** 无需记忆多个 test 命令即可完成 Tier-1 并可在 Hub 查看结果

### Requirement: 复测命令支持

Runner MUST 支持 `pnpm verify --grep <case-id>` 或 `--tier <id>` 仅重跑子集（MVP 至少支持 `--tier`）。

#### Scenario: 修复后只重跑 browser-smoke
- **WHEN** 执行 `pnpm verify --tier browser-smoke`
- **THEN** 仅 browser-smoke tier 执行并生成新 run 上报 Hub

```
