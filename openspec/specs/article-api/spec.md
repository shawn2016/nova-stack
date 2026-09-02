# article-api Specification

## Purpose
TBD - created by archiving change demo-business-module. Update Purpose after archive.

## Requirements

### Requirement: B 端文章 CRUD
系统 MUST 提供 Admin 文章管理 API：`GET/POST /articles`、`GET/PUT/DELETE /articles/:id`、`PATCH /articles/:id/publish`，需 Admin Token 与对应 RBAC 权限。

#### Scenario: 创建文章
- **WHEN** Admin 提交 title、content 等字段
- **THEN** 返回 201 及文章 id，默认 status=草稿

#### Scenario: 无权限创建
- **WHEN** Admin 无 content:article:create 权限
- **THEN** 返回 403

### Requirement: C 端文章只读
系统 MUST 提供 `GET /member/articles` 与 `GET /member/articles/:id`，仅返回 status=已发布 的文章，需 Member Token。

#### Scenario: Member 浏览列表
- **WHEN** Member 已登录请求列表
- **THEN** 返回已发布文章分页列表，不含草稿

#### Scenario: 草稿不可见
- **WHEN** Member 请求草稿 id 详情
- **THEN** 返回 404
