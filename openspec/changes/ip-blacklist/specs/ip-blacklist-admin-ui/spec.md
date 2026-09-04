## Purpose

为运维/管理员提供 IP 黑名单的可视化管理：查看封禁记录、手动添加恶意 IP、解除误封，支撑安全应急操作。

## ADDED Requirements

### Requirement: 黑名单列表页

Admin MUST 提供「IP 黑名单」菜单页，展示 IP、来源（自动/手动）、状态、过期时间、备注、创建时间，并支持分页与刷新。

#### Scenario: 进入列表页
- **WHEN** 具备 `security:ip-blacklist:list` 的管理员打开 `/system/ip-blacklist`
- **THEN** 表格加载黑名单数据

#### Scenario: 无权限隐藏入口
- **WHEN** 当前用户无 list 权限
- **THEN** 侧栏不展示该菜单（或页面不可访问）

### Requirement: 手动添加封禁

Admin MUST 支持通过表单添加 IPv4 黑名单，可填备注与过期时间；**过期时间为空表示永久封禁**。

#### Scenario: 新增成功
- **WHEN** 用户填写合法 IP 并提交
- **THEN** 列表刷新且该 IP 立即被封禁

#### Scenario: 取消不提交
- **WHEN** 用户在弹窗点击取消
- **THEN** 不创建记录

### Requirement: 解除封禁

Admin MUST 支持删除或停用黑名单记录以解除封禁。

#### Scenario: 删除确认后解除
- **WHEN** 用户点击删除并确认
- **THEN** 记录移除，对应 IP 可再次访问
