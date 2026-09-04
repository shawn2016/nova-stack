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
- **用例明细**：按 tier 分组展示每条测试

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
