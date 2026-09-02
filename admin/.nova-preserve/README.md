# Nova Admin 保留代码（Task 3 接入用）

Task 1 合并 art-design-pro 模板时，以下 nova-stack 原有逻辑暂存于此，待 Task 3 鉴权/RBAC 集成时恢复至 `src/`：

- `api/` — JWT refresh、`request.ts`、`auth.ts`、`article.ts`
- `user.ts` — Pinia 用户 store（nova RBAC）
- `menusToRoutes.ts` / `permission.ts` — 动态路由与权限守卫
- `permission.ts` — `v-permission` 指令
- `content/` — 文章管理页面（Arco 版，Task 4 将重写为 Element Plus）
