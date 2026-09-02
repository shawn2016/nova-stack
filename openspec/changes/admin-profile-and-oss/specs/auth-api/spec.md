## ADDED Requirements

### Requirement: 当前管理员更新资料
系统 MUST 提供 `PUT /auth/me`，允许当前登录管理员更新 `nickname` 与 `avatar`（URL 字符串）。

#### Scenario: 更新昵称成功
- **WHEN** 携带有效 Admin Token 提交 `{ nickname: "新昵称" }`
- **THEN** 返回 200 及更新后的管理员信息

#### Scenario: 更新头像 URL
- **WHEN** 提交合法 avatar URL（通常来自文件上传接口）
- **THEN** 持久化至 sys_user.avatar 并在后续 `GET /auth/me` 中返回

### Requirement: 当前管理员修改密码
系统 MUST 提供 `PUT /auth/me/password`，校验旧密码后更新 passwordHash。

#### Scenario: 改密成功
- **WHEN** 提交正确 oldPassword 与符合长度要求的 newPassword
- **THEN** 返回 200；使用新密码可登录

#### Scenario: 旧密码错误
- **WHEN** oldPassword 不正确
- **THEN** 返回 400 或 401，不修改密码
