## Why

`auth-rbac-module` 已完成双轨鉴权，但尚无真实业务 API 与三端页面验证端到端联调。需要首个**示例业务模块**证明 Admin RBAC 管理、Member C 端消费、Server REST API 与 shared-types 类型对齐均可正常工作。

## What Changes

- **Server**：`article` 公告/文章实体与 CRUD API；B 端 Admin 全量 CRUD + RBAC 权限；C 端 Member 只读列表/详情（已发布内容）
- **Admin**：文章管理列表、创建/编辑表单、删除；对接 RBAC 按钮权限；动态菜单 seed 扩展
- **Uni-app**：C 端文章列表与详情页（Member Token 注入 request）
- **shared-types**：Article DTO、分页列表类型
- **Seed**：文章管理菜单 + 权限码 + 可选示例数据

## Capabilities

### New Capabilities

- `article-data-model`: 文章表结构与 TypeORM 实体
- `article-api`: B 端管理 API + C 端只读 API
- `article-admin-ui`: Admin 文章 CRUD 页面与权限按钮
- `article-member-ui`: Uni-app C 端文章列表/详情

### Modified Capabilities

- `shared-types`: 新增 Article 相关共享类型
- `rbac-data-model`: seed 扩展文章管理菜单与权限

## Impact

- **新增数据表**: `article`
- **新增 API**: `/articles`（Admin CRUD）、`/member/articles`（C 端只读）
- **依赖**: `auth-rbac-module` 已归档合并的主 spec（双轨鉴权、RBAC Guard）
- **非目标**: 富文本编辑器深度定制、评论、审核工作流、图片上传服务
