## ADDED Requirements

### Requirement: 文章列表页
Admin MUST 提供文章管理列表页，展示标题、状态、发布时间，支持分页。

#### Scenario: 列表加载
- **WHEN** Admin 登录并访问文章管理
- **THEN** 调用 GET /articles 展示数据

### Requirement: 文章表单
Admin MUST 提供创建/编辑表单，支持保存草稿与发布。

#### Scenario: 发布按钮权限
- **WHEN** 用户无 content:article:publish 权限
- **THEN** 发布按钮不可见或禁用（v-permission）
