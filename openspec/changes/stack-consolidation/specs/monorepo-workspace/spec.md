## MODIFIED Requirements

### Requirement: 共享代码规范配置
系统 MUST 在根目录提供 eslint 与 prettier 配置，各子包 MUST 继承或引用根配置；**server 与 shared-types MUST 可执行 lint**。

#### Scenario: 根级 lint 命令
- **WHEN** 开发者在根目录执行 lint 脚本
- **THEN** 所有子包代码规范检查可统一执行

### Requirement: 根级开发文档
系统 MUST 提供 README，说明 monorepo 结构、前置依赖（Node、pnpm、MySQL、Redis）、**`pnpm seed` 步骤**、**统一端口约定（默认 3001）** 及本地启动步骤；技术栈描述 MUST 与实际一致（Element Plus + Tailwind，非 Arco）。

#### Scenario: 新开发者 onboarding
- **WHEN** 新开发者阅读根 README 并复制 `.env.example`
- **THEN** 可了解三端目录分工、技术栈、seed 与启动顺序，端口与 proxy 一致

### Requirement: 根级开发脚本
系统 MUST 提供根级 `build`、`test` 聚合脚本；**`postinstall` MUST 构建 shared-types**；**`dev` MUST 并行启动 shared-types watch**（或等价 watch 方案）。

#### Scenario: clone 后安装
- **WHEN** 新 clone 执行 `pnpm install`
- **THEN** shared-types dist 可用，IDE 类型不报错

#### Scenario: 本地基础设施
- **WHEN** 开发者执行 `docker compose up -d`
- **THEN** MySQL 与 Redis 可用，与 `.env.example` 端口/凭证一致
