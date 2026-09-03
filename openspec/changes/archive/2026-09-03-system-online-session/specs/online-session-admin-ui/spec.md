## ADDED Requirements

### Requirement: 在线用户管理页
Admin MUST 提供在线用户页面，展示会话列表并支持踢下线。

#### Scenario: 查看在线列表
- **WHEN** 有 `system:session:list` 的用户打开 `/system/online-session`
- **THEN** 展示 username、ip、登录时间等列

#### Scenario: 踢下线操作
- **WHEN** 有 `system:session:kick` 的用户点击踢下线
- **THEN** 调用 kick API 并刷新列表

#### Scenario: 当前会话不可踢
- **WHEN** 列表含当前用户会话
- **THEN** 该行踢下线按钮禁用或隐藏
