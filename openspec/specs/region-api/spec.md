# region-api Specification

## Purpose
TBD - created by archiving change system-region. Update Purpose after archive.

## Requirements

### Requirement: 地区树查询
系统 MUST 提供 `GET /regions/tree`，返回启用状态的省/市/区嵌套树，按 level 与 sort 排序。

#### Scenario: 管理页加载完整树
- **WHEN** 有 `system:region:list` 权限请求 tree
- **THEN** 返回嵌套 `{ id, parentId, name, code, level, sort, children? }[]`

#### Scenario: 禁用节点不可见
- **WHEN** 某节点 status=0
- **THEN** tree 响应中不包含该节点及其子孙

### Requirement: 地区 CRUD
系统 MUST 提供地区 list（分页）、create、update、delete API，需 Admin JWT 与 `@RequirePermission`。

#### Scenario: 创建区县
- **WHEN** POST 合法节点（parentId 指向市级、level=3、唯一 code）
- **THEN** 返回 201 及 string id

#### Scenario: code 重复
- **WHEN** POST 的 code 已存在
- **THEN** 返回 400

#### Scenario: 删除有子节点的地区
- **WHEN** DELETE 仍有子节点的记录
- **THEN** 返回 400，不删除

### Requirement: 内置国标 seed
系统 MUST 在 seed 中 upsert 完整省市区国标数据，重复 seed 不倍增记录。

#### Scenario: 首次 seed
- **WHEN** 执行 `pnpm seed`
- **THEN** 存在省级、市级、区县级记录，code 与国标 adcode 一致
