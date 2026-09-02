## 1. 共享类型

- [x] 1.1 新增 Article、ArticleListItem、CreateArticleDto 等类型 — 验证：三端编译通过

## 2. 数据库与 Seed

- [x] 2.1 ArticleEntity + migration/sync — 验证：表结构与 design 一致
- [x] 2.2 扩展 RBAC seed：文章管理菜单 + 5 权限码 — 验证：Admin 菜单可见
- [x] 2.3 示例文章 seed（dev） — 验证：`pnpm seed` 或 seed 单测

## 3. Server — Article API

- [x] 3.1 B 端 `/articles` CRUD + publish — 验证：e2e + PermissionGuard 403
- [x] 3.2 C 端 `/member/articles` 只读列表/详情 — 验证：member e2e，草稿不可见
- [x] 3.3 Admin Token 不可访问 `/member/articles` 混淆测试（可选）— 验证：隔离

## 4. Admin UI

- [x] 4.1 文章列表页（分页、状态筛选） — 验证：admin 登录可访问
- [x] 4.2 创建/编辑表单 + 发布/删除 — 验证：v-permission 按钮
- [x] 4.3 动态路由对接新菜单 — 验证：侧边栏「文章管理」

## 5. Uni-app C 端 UI

- [x] 5.1 文章列表页 — 验证：H5 登录后可浏览
- [x] 5.2 文章详情页 — 验证：仅已发布内容
- [x] 5.3 不调用 B 端 `/articles` 管理 API — 验证：仅用 `/member/articles`

## 6. 集成验证

- [x] 6.1 Admin 创建发布 + Member 可见 smoke — 验证：双轨联调
- [x] 6.2 `openspec validate demo-business-module --strict` — 验证：通过
