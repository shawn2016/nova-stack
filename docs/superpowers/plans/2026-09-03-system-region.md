---
archived-with: 2026-09-03-system-region
status: final
---
# system-region 实施计划

base-ref: 66b253437f149492670b428dc6434b7ae9ffc989
design: docs/superpowers/specs/2026-09-03-system-region-design.md

## Task 1 — 实体与 shared-types

- [ ] 1.1 `SysRegionEntity` + index 导出
- [ ] 1.2 `packages/shared-types/src/region.ts` + export + test

## Task 2 — Server Region API

- [ ] 2.1 RegionModule（service/controller/dto）
- [ ] 2.2 e2e：tree、CRUD、边界

## Task 3 — Seed

- [ ] 3.1 `china-regions.flat.json` + upsert + permissions/menus
- [ ] 3.2 seed.spec 断言

## Task 4 — Admin UI

- [ ] 4.1 `admin/src/api/region.ts`
- [ ] 4.2 `views/system/region/` 树形管理页

## Task 5 — 验证

- [ ] 5.1 test + e2e + admin build
- [ ] 5.2 openspec validate system-region --strict
