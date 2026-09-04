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
| 浏览器测试依赖 MySQL/seed | 文档明确前置；CI 阶段用 docker-compose |
| SQLite 单写者 | MVP 本地单用户；后续换 Postgres |
| 各框架输出格式不一 | Jest + Playwright JSON 适配层 |
| smoke 过薄漏 UI 回归 | 同次 Tier-1 含全量 API e2e 兜底 |

## 迁移计划

1. 合并 hub + runner（无破坏性）
2. 开发流程：`pnpm verify:hub` → `pnpm verify` → 打开 Dashboard
3. 回滚：删除新目录与 scripts；现有 `pnpm test` 不受影响

## 待决问题

- 多项目复用时 Hub 是否拆独立仓库 — MVP 暂放 `tools/`
- 浏览器环境不稳定时 smoke 是否改用 API 登录态 — Build 阶段再定
