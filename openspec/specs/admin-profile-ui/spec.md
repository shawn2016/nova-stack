# admin-profile-ui Specification

## Purpose
TBD - created by archiving change admin-profile-and-oss. Update Purpose after archive.

## Requirements

### Requirement: 个人中心资料编辑
Admin MUST 提供个人中心页，展示当前登录用户昵称与头像，并允许保存至 `PUT /auth/me`。

#### Scenario: 加载当前用户
- **WHEN** 已登录用户访问个人中心
- **THEN** 表单展示 `GET /auth/me` 返回的 nickname、avatar

#### Scenario: 保存资料
- **WHEN** 用户修改昵称并保存
- **THEN** 调用 `PUT /auth/me` 成功并提示；顶栏用户信息同步更新

### Requirement: 头像上传
个人中心 MUST 提供头像上传，调用 `POST /files/upload` 后将返回 URL 写入 profile。

#### Scenario: 上传头像
- **WHEN** 用户选择图片并上传
- **THEN** 预览更新；保存后 avatar 持久化

### Requirement: 修改密码
个人中心 MUST 提供改密表单（当前密码、新密码、确认密码），调用 `PUT /auth/me/password`。

#### Scenario: 改密成功
- **WHEN** 三次输入一致且当前密码正确
- **THEN** 提示成功；可选引导重新登录

#### Scenario: 确认密码不一致
- **WHEN** 新密码与确认密码不同
- **THEN** 前端校验阻止提交
