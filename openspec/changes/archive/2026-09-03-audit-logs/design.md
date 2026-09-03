## Context

批次第 4 项。现有 Admin 登录在 `AuthService.login`，写操作分散在各 Controller。MVP 采用**同步写库**，不引入消息队列。

## Goals / Non-Goals

**Goals:**
- 登录日志：成功/失败均记录
- 操作日志：Admin 变更类 HTTP 方法自动记录
- Admin 只读列表页 + RBAC

**Non-Goals:**
- Member 审计、GET 审计、导出、异步

## Decisions

### 1. 数据模型

**sys_login_log**

| 字段 | 说明 |
|------|------|
| username | 尝试登录的用户名 |
| user_id | 成功时关联，失败 nullable |
| ip | 客户端 IP |
| user_agent | 可选 |
| status | 1 成功 0 失败 |
| message | 失败原因或 success |
| created_at | |

**sys_oper_log**

| 字段 | 说明 |
|------|------|
| user_id, username | 操作人 |
| module | 模块名，如 users、dict |
| action | create/update/delete 等 |
| method | HTTP 方法 |
| path | 请求路径 |
| ip | |
| request_summary | 请求体摘要（截断 JSON，脱敏 password） |
| status | 1 成功 0 失败 |
| error_msg | 失败时 |
| duration_ms | 耗时 |
| created_at | |

### 2. 登录日志写入

- `AuthController.login` 注入 `@Req()`，传 IP/UA 至 `AuthService.login`
- try/catch：失败也写 log 再 rethrow
- 仅 Admin 登录端点（`/auth/login`）

### 3. 操作日志 Interceptor

- `OperLogInterceptor` 全局注册（APP_INTERCEPTOR）或 AuditModule 提供
- 条件：已认证 Admin + 方法 ∈ {POST, PUT, PATCH, DELETE}
- 排除：`/auth/login`、`/auth/logout`、健康检查
- 从 route 推断 module/action；request body 截断 2KB，password 字段替换 `***`

### 4. 查询 API

```
GET /audit/login-logs?page&pageSize&username&status&startTime&endTime
GET /audit/oper-logs?page&pageSize&username&module&status&startTime&endTime
```

权限：`system:audit:login:list`、`system:audit:oper:list`

### 5. Admin UI

- `/system/audit-logs` — ElTabs：登录日志 | 操作日志
- 表格 + 搜索筛选，只读无编辑

### 6. Seed

- 2 permissions + 菜单「审计日志」sort 6

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 同步写库影响 latency | MVP 可接受；后续可异步 |
| 敏感数据泄露 | body 脱敏 + 截断 |
