## ADDED Requirements

### Requirement: 部门管理页面
Admin MUST 提供 `/system/dept` 页面：树形表格展示部门，支持增删改、展开/收起。

#### Scenario: 加载部门树
- **WHEN** 有 `system:dept:list` 的用户打开页面
- **THEN** 展示完整部门树，含状态列

#### Scenario: 行内状态开关
- **WHEN** 有 `system:dept:update` 的用户切换某行状态
- **THEN** 调用 status API 并刷新树

### Requirement: 模块功能开关面板
Admin MUST 在部门管理页提供功能开关区域，展示并编辑 moduleEnabled 与 userBindingEnabled。

#### Scenario: 编辑功能开关
- **WHEN** 有 `system:dept:settings` 的用户修改开关并保存
- **THEN** 调用 settings API 成功并提示

### Requirement: 用户管理部门字段
Admin 用户管理 MUST 支持选择所属部门，列表展示部门名称。

#### Scenario: 编辑用户部门
- **WHEN** 在用户对话框选择部门并保存
- **THEN** 用户列表部门列更新

#### Scenario: 模块绑定关闭
- **WHEN** `userBindingEnabled=false`
- **THEN** 用户表单隐藏部门选择器（或只读提示）
