## Why

`system-dept` 已提供部门树与用户归属，但角色仍缺少**数据权限范围**配置。Admin 无法限制某角色只能查看本部门或自定义部门的数据。这是 System/Infra 扩展批次**第 4 项**，采用与 `system-region` 相同的 Comet 全流程交付。

## What Changes

- **Server — 角色数据范围**：`sys_role.data_scope` 枚举；`sys_role_dept` 自定义部门关联
- **Server — 范围解析服务**：根据当前用户角色计算可访问部门 ID 集合
- **Server — 查询过滤**：用户列表 API 按数据范围过滤（MVP 示范）
- **shared-types**：DataScope 枚举、Role DTO 扩展
- **Admin — 角色管理**：数据范围选择 + 自定义部门树
- **RBAC**：super_admin 始终全部数据；数据范围模块开关（sys_config）

## Capabilities

### New Capabilities

- `data-scope-api`: 角色 dataScope 配置、范围解析、用户列表过滤
- `data-scope-admin-ui`: 角色编辑页数据范围 UI

### Modified Capabilities

- （无）

## Impact

- **主要影响**：`server/src/modules/rbac/role/`、`server/src/modules/data-scope/`（新建）、`server/src/modules/rbac/user/`、`server/src/database/entities/`、`admin/src/views/system/role/`
- **不影响**：Member 端、业务模块（article 等）的数据过滤（后续按需接入）

## Non-Goals

- 全模块自动 SQL 拦截器（AOP）
- 按地区/自定义字段的数据权限
- 动态规则引擎、表达式 DSL
