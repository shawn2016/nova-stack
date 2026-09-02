## Context

在 `auth-rbac-module` 双轨鉴权基础上，引入首个示例业务 **Article（公告/文章）**，验证三端 CRUD/只读联调。OpenSpec delta spec 为需求事实源。

## Goals / Non-Goals

**Goals:**
- B 端 Admin：文章完整 CRUD，RBAC 权限控制（list/create/update/delete/publish）
- C 端 Member：已发布文章列表 + 详情（需 Member 登录）
- 三端 shared-types 类型一致
- Seed 扩展菜单/权限，Admin 动态路由可见「内容管理 / 文章管理」

**Non-Goals:**
- 富文本 WYSIWYG（先用 textarea）
- 图片 OSS 上传（cover 字段存 URL 字符串）
- 评论、点赞、审核流
- C 端 RBAC 菜单

## 数据库设计

### `article` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| title | VARCHAR(200) | 标题 |
| summary | VARCHAR(500) | 摘要 |
| content | TEXT | 正文 |
| cover_url | VARCHAR(512) | 封面 URL（可选） |
| status | TINYINT | 0=草稿 1=已发布 |
| author_id | BIGINT | 创建者 sys_user.id |
| published_at | DATETIME | 发布时间（发布时写入） |
| created_at | DATETIME | |
| updated_at | DATETIME | |

## API 设计

### B 端 Admin（需 Admin Token + 权限）

| 方法 | 路径 | 权限码 | 说明 |
|------|------|--------|------|
| GET | /articles | content:article:list | 分页列表 |
| GET | /articles/:id | content:article:view | 详情 |
| POST | /articles | content:article:create | 创建 |
| PUT | /articles/:id | content:article:update | 更新 |
| DELETE | /articles/:id | content:article:delete | 删除 |
| PATCH | /articles/:id/publish | content:article:publish | 发布 |

### C 端 Member（需 Member Token）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /member/articles | 已发布文章分页列表 |
| GET | /member/articles/:id | 已发布文章详情 |

## Decisions

1. **权限前缀** `content:article:*`，挂到「内容管理」菜单下
2. **C 端只读**：Member 不能创建/编辑文章，仅消费已发布内容
3. **状态过滤**：C 端 API 硬过滤 `status=1`，不暴露草稿
4. **作者**：`author_id` 取当前 Admin 用户 id（创建时）

## Risks

- Admin 动态路由需 seed 新菜单 — 在 init.seed 或独立 article seed 中追加
- 与 auth PR 分支依赖 — 基于 `auth-rbac-module` 代码开发
