# Verify Loop

自动化验证闭环：项目内 Runner + 独立 Verify Hub。

## 快速开始

```bash
# 终端 1：启动 Hub（独立服务，默认 :9470）
pnpm verify:hub

# 终端 2：跑 Tier-1 验证（需 Hub 在线以便上报）
pnpm verify

# 浏览器打开 Dashboard
open http://localhost:9470
```

若本地未启动 Admin/Server，可跳过浏览器层：

```bash
VERIFY_SKIP_BROWSER=1 pnpm verify
```

## Tier 说明

| Tier | 命令 | 说明 |
|------|------|------|
| static | shared-types test/build | 类型与共享包构建 |
| api-e2e | server test:e2e | API 全量回归 |
| browser-smoke | Playwright `@smoke` | 登录进后台（需 `pnpm dev` + seed；含滑块验证） |

## 复测

```bash
pnpm verify --tier api-e2e
pnpm verify --tier browser-smoke
```

## 配置

- `.verify/config.yaml` — tier 命令、Hub 地址、module 标签
- `.verify/inventory.yaml` — 业务模块清单（用于覆盖率统计）
- `.verify/schema.json` — verify-report.v1 结构
- 本地报告备份：`.verify/reports/<runId>.json`

Hub 报告中的 **覆盖概览** 包含：
- **业务模块**：已测 / 总共（来自 inventory）
- **API 用例**：Jest e2e 执行的测试条数
- **接口目录**：从 `server/test` 扫描的唯一 HTTP 路由数
- **累计缺口**：inventory 定义的期望 vs 本次/磁盘实际（ReportPortal 式对账）
- **历史累计矩阵**：近 N 次 run 聚合各模块「曾通过/曾失败/磁盘资产」
- **用例明细**：按 tier 分组；失败项支持查看弹窗、复制 AI 上下文、一键复测

### 缺口含义（`.verify/inventory.yaml` 驱动）

| 字段 | 含义 |
|------|------|
| `modulesMissingBrowserSpec` | 清单期望 browser，但 `e2e/specs` 无 `@module:xxx`（**待编写**） |
| `modulesMissingLayersThisRun` | 磁盘已有套件/spec，但**本 run** 跳过了 api-e2e 或 browser-smoke |
| `adminPages.untested` | Admin 页面总数减去已有 browser spec 的模块页面数 |
| `apiSuitesOnDisk` / `browserModulesOnDisk` | 当前仓库实际存在的测试资产 |

**累计策略**：每跑一轮 `pnpm verify` 报告入库；Hub 聚合历史 run 展示「越测越全」。补缺口时在 inventory 对应模块加 `adminPages` + 写 `e2e/specs/@module:xxx` spec。

### Hub 操作

- **折叠面板**：模块覆盖、API 目录、用例明细均可收起
- **删除报告**：单条删除 / 保留最近 10 条 / 清空全部
- **复测**：Hub 内按钮触发 `POST /api/retest`（默认后台 spawn；`VERIFY_HUB_ALLOW_RETEST=0` 时仅复制命令）
- **失败用例**：列表右侧「查看 / 复制 / 复测」；详情顶栏「复测失败 tier / 全部 / 复制全部失败上下文」

## 写用例

- **API**：继续写在 `server/test/**/*.e2e-spec.ts`（规范见 `server.md`）
- **浏览器**：写在 `e2e/specs/`，用 `@smoke`、`@module:xxx` 标签

## AI 修复流程

1. Hub Dashboard 打开失败 run
2. 点击「复制 AI 修复上下文」
3. 粘贴给 AI，按 `AGENTS.md` 修复
4. 执行 run 详情中的复测命令

## Hub 环境变量

| 变量 | 默认 |
|------|------|
| VERIFY_HUB_PORT | 9470 |
| VERIFY_HUB_TOKEN | dev-local-token |
| VERIFY_HUB_ALLOW_RETEST | 1（设为 0 则 Hub 只复制复测命令） |
| VERIFY_PROJECT_ROOT | 项目根目录（spawn verify 用） |
