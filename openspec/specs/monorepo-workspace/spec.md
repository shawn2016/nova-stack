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
系统 MUST 在根目录提供 eslint 与 prettier 配置，各子包 MUST 继承或引用根配置。

#### Scenario: 根级 lint 命令
- **WHEN** 开发者在根目录执行 lint 脚本
- **THEN** 所有子包代码规范检查可统一执行

### Requirement: 根级开发文档
系统 MUST 提供 README，说明 monorepo 结构、前置依赖（Node、pnpm、MySQL、Redis）及本地启动步骤。

#### Scenario: 新开发者 onboarding
- **WHEN** 新开发者阅读根 README
- **THEN** 可了解三端目录分工、技术栈与启动顺序
