## ADDED Requirements

### Requirement: 角色数据范围配置
系统 MUST 在 sys_role 支持 data_scope（1-5），CUSTOM 时通过 sys_role_dept 关联部门；角色 create/update/详情含 dataScope 与 customDeptIds。

#### Scenario: 创建 CUSTOM 范围角色
- **WHEN** POST `/roles` 含 dataScope=2 与 customDeptIds
- **THEN** 返回 201，详情含 dataScope 与 customDeptIds

#### Scenario: super_admin 固定 ALL
- **WHEN** PUT super_admin 角色 dataScope 为非 1
- **THEN** 返回 400

### Requirement: 数据范围解析
系统 MUST 提供 DataScopeService，根据用户角色计算可访问部门 ID 集合；super_admin 无限制。

#### Scenario: DEPT 范围
- **WHEN** 用户 deptId=D，角色 dataScope=3
- **THEN** 解析结果仅含 D

#### Scenario: 多角色并集
- **WHEN** 用户有两角色分别 DEPT 与 CUSTOM 含 E
- **THEN** 解析结果为 D ∪ E

### Requirement: 用户列表过滤
GET `/users` MUST 按当前用户数据范围过滤结果。

#### Scenario: SELF 仅看自己
- **WHEN** 角色 dataScope=5 的用户 list users
- **THEN** 仅返回该用户自身

#### Scenario: ALL 无过滤
- **WHEN** super_admin list users
- **THEN** 返回全部用户（分页内）
