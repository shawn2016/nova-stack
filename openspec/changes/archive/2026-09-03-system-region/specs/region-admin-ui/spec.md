## ADDED Requirements

### Requirement: 地区管理页
Admin MUST 提供 `/system/region` 页面，树形展示地区，支持增删改与关键词搜索。

#### Scenario: 树形列表
- **WHEN** 管理员进入地区管理
- **THEN** 展示省市区树形表格，可展开/收起

#### Scenario: 新增子地区
- **WHEN** 有 create 权限并提交表单
- **THEN** 调用 POST `/regions` 并刷新树

#### Scenario: 权限控制
- **WHEN** 用户无 `system:region:delete`
- **THEN** 删除按钮不可见
