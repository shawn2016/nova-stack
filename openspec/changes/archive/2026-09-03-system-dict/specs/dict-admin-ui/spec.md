## ADDED Requirements

### Requirement: 字典管理页
Admin MUST 提供字典管理页：字典类型列表与选中类型下的字典项列表，对接 dict API；操作受 `system:dict:*` 权限控制。

#### Scenario: 类型与项联动
- **WHEN** 管理员选中某字典类型
- **THEN** 右侧展示该类型下的字典项表格

#### Scenario: 新增字典项
- **WHEN** 有 `system:dict:data:create` 并提交 label/value
- **THEN** 调用 POST 成功并刷新项列表

### Requirement: 字典下拉复用
Admin MUST 提供 composable（如 `useDict(typeCode)`），从 `GET /dict/data/by-type/:code` 加载选项供 ElSelect 使用。

#### Scenario: 表单下拉
- **WHEN** 某页面调用 `useDict('user_status')`
- **THEN** 获得响应式选项列表，可用于 ElSelect options
