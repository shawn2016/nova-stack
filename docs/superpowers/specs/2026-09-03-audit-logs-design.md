---
comet_change: audit-logs
role: technical-design
canonical_spec: openspec
---

# audit-logs 深度技术设计

## 1. 架构

```
AuthController.login ──► AuthService ──► LoginLogService.write
Admin POST/PUT/DELETE ──► OperLogInterceptor ──► OperLogService.write
Admin 审计页 ──► GET /audit/login-logs | /audit/oper-logs
```

**顺序**：实体/types → 登录日志 + e2e → Interceptor + 查询 API + e2e → seed → Admin UI → 集成验证

## 2. 实体

### sys_login_log
- id bigint, username varchar(64), user_id bigint nullable, ip varchar(64), user_agent varchar(255) nullable, status tinyint, message varchar(255) nullable, created_at

### sys_oper_log
- id bigint, user_id bigint, username varchar(64), module varchar(32), action varchar(32), method varchar(8), path varchar(255), ip varchar(64), request_summary text nullable, status tinyint, error_msg varchar(500) nullable, duration_ms int, created_at

## 3. shared-types

`LoginLogListItem`, `OperLogListItem`, list query types

## 4. LoginLogService

- `recordLoginAttempt({ username, userId?, ip, userAgent?, success, message? })`
- Called from AuthService.login wrapper in controller or service

## 5. OperLogInterceptor

- Implements NestInterceptor
- Use Reflector + request.user from JWT guard
- Map path to module: `/users` → users, `/dict/types` → dict
- action from method: POST→create, PUT/PATCH→update, DELETE→delete
- sanitizeBody: redact password, oldPassword, newPassword; JSON.stringify max 2000 chars
- Register in AuditModule as APP_INTERCEPTOR

## 6. AuditModule

- AuditController: login-logs, oper-logs list endpoints
- AuditService / LoginLogService / OperLogService
- Routes prefix `/audit`

## 7. Seed

- `system:audit:login:list`, `system:audit:oper:list`
- Menu: 审计日志 `/system/audit-logs` component `views/system/audit-logs/index` sort 6

## 8. Admin UI

- `views/system/audit-logs/index.vue` — ElTabs
- `login-logs.vue`, `oper-logs.vue` sub-components or inline
- useTable, read-only

## 9. 测试

- e2e: login creates log, failed login creates log, POST creates oper log, list APIs 403 without perm
