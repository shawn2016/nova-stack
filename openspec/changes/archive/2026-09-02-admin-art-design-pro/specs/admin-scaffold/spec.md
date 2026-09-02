## MODIFIED Requirements

### Requirement: Admin 应用可启动
系统 MUST 提供可独立启动的 Vue3 + Vite 管理端应用，基于 art-design-pro 模板（Element Plus + Tailwind CSS），默认开发服务器可访问。

#### Scenario: 本地启动 admin
- **WHEN** 开发者启动 admin 子包开发服务器
- **THEN** 浏览器可访问登录/首页布局页面

### Requirement: 路由与布局骨架
系统 MUST 提供基础路由配置（含登录页、主布局、404）及 art-design-pro 布局组件；未登录 MUST 重定向 login，登录后 MUST 支持动态路由注册。

#### Scenario: 路由导航
- **WHEN** 用户访问根路径
- **THEN** 系统展示主布局或重定向至登录页

#### Scenario: 路由守卫
- **WHEN** 未登录访问受保护路由
- **THEN** 重定向至 /login
