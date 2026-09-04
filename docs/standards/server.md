# Server

## 模块结构（MUST）

```
server/src/modules/<domain>/
  *.module.ts → *.controller.ts → *.service.ts → dto/
```

新模块注册 `app.module.ts`。

## 类型与 API（MUST）

1. **先** `@nova/shared-types`，再 DTO / controller / admin
2. 响应 `ApiResponse<T>`；分页 query `page`/`pageSize`，响应 `PaginationResult`
3. 全局前缀 `/api`

## 权限与 Seed（MUST）

| 步骤 | 动作 |
|------|------|
| Controller | `@RequirePermission('module:resource:action')` |
| 新权限 | `init.seed.ts` → `PERMISSION_SEEDS` |
| 新菜单 | `MENU_SEEDS`（`path`、`component`、`permissionCode`） |
| 命名 | 与 Admin `v-permission` 字符串**完全一致** |

super_admin 权限由 seed 循环自动绑定，无需手改角色表。

## DTO（MUST）

`class-validator` + `class-transformer`；Controller 方法 `@ApiOperation({ summary: '中文' })`。

## 数据权限（SHOULD）

用户/部门/审计/在线会话等列表：用 `DataScopeService`（`server/src/modules/data-scope/`）。

## 测试（SHOULD）

新 API e2e：成功 + 403 + 关键 400。

## 标杆

- CRUD：`server/src/modules/rbac/user/`
- sys_config：`upload/upload-settings.service.ts`
