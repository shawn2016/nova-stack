# uni-app-scaffold Specification

## Purpose
提供 uni-app 多端（微信小程序 + H5）基础工程，集成 uview-plus 与 Pinia，供后续业务页面扩展。

## Requirements

### Requirement: Uni-app 应用可编译
系统 MUST 提供可编译至微信小程序与 H5 的 uni-app 工程，开发模式可本地预览。

#### Scenario: H5 开发预览
- **WHEN** 开发者启动 uni-app H5 开发模式
- **THEN** 浏览器可访问首页

#### Scenario: 微信小程序编译
- **WHEN** 开发者执行微信小程序构建命令
- **THEN** 生成可导入微信开发者工具的产物

### Requirement: uview-plus 组件库集成
系统 MUST 集成 uview-plus 并完成全局注册，首页 MUST 展示至少一个 uview 组件以验证集成。

#### Scenario: 组件库可用
- **WHEN** 页面使用 uview-plus 组件
- **THEN** 组件正常渲染无报错

### Requirement: Pinia 与请求封装
系统 MUST 集成 Pinia user store（token/userInfo），并在 request 封装中注入 Bearer Token、处理 401 跳转登录；保留统一 baseURL 配置。

#### Scenario: 跨端请求
- **WHEN** 页面通过封装 request 发起 API 调用
- **THEN** 请求携带统一 baseURL 配置

#### Scenario: 带 Token 请求
- **WHEN** 已登录用户发起 API 请求
- **THEN** 请求头携带 Authorization Bearer Token
