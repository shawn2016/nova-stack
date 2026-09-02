---
comet_change: demo-business-module
role: technical-design
canonical_spec: openspec
---

# demo-business-module 深度技术设计

## 1. 架构总览

```
Admin (B端)                    Server                         Uni-app (C端)
  文章管理 UI  ──/articles──►  ArticleModule + RBAC Guard
  v-permission                  │
                                ├── article 表
                                └── MemberArticlesController
                                       ▲
  文章列表/详情 ──/member/articles─────┘
  Member Token
```

## 2. Server 模块结构

```
server/src/modules/
├── article/
│   ├── article.module.ts
│   ├── article.controller.ts      # B端 /articles
│   ├── article.service.ts
│   ├── member-article.controller.ts  # C端 /member/articles
│   ├── dto/
│   └── entities/article.entity.ts  # 或 database/entities/
```

**Guard 链（B 端）**：JwtAuthGuard → AdminAuthGuard → PermissionGuard（@RequirePermission）

**Guard 链（C 端）**：JwtAuthGuard → MemberAuthGuard

## 3. 数据库 Entity

`ArticleEntity` → `article`

| 属性 | 列 | 说明 |
|------|-----|------|
| id | BIGINT PK | string 类型 id |
| title | VARCHAR(200) | NOT NULL |
| summary | VARCHAR(500) | |
| content | TEXT | |
| coverUrl | cover_url | nullable |
| status | TINYINT | 0 草稿 1 已发布 |
| authorId | author_id | FK 逻辑关联 sys_user.id |
| publishedAt | published_at | nullable |
| createdAt | created_at | |
| updatedAt | updated_at | |

**索引**：status + published_at（C 端列表查询）

## 4. API 契约

### B 端 Admin

| 方法 | 路径 | 权限 | 请求/响应 |
|------|------|------|-----------|
| GET | /articles | content:article:list | Query: page, pageSize, status? → PaginationResult\<ArticleListItem\> |
| GET | /articles/:id | content:article:view | Article |
| POST | /articles | content:article:create | CreateArticleDto → Article |
| PUT | /articles/:id | content:article:update | UpdateArticleDto → Article |
| DELETE | /articles/:id | content:article:delete | { success: true } |
| PATCH | /articles/:id/publish | content:article:publish | Article（status=1, publishedAt=now） |

### C 端 Member

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /member/articles | 仅 status=1，分页 ArticleListItem |
| GET | /member/articles/:id | 仅 status=1，否则 404 |

## 5. RBAC Seed 扩展

在 `init.seed.ts` 追加（幂等）：

**权限**（type=api）：
- content:article:list / view / create / update / delete / publish

**菜单**：
- 内容管理（directory, parent_id=0）
  - 文章管理（menu, path=/content/articles, component=views/content/articles/index）

**关联**：super_admin 角色绑定全部 6 权限

## 6. shared-types

```typescript
export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  coverUrl?: string;
  status: 0 | 1;
  authorId: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
export interface ArticleListItem { id, title, summary, coverUrl?, status, publishedAt? }
export interface CreateArticleDto { title, summary?, content, coverUrl? }
export interface UpdateArticleDto { title?, summary?, content?, coverUrl?, status? }
```

## 7. Admin UI

- `views/content/articles/index.vue` — 表格 + 分页 + 状态 Tag
- `views/content/articles/form.vue` — 创建/编辑（路由 `/content/articles/create`, `/content/articles/:id/edit`）
- 按钮：`v-permission="'content:article:create'"` 等
- API：`admin/src/api/article.ts`

## 8. Uni-app UI

- `pages/articles/list.vue` — 列表
- `pages/articles/detail.vue` — 详情
- `api/article.ts` — 仅 `/member/articles`
- pages.json 注册路由；首页添加入口

## 9. 测试策略

| 范围 | 测试 |
|------|------|
| article entity | metadata 单测 |
| article-api | e2e：admin CRUD、publish、403、member 列表/详情、草稿 404 |
| seed | 幂等单测或 mock |
| admin/uni-app | pnpm build |

## 10. E2e 基础设施

复用 `server/test/auth/e2e-app.helper.ts` 模式：sqlite + mock Redis + initE2eSchema 扩展 article 表 DDL。
