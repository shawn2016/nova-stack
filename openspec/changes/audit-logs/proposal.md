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
