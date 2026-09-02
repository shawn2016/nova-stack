## MODIFIED Requirements

### Requirement: 登录页对接
Admin MUST 提供可用的登录页（Element Plus 表单），提交用户名密码调用 `POST /auth/login`，成功后存储 Token 并跳转 Dashboard。

#### Scenario: 登录成功跳转
- **WHEN** 输入正确凭据并提交
- **THEN** 跳转至 Dashboard

### Requirement: 按钮权限指令
Admin MUST 提供 `v-permission` 指令（或等价权限组件），无权限时隐藏或禁用按钮；与 art-design-pro 按钮/表格操作列兼容。

#### Scenario: 无权限隐藏按钮
- **WHEN** 用户无 `content:article:publish` 权限
- **THEN** 对应发布按钮不可见
