## ADDED Requirements

### Requirement: 登录日志记录
系统 MUST 在 Admin 登录成功或失败时写入 `sys_login_log`，包含 username、ip、status、时间。

#### Scenario: 登录成功
- **WHEN** Admin 凭据正确登录
- **THEN** 写入 status=成功 的登录日志

#### Scenario: 登录失败
- **WHEN** 用户名或密码错误
- **THEN** 写入 status=失败 的登录日志后返回 401

### Requirement: 操作审计记录
系统 MUST 对 Admin 发起的 POST/PUT/PATCH/DELETE 请求（已认证）在完成后写入 `sys_oper_log`。

#### Scenario: 写操作成功
- **WHEN** Admin 执行 POST 创建用户成功
- **THEN** 操作日志含 username、path、method、status=成功

#### Scenario: 读操作不记录
- **WHEN** Admin GET 列表
- **THEN** 不写入操作日志

### Requirement: 审计日志查询
系统 MUST 提供登录/操作日志分页查询，需对应 list 权限。

#### Scenario: 查询登录日志
- **WHEN** 有 `system:audit:login:list` 请求 GET `/audit/login-logs`
- **THEN** 返回分页列表

#### Scenario: 无权限
- **WHEN** 无 list 权限
- **THEN** 返回 403
