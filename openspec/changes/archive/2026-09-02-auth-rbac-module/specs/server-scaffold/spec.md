## MODIFIED Requirements

### Requirement: JWT 与 RBAC 模块占位
系统 MUST 提供完整的 AuthModule 与 RbacModule 实现（非占位），含真实登录/登出/刷新、PermissionGuard 及 Redis 黑名单；占位 501 响应 MUST 被移除。

#### Scenario: 模块注册
- **WHEN** 应用启动
- **THEN** Auth 与 RBAC 模块加载完整业务逻辑

#### Scenario: 真实登录
- **WHEN** 调用 `POST /auth/login` 提交有效凭据
- **THEN** 返回 200 及 Token，而非 501

### Requirement: NestJS 应用可启动
系统 MUST 提供可独立启动的 NestJS 应用，默认监听可配置端口，启动后无致命错误；并 MUST 启用 CORS，允许 admin 与 uni-app dev origin 跨域访问。

#### Scenario: 本地启动 server
- **WHEN** 开发者配置环境变量并启动 server 子包
- **THEN** NestJS 应用成功启动并响应健康检查或根路由

#### Scenario: 跨域请求
- **WHEN** admin 从 localhost:5173 请求 API
- **THEN** 浏览器不阻止跨域响应
