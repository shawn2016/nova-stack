## ADDED Requirements

### Requirement: 字典类型 CRUD
系统 MUST 提供字典类型的 list/create/update/delete API，需 Admin JWT 与对应 `@RequirePermission`。

#### Scenario: 创建字典类型
- **WHEN** 有 `system:dict:type:create` 权限 POST 合法类型（name、唯一 code）
- **THEN** 返回 201 及新类型 id

#### Scenario: 类型 code 重复
- **WHEN** POST 的 code 已存在
- **THEN** 返回 400，不创建

#### Scenario: 删除有关联项的类型
- **WHEN** 类型下仍有字典项时 DELETE
- **THEN** 返回 400，不删除

### Requirement: 字典项 CRUD
系统 MUST 提供字典项的 list/create/update/delete，支持按 typeId 或 typeCode 筛选。

#### Scenario: 按类型查询字典项
- **WHEN** GET `/dict/data?typeCode=user_status`
- **THEN** 返回该类型下字典项分页列表

#### Scenario: 同类型 value 唯一
- **WHEN** 同一 type 下 value 重复提交
- **THEN** 返回 400

### Requirement: 按类型编码读取启用项
系统 MUST 提供 `GET /dict/data/by-type/:code`，返回指定类型下 status=启用 的字典项，按 sort 升序。

#### Scenario: 下拉数据源
- **WHEN** Admin 请求 `GET /dict/data/by-type/user_status`
- **THEN** 返回 `[{ label, value, sort }]`，不含禁用项

#### Scenario: 未知类型
- **WHEN** code 不存在
- **THEN** 返回 404 或空数组（实现统一为 404）
