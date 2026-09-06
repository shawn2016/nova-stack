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
