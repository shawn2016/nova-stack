# server-scaffold Specification

## Purpose
提供 NestJS 后端基础工程骨架，包含数据库/Redis 连接、Swagger 文档、JWT 与 RBAC 模块占位，供后续鉴权 change 扩展。

## Requirements

### Requirement: NestJS 应用可启动
系统 MUST 提供可独立启动的 NestJS 应用，默认监听可配置端口，启动后无致命错误；并 MUST 启用 CORS，允许 admin 与 uni-app dev origin 跨域访问。

#### Scenario: 本地启动 server
- **WHEN** 开发者配置环境变量并启动 server 子包
- **THEN** NestJS 应用成功启动并响应健康检查或根路由

#### Scenario: 跨域请求
- **WHEN** admin 从 localhost:5173 请求 API
- **THEN** 浏览器不阻止跨域响应

### Requirement: 数据库与 Redis 连接骨架
系统 MUST 集成 TypeORM（MySQL8）与 Redis 连接配置，通过环境变量注入连接参数；连接失败时 MUST 输出明确错误。

#### Scenario: 数据库连接配置
- **WHEN** 提供有效的 MySQL 与 Redis 环境变量
- **THEN** 应用启动时成功建立数据库与 Redis 连接

### Requirement: Swagger 自动文档
系统 MUST 暴露 Swagger UI 端点，可浏览已注册的控制器与 DTO 文档。

#### Scenario: 访问 API 文档
- **WHEN** 开发者访问 Swagger UI 路径
- **THEN** 可看到 API 分组与接口列表（含占位接口）

### Requirement: JWT 与 RBAC 模块占位
系统 MUST 提供完整的 AuthModule 与 RbacModule 实现（非占位），含真实登录/登出/刷新、PermissionGuard 及 Redis 黑名单；占位 501 响应 MUST 被移除。

#### Scenario: 模块注册
- **WHEN** 应用启动
- **THEN** Auth 与 RBAC 模块加载完整业务逻辑

#### Scenario: 真实登录
- **WHEN** 调用 `POST /auth/login` 提交有效凭据
- **THEN** 返回 200 及 Token，而非 501

### Requirement: 全局参数校验
系统 MUST 启用 class-validator 全局校验管道，非法请求体 MUST 返回 400 及校验错误信息。

#### Scenario: 非法 DTO 提交
- **WHEN** 客户端提交不符合 DTO 约束的请求体
- **THEN** 系统返回 400 及字段级错误描述
