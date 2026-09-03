---
change: audit-logs
design-doc: docs/superpowers/specs/2026-09-03-audit-logs-design.md
base-ref: a5c68dd9a545af89eed783cee835746a7eec2d5f
---

# audit-logs 实施计划

**Goal:** Admin 登录日志 + 操作审计写库与 Admin 只读查询页。

**Architecture:** 实体/types → 登录日志 → OperLogInterceptor + 查询 API → seed → Admin UI → 集成验证

## Global Constraints

- 分支：`comet/audit-logs`
- TDD：e2e 先行
- 不动 uni-app

---

## Task 1: 数据模型与 shared-types

- [x] 1.1 SysLoginLogEntity、SysOperLogEntity
- [x] 1.2 shared-types 审计列表 DTO

## Task 2: 登录日志

- [x] 2.1 LoginLogService + AuthService 集成 — 验证：e2e

## Task 3: 操作审计与查询 API

- [x] 3.1 OperLogInterceptor — 验证：e2e 写操作有记录
- [x] 3.2 GET /audit/login-logs、/audit/oper-logs — 验证：e2e

## Task 4: Seed

- [x] 4.1 permissions + 菜单 — 验证：seed 测试

## Task 5: Admin 审计 UI

- [x] 5.1 双 Tab 审计页 — 验证：admin build

## Task 6: 集成验证

- [x] 6.1 全绿 + openspec validate
