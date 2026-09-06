# verify-loop-mvp 任务清单

## 1. Verify Hub 服务（`tools/verify-hub`）

- [x] 1.1 初始化 `@nova/verify-hub` 包（Fastify + SQLite + 静态 UI）
- [x] 1.2 实现 `POST /api/runs`、`GET /api/runs`、`GET /api/runs/:id`、`GET /api/stats`
- [x] 1.3 Dashboard：运行列表、run 详情、失败 case、通过率趋势
- [x] 1.4 「复制 AI 修复上下文」按钮（Markdown 模板）
- [x] 1.5 根脚本 `pnpm verify:hub`，端口 9470

## 2. Verify Runner（项目侧）

- [x] 2.1 新增 `.verify/config.yaml`（tiers + hub + modules）
- [x] 2.2 实现 `scripts/verify.mjs`（读配置、跑 tier、生成 verify-report.v1、POST Hub）
- [x] 2.3 tier 子命令：`verify:tier:static`、`verify:tier:api-e2e`、`verify:tier:browser-smoke`
- [x] 2.4 根 `package.json` 添加 `pnpm verify` 与 `--tier` 过滤
- [x] 2.5 定义 verify-report.v1 schema（`.verify/schema.json`）

## 3. MVP 浏览器 Smoke

- [x] 3.1 初始化 `e2e/` Playwright（admin baseURL、webServer）
- [x] 3.2 `@smoke` 用例：登录 admin → 侧边栏「系统管理」可见
- [x] 3.3 Playwright JSON reporter 适配到 verify-report cases（含错误、定位与附件）

## 4. 闭环演示与文档

- [x] 4.1 编写 `docs/standards/verify.md`（配置、写用例、AI 修复流程）
- [x] 4.2 手动走通：Hub + verify（static + api-e2e）；browser 需 dev 环境
- [ ] 4.3 Comet Verify 附 run id 或截图

## 5. MVP 验收标准

- [x] `pnpm verify:hub` 可打开 Dashboard
- [x] `pnpm verify` 一条命令跑完 static + api-e2e + browser-smoke（browser 可 SKIP）
- [x] Hub 可见 run 详情与 tier 分解
- [x] 失败 case 可一键复制 AI 上下文（Hub UI 已实现）
- [x] `pnpm verify --tier api-e2e` 可单独复测
