# shared-types Specification

## Purpose
提供前后端共享的 TypeScript 类型定义，确保 API 契约在 admin、uni-app、server 三端对齐。

## Requirements

### Requirement: 共享 types 包
系统 MUST 提供 `packages/shared-types`（或等价目录）作为 workspace 包，导出 API 通用类型（如 ApiResponse、Pagination、ErrorCode 占位）。

#### Scenario: 子包引用共享类型
- **WHEN** admin 或 server 子包 import 共享 types
- **THEN** TypeScript 编译通过且类型定义一致

### Requirement: API 响应类型约定
共享 types MUST 定义统一 API 响应结构（code、message、data），三端 MUST 引用该结构。

#### Scenario: 响应类型对齐
- **WHEN** server 返回标准响应结构
- **THEN** admin 与 uni-app 可使用相同类型解析响应
