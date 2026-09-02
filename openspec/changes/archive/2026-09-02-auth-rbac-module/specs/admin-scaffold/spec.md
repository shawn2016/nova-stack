## MODIFIED Requirements

### Requirement: Axios 请求封装
系统 MUST 提供 Axios 实例封装，自动注入 JWT Token；401 时尝试 refresh，403 时提示无权限；并保留 baseURL 与通用 headers 配置。

#### Scenario: API 请求配置
- **WHEN** 组件通过封装后的 request 发起 HTTP 请求
- **THEN** 请求自动携带配置的 baseURL 与通用 headers

#### Scenario: Token 注入
- **WHEN** 用户已登录且 store 中有 accessToken
- **THEN** 每个请求自动携带 Authorization header

### Requirement: 路由与布局骨架
系统 MUST 提供基础路由配置（含登录页、主布局、404）及 Arco Design 布局组件；未登录 MUST 重定向 login，登录后 MUST 支持动态路由注册。

#### Scenario: 路由导航
- **WHEN** 用户访问根路径
- **THEN** 系统展示主布局或重定向至登录页

#### Scenario: 路由守卫
- **WHEN** 未登录访问受保护路由
- **THEN** 重定向至 /login
