# monorepo-workspace Specification

## Purpose
定义 nova-stack 根级 pnpm monorepo 工作区，统一三端子包的依赖管理、代码规范与开发脚本入口。

## Requirements

### Requirement: pnpm workspace 根配置
系统 MUST 在仓库根目录提供 pnpm workspace 配置，将 `admin/`、`uni-app/`、`server/` 及 `packages/*` 纳入同一 monorepo。

#### Scenario: 根目录安装依赖
- **WHEN** 开发者在仓库根目录执行 `pnpm install`
- **THEN** 所有 workspace 子包的依赖被正确安装且可互相引用

### Requirement: 共享代码规范配置
系统 MUST 在根目录提供 eslint 与 prettier 配置，各子包 MUST 继承或引用根配置；**server 与 shared-types MUST 可执行 lint**。**人类与 Agent 写码规范 MUST 以 `docs/standards/README.md` 为索引，`docs/standards/ai-checklist.md` 为完成前自检清单。**

#### Scenario: 根级 lint 命令
- **WHEN** 开发者在根目录执行 lint 脚本
- **THEN** server 与 shared-types 代码规范检查可执行

#### Scenario: Agent 写码前查规范
- **WHEN** Agent 在本仓库新增或修改业务代码
- **THEN** 应遵循 `docs/standards/` 中对应专题与 ai-checklist 自检项

### Requirement: 根级开发文档
系统 MUST 提供 README，说明 monorepo 结构、前置依赖（Node、pnpm、MySQL、Redis）及本地启动步骤。

#### Scenario: 新开发者 onboarding
- **WHEN** 新开发者阅读根 README
- **THEN** 可了解三端目录分工、技术栈与启动顺序
