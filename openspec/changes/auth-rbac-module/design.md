## Context

在脚手架基础上实现 **B 端（Admin）与 C 端（Uni-app Member）双轨鉴权体系**，共享 JWT/Redis 基础设施但用户表与 API 分离。OpenSpec delta spec 为需求事实源，本文档含完整数据库表设计。

## Goals / Non-Goals

**Goals:**
- B 端：经典 RBAC（SysUser ↔ Role ↔ Permission ↔ Menu 树）
- C 端：Member 独立登录/register，JWT 认证，无 RBAC 菜单
- 共享：JWT 签发、Redis 黑名单、CORS、生产密钥 fail-fast
- **完整数据库表设计**（见下文）

**Non-Goals:**
- C 端权限树、OAuth、多租户

## 数据库设计

### ER 关系

```
[B 端 RBAC]
sys_user ──M:N── sys_role ──M:N── sys_permission
sys_menu（树形，type: directory | menu | button）
sys_menu.permission_code → sys_permission.code（可选关联）

[C 端 Member]
member_user（独立表，与 sys_user 无关联）
```

### 表结构

#### `sys_user` — B 端管理员

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| username | VARCHAR(64) UNIQUE | 登录名 |
| password_hash | VARCHAR(255) | bcrypt |
| nickname | VARCHAR(64) | 昵称 |
| avatar | VARCHAR(512) | 头像 URL |
| status | TINYINT | 0=禁用 1=正常 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### `sys_role`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| name | VARCHAR(64) | 角色名 |
| code | VARCHAR(64) UNIQUE | 如 `super_admin` |
| status | TINYINT | 0/1 |
| sort | INT | 排序 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### `sys_permission`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| name | VARCHAR(64) | 权限名 |
| code | VARCHAR(128) UNIQUE | 如 `system:user:list` |
| type | VARCHAR(16) | menu / button / api |
| created_at | DATETIME | |

#### `sys_menu`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| parent_id | BIGINT | 父菜单 ID，0=根 |
| name | VARCHAR(64) | 菜单名 |
| path | VARCHAR(256) | 前端路由 path |
| component | VARCHAR(256) | 组件路径 |
| icon | VARCHAR(64) | 图标 |
| type | VARCHAR(16) | directory / menu / button |
| permission_code | VARCHAR(128) | 关联权限码 |
| sort | INT | 排序 |
| visible | TINYINT | 是否可见 |
| status | TINYINT | 0/1 |
| created_at | DATETIME | |

#### `sys_user_role` — 用户角色关联

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | BIGINT PK | FK → sys_user.id |
| role_id | BIGINT PK | FK → sys_role.id |

#### `sys_role_permission` — 角色权限关联

| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | BIGINT PK | FK → sys_role.id |
| permission_id | BIGINT PK | FK → sys_permission.id |

#### `member_user` — C 端会员（独立于 sys_user）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 主键 |
| phone | VARCHAR(20) UNIQUE | 手机号（登录凭证） |
| password_hash | VARCHAR(255) | bcrypt（可选，支持验证码登录扩展） |
| nickname | VARCHAR(64) | 昵称 |
| avatar | VARCHAR(512) | 头像 |
| status | TINYINT | 0=禁用 1=正常 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### Redis 结构（非表）

| Key 模式 | 说明 | TTL |
|----------|------|-----|
| `jwt:blacklist:{jti}` | 已吊销 accessToken | Token 剩余有效期 |
| `refresh:admin:{userId}` | B 端 refreshToken | 7d |
| `refresh:member:{userId}` | C 端 refreshToken | 7d |

### Seed 数据

- `sys_user`: admin / admin123（超级管理员）
- `sys_role`: super_admin
- `sys_permission` + `sys_menu`: 系统管理目录（用户/角色/菜单管理骨架）
- `member_user`: 测试会员 13800138000 / member123（dev only）

## Decisions

### 1. 双轨 API

| 端 | 前缀 | 用户表 | 权限 |
|----|------|--------|------|
| B 端 Admin | `/auth/login` 等 | sys_user | RBAC 完整 |
| C 端 Member | `/member/auth/login` 等 | member_user | 仅身份认证 |

JWT payload 含 `type: 'admin' | 'member'`，Guard 按 type 区分。

### 2. B 端认证流程

登录 → accessToken(2h) + refreshToken(7d, Redis)
登出 → blacklist
刷新 → 校验 refresh → 新 accessToken

### 3. C 端认证流程

与 B 端类似，但独立 Guard 与 User 加载逻辑，**不查询 RBAC 菜单**。

### 4. Admin 动态路由

`GET /auth/me/menus` 返回 B 端菜单树 → 动态注册 routes + v-permission

### 5. Uni-app

登录页调用 `/member/auth/login`，Pinia 存 member token，**不调用** `/auth/me/menus`

### 6. CORS + JWT fail-fast

同前。

## Risks / Trade-offs

- **双用户表复杂度** → API 前缀清晰分离，共享 JwtService 减少重复
- **C 端暂无 RBAC** → 业务 change 按需扩展 member 权限字段

## Open Questions

（无）
