---
change: system-dict
design-doc: docs/superpowers/specs/2026-09-03-system-dict-design.md
base-ref: 3ac59f98931f87d7eb9fbda5f10c3945eefc2e48
---

# system-dict 实施计划

> **For agentic workers:** Use subagent-driven-development or executing-plans.

**Goal:** 系统字典类型与字典项 CRUD + Admin 管理页 + 下拉复用 composable。

**Architecture:** 实体/shared-types → Dict API + e2e → seed → Admin dict 页 + useDict → 集成验证

**Spec:** docs/superpowers/specs/2026-09-03-system-dict-design.md

## Global Constraints

- 产物语言：zh-CN
- 分支：`comet/system-dict`
- 不动 uni-app / Member 端
- TDD：server e2e 先行
- 复用 RBAC 权限与 Admin 系统管理 UI 模式

---

## Task 1: 数据模型与 shared-types

- [x] 1.1 `SysDictTypeEntity`、`SysDictDataEntity` + 导出 — 验证：TypeORM 建表
- [x] 1.2 shared-types dict DTO/列表项 — 验证：编译 + vitest（可选）

## Task 2: Server 字典 API

- [ ] 2.1 DictType CRUD + 权限 — 验证：e2e 类型增删改查、code 重复 400
- [ ] 2.2 DictData CRUD + by-type — 验证：e2e 项 CRUD、by-type 仅启用项
- [ ] 2.3 删除类型约束、Member 403 — 验证：e2e 边界

## Task 3: Seed

- [ ] 3.1 permissions + 菜单 + 示例字典 — 验证：`pnpm seed` + seed 测试

## Task 4: Admin 字典 UI

- [ ] 4.1 `api/dict.ts` + `useDict` — 验证：类型编译
- [ ] 4.2 字典管理主从页 — 验证：dev smoke CRUD
- [ ] 4.3 v-permission 与动态菜单 — 验证：菜单可见、按钮受控

## Task 5: 集成验证

- [ ] 5.1 server test + e2e、admin build — 验证：全绿
- [ ] 5.2 openspec validate system-dict --strict — 验证：通过
