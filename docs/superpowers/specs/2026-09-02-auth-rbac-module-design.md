---
comet_change: auth-rbac-module
role: technical-design
canonical_spec: openspec
---

# auth-rbac-module 深度技术设计

## 1. 架构总览

```
                    ┌─────────────────────────────────────┐
                    │           JwtService (共享)          │
                    │    sign / verify / blacklist        │
                    └──────────────┬──────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
   /auth/* (B端)          /member/auth/* (C端)        Redis
   SysUser + RBAC         MemberUser 仅认证           blacklist
          │                        │
          ▼                        ▼
      Admin Vue3              Uni-app H5/MP
   动态路由+v-permission      登录/注册页
```

## 2. Server 模块结构

```
server/src/modules/
├── auth/                    # B 端 Admin 认证
│   ├── auth.controller.ts   # POST /auth/login|logout|refresh
│   ├── auth.service.ts
│   ├── strategies/jwt.strategy.ts  # 校验 type=admin
│   └── guards/admin-auth.guard.ts
├── member-auth/             # C 端 Member 认证
│   ├── member-auth.controller.ts  # POST /member/auth/*
│   ├── member-auth.service.ts
│   └── guards/member-auth.guard.ts
├── user/                    # sys_user CRUD（骨架）
├── member/                  # member_user
├── rbac/
│   ├── role/
│   ├── menu/
│   ├── permission/
│   └── guards/permission.guard.ts
└── common/jwt/
    ├── jwt.service.ts       # 签发/验证/黑名单
    └── jwt-payload.interface.ts  # { sub, type, jti }
```

## 3. 数据库 Entity 映射

TypeORM entities 与 design.md 表一一对应：

- `SysUserEntity` → sys_user
- `SysRoleEntity` → sys_role
- `SysPermissionEntity` → sys_permission
- `SysMenuEntity` → sys_menu（@Tree parentId）
- `SysUserRoleEntity` → sys_user_role
- `SysRolePermissionEntity` → sys_role_permission
- `MemberUserEntity` → member_user

**索引**：username UNIQUE、phone UNIQUE、permission.code UNIQUE、role.code UNIQUE

## 4. API 契约

### B 端 Admin

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /auth/login | `{ username, password }` → TokenPair + AdminInfo |
| POST | /auth/logout | Bearer → 200 |
| POST | /auth/refresh | `{ refreshToken }` → new accessToken |
| GET | /auth/me | 当前管理员 + roles + permissions[] |
| GET | /auth/me/menus | MenuNode[] 树 |

### C 端 Member

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /member/auth/login | `{ phone, password }` → TokenPair + MemberInfo |
| POST | /member/auth/register | `{ phone, password, nickname? }` → 201 |
| POST | /member/auth/logout | Bearer → 200 |
| POST | /member/auth/refresh | `{ refreshToken }` → new accessToken |

### JWT Payload

```typescript
interface JwtPayload {
  sub: number;       // user id
  type: 'admin' | 'member';
  jti: string;       // 黑名单 key
  iat: number;
  exp: number;
}
```

## 5. Guard 链

```
请求 → JwtAuthGuard（解析 Token + 黑名单检查）
     → AdminAuthGuard | MemberAuthGuard（type 匹配）
     → RolesGuard | PermissionGuard（仅 B 端受保护路由）
```

`@Public()` 跳过 JwtAuthGuard。

## 6. Admin 前端

### 动态路由转换

```typescript
function menusToRoutes(menus: MenuNode[]): RouteRecordRaw[] {
  // type=directory → layout children
  // type=menu → lazy import component
  // type=button → 不生成路由，仅 v-permission
}
```

### v-permission 指令

```typescript
// 检查 userStore.permissions.includes(binding.value)
// 无权限：el.parentNode?.removeChild(el)
```

### Axios refresh 队列

401 → 若未在 refreshing，调用 /auth/refresh → 成功则重试队列 → 失败 logout

## 7. Uni-app C 端

- `pages/login/login.vue` → `/member/auth/login`
- `pages/register/register.vue` → `/member/auth/register`
- `store/member.ts`：token、memberInfo
- `utils/request.ts`：注入 member token，401 → login 页
- **禁止** import 或调用 admin 菜单 API

## 8. shared-types 新增

```typescript
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
export interface AdminInfo { id, username, nickname, avatar, roles, permissions }
export interface MemberInfo { id, phone, nickname, avatar }
export interface MenuNode { id, name, path, component, icon, type, children? }
```

## 9. Seed 脚本

`server/src/database/seeds/init.seed.ts`：
1. 创建 super_admin 角色 + 基础 permissions/menus
2. 创建 admin 用户（bcrypt admin123）
3. dev：创建 member 13800138000 / member123

## 10. 测试策略

| 范围 | 测试 |
|------|------|
| auth-api | e2e login/logout/refresh/blacklist |
| member-auth-api | e2e register/login + admin 403 |
| rbac-api | e2e me/menus + permission 403 |
| admin | 手动 smoke 登录+菜单 |
| uni-app | H5 smoke 会员登录 |

## 11. 迁移与兼容

- 移除 AuthController 501 占位
- CORS：`origin: [admin dev, uni-app dev], credentials: true`
- production JWT_SECRET 校验在 ConfigModule validation
