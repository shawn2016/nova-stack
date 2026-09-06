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
