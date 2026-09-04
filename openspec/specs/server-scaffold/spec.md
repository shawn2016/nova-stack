# server-scaffold Specification

## Purpose
提供 NestJS 后端基础工程骨架，包含数据库/Redis 连接、Swagger 文档、JWT 与 RBAC 模块占位，供后续鉴权 change 扩展。

## Requirements

### Requirement: NestJS 应用可启动
系统 MUST 提供可独立启动的 NestJS 应用，默认监听可配置端口，启动后无致命错误；**REST API MUST 使用全局前缀 `/api`**（`setGlobalPrefix('api')`）；CORS allowed origins MUST 从环境变量 `CORS_ORIGINS` 读取。

#### Scenario: 本地启动 server
- **WHEN** 开发者配置环境变量并启动 server 子包
- **THEN** NestJS 应用成功启动；业务接口位于 `/api/*`；Swagger 位于 `/api/docs`

#### Scenario: 跨域请求
- **WHEN** admin 从配置的 origin 请求 `/api/auth/login`
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
系统 MUST 提供完整的 AuthModule 与 RbacModule 实现；**全局 Guard MUST 在 AppModule 集中注册**，执行顺序明确；**不得保留无实现的 RolesGuard**；Admin 路由 MUST 通过 `@AdminOnly()` 或等价装饰器标识，不得依赖硬编码路径前缀列表。

#### Scenario: 模块注册
- **WHEN** 应用启动
- **THEN** Auth 与 RBAC 模块加载完整业务逻辑

#### Scenario: 真实登录
- **WHEN** 调用 `POST /auth/login` 提交有效凭据
- **THEN** 返回 200 及 Token，而非 501

#### Scenario: 新 Controller 默认可访问
- **WHEN** 新增 B 端 Controller 未标注 `@Public()` 或 member 路由
- **THEN** Admin JWT 可访问，无需修改 Guard 白名单文件

#### Scenario: Permission 缓存
- **WHEN** 同一 HTTP 请求内多次触发 PermissionGuard
- **THEN** 用户 permissions 不重复查库（request-scoped 缓存）

### Requirement: 全局参数校验
系统 MUST 启用 class-validator 全局校验管道，非法请求体 MUST 返回 400 及校验错误信息；**MUST 启用 `forbidNonWhitelisted: true`**，未知字段 MUST 导致 400。

#### Scenario: 非法 DTO 提交
- **WHEN** 客户端提交不符合 DTO 约束的请求体
- **THEN** 系统返回 400 及字段级错误描述

#### Scenario: 未知字段拒绝
- **WHEN** 客户端提交 DTO 未声明的额外字段
- **THEN** 系统返回 400，不静默剥离
