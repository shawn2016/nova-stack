## MODIFIED Requirements

### Requirement: 共享 types 包
系统 MUST 提供 `packages/shared-types` workspace 包，导出 API 通用类型、鉴权/RBAC 类型及 Article、ArticleListItem、CreateArticleDto、UpdateArticleDto 等业务类型；**所有实体主键 id 在 JSON/API 层 MUST 使用 string 类型**（对应 DB bigint）。

#### Scenario: 子包引用共享类型
- **WHEN** admin 或 server 子包 import 共享 types
- **THEN** TypeScript 编译通过且类型定义一致

#### Scenario: 三端类型对齐
- **WHEN** server 返回 Article 列表或 LoginResponse
- **THEN** admin 与 uni-app 可使用相同类型解析

#### Scenario: ID 类型统一
- **WHEN** server 返回 RBAC 用户/角色/菜单或 Article 的 id 字段
- **THEN** JSON 中 id 为 string，shared-types 定义与之一致

### Requirement: API 响应类型约定
共享 types MUST 定义统一 API 响应结构（code、message、data），三端 MUST 引用该结构；成功码 MUST 为 `ErrorCode.SUCCESS`（0）。

#### Scenario: 响应类型对齐
- **WHEN** server 返回标准响应结构
- **THEN** admin 与 uni-app 可使用相同类型解析响应

#### Scenario: 开发 watch
- **WHEN** 开发者修改 shared-types 源码
- **THEN** `pnpm --filter @nova/shared-types dev` 可 watch 编译，根 `pnpm dev` MUST 并行启动 watch
