# dept-api Specification

## Purpose
TBD - created by archiving change system-dept. Update Purpose after archive.

## Requirements

### Requirement: 部门树查询
系统 MUST 提供 `GET /depts/tree`（仅启用节点）与 `GET /depts/tree/all`（含停用节点），返回嵌套树，按 sort 与 id 排序。

#### Scenario: 下拉选择器加载启用树
- **WHEN** 已登录用户请求 `/depts/tree`
- **THEN** 返回 `{ id, parentId, name, sort, status, children? }[]`，不包含 status=0 的节点

#### Scenario: 管理页加载完整树
- **WHEN** 有 `system:dept:list` 权限请求 `/depts/tree/all`
- **THEN** 返回含 status=0 节点的完整树

### Requirement: 部门 CRUD
系统 MUST 提供部门 list（分页）、create、update、delete API，需 Admin JWT 与 `@RequirePermission`。

#### Scenario: 创建子部门
- **WHEN** POST 合法节点（parentId 指向已存在部门、name 非空）
- **THEN** 返回 201 及 string id

#### Scenario: 删除有子部门的节点
- **WHEN** DELETE 仍有子部门的记录
- **THEN** 返回 400，不删除

#### Scenario: 删除有关联用户的部门
- **WHEN** DELETE 的部门下仍有 sys_user.dept_id 指向该部门
- **THEN** 返回 400，不删除

### Requirement: 部门状态开关
系统 MUST 提供 `PUT /depts/:id/status`，切换节点 status 0/1。

#### Scenario: 停用部门
- **WHEN** PUT status=0
- **THEN** 该节点不再出现在 `/depts/tree` 响应中

### Requirement: 模块功能开关
系统 MUST 在 sys_config（group=dept）维护 `dept.module.enabled` 与 `dept.user_binding.enabled`，并提供 GET/PUT `/depts/settings`。

#### Scenario: 读取功能开关
- **WHEN** GET `/depts/settings` 且有 `system:dept:list`
- **THEN** 返回 `{ moduleEnabled: boolean, userBindingEnabled: boolean }`

#### Scenario: 关闭模块总开关
- **WHEN** `dept.module.enabled=false` 后 POST `/depts`
- **THEN** 返回 403

### Requirement: 用户部门归属
系统 MUST 在 sys_user 支持可选 dept_id；用户 create/update/list/detail 包含 deptId 与 deptName。

#### Scenario: 创建用户并指定部门
- **WHEN** POST `/users` 含合法 deptId（启用部门）
- **THEN** 返回用户详情含 deptId 与 deptName

#### Scenario: 绑定到停用部门
- **WHEN** POST/PUT 用户 deptId 指向 status=0 的部门
- **THEN** 返回 400
