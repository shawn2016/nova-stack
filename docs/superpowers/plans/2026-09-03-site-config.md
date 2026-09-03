---
change: site-config
design-doc: docs/superpowers/specs/2026-09-03-site-config-design.md
base-ref: 7a7af2d5732709c6239470e942ac69246865dcc9
---

# site-config 实施计划

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Goal:** 站点 KV 配置 CRUD + 按 key 读取 + Admin 管理页。

**Architecture:** 实体/shared-types → SiteConfig API + e2e → seed → Admin UI → 集成验证

**Spec:** docs/superpowers/specs/2026-09-03-site-config-design.md

## Global Constraints

- 产物语言：zh-CN
- 分支：`comet/site-config`
- 模块名 `site-config`（避免 Nest ConfigModule 混淆）
- TDD：server e2e 先行

---

## Task 1: 数据模型与 shared-types

- [x] 1.1 `SysConfigEntity` + 导出 — 验证：TypeORM 建表
- [x] 1.2 shared-types 配置 DTO — 验证：编译 + vitest

## Task 2: Server 配置 API

- [x] 2.1 SiteConfigModule CRUD + by-key — 验证：e2e
- [x] 2.2 重复 key、Member 403 — 验证：e2e 边界

## Task 3: Seed

- [ ] 3.1 permissions + 菜单 + 示例配置 — 验证：seed 测试

## Task 4: Admin 站点配置 UI

- [ ] 4.1 api + 管理页 + v-permission — 验证：admin build

## Task 5: 集成验证

- [ ] 5.1 server test + e2e、admin build — 验证：全绿
- [ ] 5.2 openspec validate site-config --strict — 验证：通过
