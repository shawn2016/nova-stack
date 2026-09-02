## 1. 共享类型扩展

- [x] 1.1 新增 AdminLoginResponse、MemberLoginResponse、UserInfo、MemberInfo、MenuNode 等类型 — 验证：三端编译通过

## 2. 数据库与 Seed

- [x] 2.1 创建实体与 migration：sys_user、sys_role、sys_permission、sys_menu、sys_user_role、sys_role_permission、member_user — 验证：表结构与设计文档一致
- [x] 2.2 实现 seed（admin/admin123 + RBAC 基础 + 测试会员） — 验证：`pnpm seed` 成功
- [ ] 2.3 生产 JWT_SECRET fail-fast — 验证：弱密钥 production 启动失败

## 3. Server — B 端 Auth API

- [ ] 3.1 `POST /auth/login|logout|refresh`（sys_user） — 验证：admin e2e
- [ ] 3.2 Redis JWT 黑名单 — 验证：登出后 401
- [ ] 3.3 `GET /auth/me` + `GET /auth/me/menus` — 验证：返回菜单树
- [ ] 3.4 `@RequirePermission()` + PermissionGuard — 验证：403
- [ ] 3.5 Role/Menu CRUD API 骨架 — 验证：Swagger 可见
- [ ] 3.6 启用 CORS — 验证：admin 跨域 OK

## 4. Server — C 端 Member Auth API

- [ ] 4.1 `POST /member/auth/login|register|logout|refresh`（member_user） — 验证：member e2e
- [ ] 4.2 AdminGuard 拒绝 member Token 访问 B 端接口 — 验证：403
- [ ] 4.3 JWT payload type 区分 admin/member — 验证：解码正确

## 5. Admin B 端 UI

- [ ] 5.1 登录页对接 `/auth/login` — 验证：admin 可登录
- [ ] 5.2 Axios Token + refresh — 验证：401 自动刷新
- [ ] 5.3 动态路由 + v-permission — 验证：菜单与按钮权限
- [ ] 5.4 路由守卫 — 验证：未登录跳转 login

## 6. Uni-app C 端 UI

- [ ] 6.1 会员登录/注册页 — 验证：H5 登录成功
- [ ] 6.2 Member Token 注入 — 验证：带 Token 请求
- [ ] 6.3 不请求 B 端菜单 API — 验证：无 `/auth/me/menus` 调用

## 7. 集成验证

- [ ] 7.1 Admin 与 Member 分别登录 smoke — 验证：双轨互不干扰
- [ ] 7.2 `openspec validate auth-rbac-module --strict` — 验证：通过
