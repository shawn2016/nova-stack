## ADDED Requirements

### Requirement: 角色数据范围 UI
Admin 角色编辑 MUST 提供数据范围选择与自定义部门树（dataScope=2 时）。

#### Scenario: 编辑角色数据范围
- **WHEN** 有 `system:role:update` 的用户修改 dataScope 并保存
- **THEN** 调用 role update API 成功

#### Scenario: super_admin 不可改范围
- **WHEN** 编辑 super_admin 角色
- **THEN** 数据范围控件禁用或隐藏
