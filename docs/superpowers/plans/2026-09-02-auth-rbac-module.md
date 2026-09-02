---
change: auth-rbac-module
design-doc: docs/superpowers/specs/2026-09-02-auth-rbac-module-design.md
base-ref: 37a316aa84a8aad66bd01b620b083d2b9f739e5e
---

# auth-rbac-module 实施计划

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Goal:** 实现 B 端 Admin RBAC + C 端 Member 双轨鉴权，含完整数据库表与三端 UI。

**Architecture:** 共享 JwtService；/auth/* vs /member/auth/* 分离；7 张 MySQL 表 + Redis。

**Spec:** docs/superpowers/specs/2026-09-02-auth-rbac-module-design.md

## Global Constraints

- 产物语言：zh-CN
- B 端/C 端用户表分离
- 权限以后端为唯一可信源
- bcrypt 密码、JWT + Redis 黑名单

---

## Task 1: shared-types 鉴权类型

- [x] 1.1 新增 TokenPair、AdminInfo、MemberInfo、MenuNode、Login DTOs — 验证：build 通过

## Task 2: 数据库 Entity + Migration + Seed

- [x] 2.1 创建 7 个 TypeORM Entity — 验证：与 design.md 表结构一致
- [x] 2.2 migration/sync + seed 脚本 — 验证：`pnpm seed` 成功

## Task 3: JwtService + Redis 黑名单

- [ ] 3.1 共享 JwtService（sign/verify/blacklist） — 验证：单元测试
- [ ] 3.2 生产 JWT fail-fast — 验证：弱密钥 production 失败

## Task 4: B 端 Auth + RBAC API

- [ ] 4.1 POST /auth/login|logout|refresh — 验证：e2e
- [ ] 4.2 GET /auth/me + /auth/me/menus — 验证：e2e 菜单树
- [ ] 4.3 PermissionGuard + Role/Menu CRUD 骨架 — 验证：403 e2e
- [ ] 4.4 enableCors — 验证：跨域

## Task 5: C 端 Member Auth API

- [ ] 5.1 POST /member/auth/login|register|logout|refresh — 验证：e2e
- [ ] 5.2 Member/Admin Token 隔离 Guard — 验证：member 访问 /auth/me → 403

## Task 6: Admin UI

- [ ] 6.1 登录对接 + Axios refresh 队列 — 验证：admin 登录
- [ ] 6.2 动态路由 + v-permission + 路由守卫 — 验证：菜单/按钮

## Task 7: Uni-app C 端 UI

- [ ] 7.1 登录/注册页 + member store — 验证：H5 登录
- [ ] 7.2 request Token 注入 — 验证：带 Token 请求

## Task 8: 集成验证

- [ ] 8.1 双轨 smoke + openspec validate — 验证：通过
