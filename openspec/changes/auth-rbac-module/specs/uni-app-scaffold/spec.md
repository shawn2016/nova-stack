## MODIFIED Requirements

### Requirement: Pinia 与请求封装
系统 MUST 集成 Pinia user store（token/userInfo），并在 request 封装中注入 Bearer Token、处理 401 跳转登录；保留统一 baseURL 配置。

#### Scenario: 跨端请求
- **WHEN** 页面通过封装 request 发起 API 调用
- **THEN** 请求携带统一 baseURL 配置

#### Scenario: 带 Token 请求
- **WHEN** 已登录用户发起 API 请求
- **THEN** 请求头携带 Authorization Bearer Token
