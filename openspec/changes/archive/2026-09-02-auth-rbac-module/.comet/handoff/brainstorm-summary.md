# Brainstorm Summary

- Change: auth-rbac-module
- Date: 2026-09-02
- Status: 已确认

## 确认的技术方案

**双轨鉴权**：B 端 Admin（sys_user + RBAC）与 C 端 Member（member_user 独立）共享 JWT/Redis 基础设施，API 前缀分离。

**数据库**：7 张 MySQL 表 + Redis 黑名单/refresh，完整 DDL 见 design.md。

**Admin**：动态路由 + v-permission；**Uni-app**：会员登录/注册，不接入 B 端菜单。

## 关键取舍

- C 端不做 RBAC 菜单树，降低复杂度
- JWT payload.type 区分 admin/member
- bcrypt 密码、Redis refresh 单用户单 token

## 测试策略

- B 端 auth e2e：login/logout/refresh/menus/403
- C 端 member e2e：register/login/隔离验证
- Admin/Uni-app smoke

## Spec Patch

无
