## MODIFIED Requirements

### Requirement: Admin 应用可启动
系统 MUST 提供可独立启动的 Vue3 + Vite 管理端应用，基于 art-design-pro 模板（Element Plus + Tailwind CSS），默认开发服务器可访问；**生产构建 MUST 通过 `VITE_API_BASE_URL` 指向真实后端**，不得依赖 Apifox Mock。

#### Scenario: 本地启动 admin
- **WHEN** 开发者启动 admin 子包开发服务器
- **THEN** 浏览器可访问登录/首页布局页面

#### Scenario: 生产 API 地址
- **WHEN** 执行 `pnpm build` 并使用 production env
- **THEN** API 请求指向配置的 `VITE_API_BASE_URL`，非 mock URL

### Requirement: Axios 请求封装
系统 MUST 提供**单一** Axios 实例封装（`src/api/request.ts`），自动注入 JWT Token；401 时尝试 refresh，403 时提示无权限；**不得存在并行业务 HTTP 客户端**（`utils/http` 仅可 deprecated 或删除）。

#### Scenario: API 请求配置
- **WHEN** 组件通过 `request()` 发起 HTTP 请求
- **THEN** 请求自动携带配置的 baseURL 与 Authorization header

#### Scenario: Token 注入
- **WHEN** 用户已登录且 store 中有 accessToken
- **THEN** 每个请求自动携带 `Bearer` Token

#### Scenario: 成功码对齐
- **WHEN** server 返回 `code: 0`
- **THEN** request 层正确 unwrap `data`，不期望 `code: 200`

### Requirement: 开发代理
Admin 开发服务器 MUST 将 **`/api` 前缀**的请求代理至 `VITE_API_PROXY_URL`；后端 MUST 使用 `setGlobalPrefix('api')`；前端 `VITE_API_BASE_URL` MUST 为 `/api`（或含 `/api` 的完整地址）。

#### Scenario: 新模块 API 代理
- **WHEN** 后端新增任意 Controller 路由且 admin dev 运行中
- **THEN** 通过 `/api/...` 发起的请求正确转发至后端，无需修改 vite.config

#### Scenario: 非 API 路径不代理
- **WHEN** 浏览器请求 SPA 路由或静态资源（无 `/api` 前缀）
- **THEN** 由 Vite 本地处理，不转发至 NestJS
