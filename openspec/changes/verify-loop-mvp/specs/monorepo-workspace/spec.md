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
