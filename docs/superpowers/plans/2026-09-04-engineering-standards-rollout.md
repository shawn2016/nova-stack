---
change: engineering-standards-rollout
design-doc: docs/superpowers/specs/2026-09-04-engineering-standards-rollout-design.md
base-ref: 5a178f6d58994e27fa76e8a50c7d201127c547e5
archived-with: 2026-09-04-engineering-standards-rollout
---

# engineering-standards-rollout Implementation Plan

> **Goal:** 完善写码规范文档体系，主仓 Entity 对齐字段备注，Verify 接入 checklist。

**Architecture:** 文档 → Entity 迁移 → OpenSpec delta → 测试验证。

**Spec:** docs/superpowers/specs/2026-09-04-engineering-standards-rollout-design.md

## Task 1: 规范文档

- [x] 1.1 更新 `docs/standards/README.md`（存量策略、标杆路径）
- [x] 1.2 新增 `uni-app.md`、`examples/entity-fields.example.ts`
- [x] 1.3 更新 `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/nova-coding-standards.mdc`
- [x] 1.4 `comet-verify` Skill §2c 引用 `ai-checklist.md`

## Task 2: Entity 迁移（main 上 13 个）

- [x] 2.1 article / member-user
- [x] 2.2 sys-user / sys-role / sys-config / sys-menu
- [x] 2.3 sys-dict-type / sys-dict-data
- [x] 2.4 sys-login-log / sys-oper-log / sys-permission
- [x] 2.5 sys-role-permission / sys-user-role

## Task 3: OpenSpec

- [x] 3.1 delta `monorepo-workspace/spec.md`

## Task 4: 验证

- [x] 4.1 `pnpm --filter @nova/server test` — 39 passed
- [x] 4.2 根 `pnpm lint` — 已知 comet 脚本 ESLint 噪声（非本 change 引入）
- [x] 4.3 更新 `openspec/changes/.../tasks.md`
