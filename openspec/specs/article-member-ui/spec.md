# article-member-ui Specification

## Purpose
TBD - created by archiving change demo-business-module. Update Purpose after archive.

## Requirements

### Requirement: C 端文章列表
Uni-app MUST 提供文章列表页，调用 `/member/articles`，需 Member 登录。

#### Scenario: 列表展示
- **WHEN** Member 登录后进入文章列表
- **THEN** 展示已发布文章标题与摘要

### Requirement: C 端文章详情
Uni-app MUST 提供文章详情页，调用 `/member/articles/:id`。

#### Scenario: 详情展示
- **WHEN** 点击列表项
- **THEN** 展示标题、正文、封面

### Requirement: 不接入 B 端管理 API
Uni-app MUST NOT 调用 `/articles` Admin 管理 API。

#### Scenario: API 隔离
- **WHEN** 检查 uni-app 源码
- **THEN** 无 `/articles`（非 `/member/articles`）管理端点调用
