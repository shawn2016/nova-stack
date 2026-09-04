---
change: verify-loop-mvp
design-doc: docs/superpowers/specs/2026-09-04-verify-loop-mvp-design.md
base-ref: cff02908fc090a65eb885a01362fc3620ee209e3
---

# verify-loop-mvp 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 一条命令 `pnpm verify` + 独立 Hub Dashboard，完成最小验证闭环。

**Architecture:** Fastify Hub + SQLite；Node ESM Runner；Playwright smoke 可选。

**Tech Stack:** Fastify, better-sqlite3, Playwright, yaml

---

### Task 1: Verify Hub 包与 API

**Files:**
- Create: `tools/verify-hub/package.json`
- Create: `tools/verify-hub/src/server.ts`
- Create: `tools/verify-hub/src/db.ts`
- Create: `tools/verify-hub/public/index.html`

**Step 1:** 脚手架 `@nova/verify-hub`，实现 ingest/list/detail/stats API  
**Step 2:** 静态 Dashboard + 复制 AI 包  
**Step 3:** `pnpm verify:hub` 可启动

### Task 2: Runner 与配置

**Files:**
- Create: `.verify/config.yaml`
- Create: `.verify/schema.json`
- Create: `scripts/verify.mjs`

**Step 1:** config + schema  
**Step 2:** verify.mjs 跑 tier、生成报告、POST Hub  
**Step 3:** 根 package.json scripts

### Task 3: Playwright smoke（可选 tier）

**Files:**
- Create: `e2e/playwright.config.ts`
- Create: `e2e/specs/smoke/login.spec.ts`

### Task 4: 文档

**Files:**
- Create: `docs/standards/verify.md`

### Task 5: 闭环验证

- `pnpm verify:hub` + `pnpm verify`
- 更新 tasks.md 勾选
