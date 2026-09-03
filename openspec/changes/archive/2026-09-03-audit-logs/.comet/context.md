# Comet Design Handoff

- Change: audit-logs
- Phase: design
- Mode: compact
- Context hash: d1b06deb14f7a28b0b63573457b6ba16ba48a0fb8ab825cc1c9b670745a9dbdc

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/audit-logs/proposal.md

- Source: openspec/changes/audit-logs/proposal.md
- Lines: 1-33
- SHA256: 94c412332b32a2cf2a03e5bef2ff9a9b007d197d632110050b94a3a5c242e693

```md
## Why

脚手架基座已具备 RBAC、字典与站点配置，但缺少**登录与操作审计**能力。安全合规与运维排查需要记录 Admin 登录成败及关键写操作（谁、何时、做了什么）。这是 `scaffold-system-base` 批次第 4 项。

## What Changes

- **Server — 登录日志**：Admin 登录成功/失败写 `sys_login_log`（用户名、IP、结果、时间）
- **Server — 操作审计**：Admin 写操作（POST/PUT/DELETE/PATCH）通过拦截器写 `sys_oper_log`
- **Server — 查询 API**：分页列表 + 筛选，需审计查看权限
- **Admin — 审计日志页**：登录日志、操作日志两个 Tab/子页
- **Seed**：权限与菜单

## Capabilities

### New Capabilities

- `audit-log-api`: 登录/操作日志写入与查询 API
- `audit-log-admin-ui`: Admin 审计日志查看页

### Modified Capabilities

- `auth-api`: Admin 登录流程写入登录日志（实现层，spec 可选 MODIFIED）

## Impact

- **主要影响**：`server/src/modules/audit/`、`server/src/modules/auth/`、`admin/src/views/system/audit/`
- **不影响**：uni-app、Member 登录审计（后续 change）

## Non-Goals

- uni-app / Member 端审计
- 日志导出、ELK 对接、异步队列、日志 retention 自动清理
- 读操作（GET）审计

```

## openspec/changes/audit-logs/design.md

- Source: openspec/changes/audit-logs/design.md
- Lines: 1-83
- SHA256: 7f93dbf6ff6239355477317588c04e5945f958b82ed954353cf6b5b4e12c1305

[TRUNCATED]

```md
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

```

Full source: openspec/changes/audit-logs/design.md

## openspec/changes/audit-logs/tasks.md

- Source: openspec/changes/audit-logs/tasks.md
- Lines: 1-21
- SHA256: 7526c197f3450e5e715a9c3eebd469f2d3808c3b043b87f2d422fafbb4e0d9c0

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 `SysLoginLogEntity`、`SysOperLogEntity` — 验证：建表
- [ ] 1.2 shared-types 审计 DTO — 验证：编译

## 2. Server 审计写入与查询

- [ ] 2.1 登录日志写入（AuthService） — 验证：e2e 登录成功/失败有记录
- [ ] 2.2 OperLogInterceptor + 查询 API — 验证：e2e 写操作有 log + 列表 API

## 3. Seed

- [ ] 3.1 permissions + 菜单 — 验证：seed 测试

## 4. Admin 审计 UI

- [ ] 4.1 审计日志页（双 Tab） — 验证：admin build

## 5. 集成验证

- [ ] 5.1 全量 test/e2e/build + openspec validate — 验证：通过

```

## openspec/changes/audit-logs/specs/audit-log-admin-ui/spec.md

- Source: openspec/changes/audit-logs/specs/audit-log-admin-ui/spec.md
- Lines: 1-12
- SHA256: f367e9ac8a1121b6dcdf5d7eadf2dda0334d91f193da0399ae445917dd40d9d6

```md
## ADDED Requirements

### Requirement: 审计日志查看页
Admin MUST 提供审计日志页，含登录日志与操作日志两个视图，只读。

#### Scenario: 登录日志 Tab
- **WHEN** 有 `system:audit:login:list` 访问
- **THEN** 展示登录日志表格，支持 username/status 筛选

#### Scenario: 操作日志 Tab
- **WHEN** 有 `system:audit:oper:list` 访问
- **THEN** 展示操作日志表格，支持 module/username 筛选

```

## openspec/changes/audit-logs/specs/audit-log-api/spec.md

- Source: openspec/changes/audit-logs/specs/audit-log-api/spec.md
- Lines: 1-34
- SHA256: ab5ac7c1f5d6e5d65db5ca6019af33ec82c812534926ca423dbddbbca6084288

```md
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

```
