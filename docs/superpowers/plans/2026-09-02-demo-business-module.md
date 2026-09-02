---
change: demo-business-module
design-doc: docs/superpowers/specs/2026-09-02-demo-business-module-design.md
base-ref: f3689d35569485906068c341c0d8ace7d0fc0a9c
---

# demo-business-module 实施计划

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Goal:** Article 示例业务三端联调（Admin CRUD + Member 只读）

**Architecture:** article 表 + ArticleModule；/articles vs /member/articles

**Spec:** docs/superpowers/specs/2026-09-02-demo-business-module-design.md

## Global Constraints

- 产物语言：zh-CN
- C 端只读，B 端 RBAC 权限
- 不引入富文本/OSS

---

## Task 1: shared-types Article 类型

- [x] 1.1 新增 Article、ArticleListItem、Create/Update DTO — 验证：build 通过

## Task 2: Entity + Seed 扩展

- [x] 2.1 ArticleEntity — 验证：与 design 一致
- [x] 2.2 RBAC seed 扩展 + dev 示例文章 — 验证：seed 单测

## Task 3: Server Article API

- [ ] 3.1 B 端 /articles CRUD + publish — 验证：e2e
- [ ] 3.2 C 端 /member/articles 只读 — 验证：e2e

## Task 4: Admin 文章管理 UI

- [ ] 4.1 列表 + 表单 + v-permission — 验证：admin build

## Task 5: Uni-app 文章 UI

- [ ] 5.1 列表 + 详情 — 验证：build:h5

## Task 6: 集成验证

- [ ] 6.1 smoke + openspec validate — 验证：通过
