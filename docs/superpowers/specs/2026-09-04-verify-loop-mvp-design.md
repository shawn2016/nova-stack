---
comet_change: verify-loop-mvp
role: technical-design
canonical_spec: openspec
---

# verify-loop-mvp 深度技术设计

## 1. 架构总览

```
开发者
  │
  ├─ pnpm verify:hub ──► Verify Hub (:9470)
  │                         ├─ POST /api/runs
  │                         ├─ GET  /api/runs, /api/stats
  │                         └─ Web Dashboard（复制 AI 包）
  │
  └─ pnpm verify ──► scripts/verify.mjs
                       ├─ tier: static
                       ├─ tier: api-e2e
                       └─ tier: browser-smoke（可 SKIP）
                            │
                            └── POST verify-report.v1 ──► Hub
```

**实施顺序**：Hub 服务 → Runner 脚本 → 根 scripts → Playwright smoke → 文档与闭环演示

## 2. verify-report.v1

```typescript
interface VerifyReport {
  schema: 'nova.verify-report.v1';
  runId: string;
  project: string;
  startedAt: string;
  finishedAt: string;
  git: { branch: string; commit: string; dirty: boolean };
  summary: { total: number; passed: number; failed: number; skipped: number };
  tiers: Array<{
    id: string;
    status: 'pass' | 'fail' | 'skip';
    durationMs: number;
    command: string;
  }>;
  cases: Array<{
    id: string;
    tierId: string;
    module: string;
    title: string;
    status: 'pass' | 'fail' | 'skip';
    durationMs: number;
    error?: { message: string; stack?: string };
    retestCommand: string;
    suggestedFiles?: string[];
  }>;
}
```

Hub 对 `runId` 幂等 upsert；Runner 本地备份 `.verify/reports/<runId>.json`。

## 3. Verify Hub（`tools/verify-hub`）

| 端点 | 说明 |
|------|------|
| POST /api/runs | 接入报告，Header `X-Verify-Token` |
| GET /api/runs?limit=20 | 列表 |
| GET /api/runs/:id | 详情 + AI bundles |
| GET /api/stats | 通过率、平均耗时、失败 module Top |

存储：`better-sqlite3`，表 `runs`（id, project, status, report_json, started_at, duration_ms）。

UI：单页静态 HTML（无构建链），展示 run 列表、详情、复制 AI Markdown。

AI Fix Bundle 模板含：runId、tier、case、error、retestCommand、suggestedFiles、AGENTS.md 路径。

## 4. Verify Runner

`.verify/config.yaml`：

```yaml
project: nova-stack
hub:
  url: http://localhost:9470
  token: dev-local-token
tiers:
  - id: static
    command: pnpm run verify:tier:static
  - id: api-e2e
    command: pnpm run verify:tier:api-e2e
  - id: browser-smoke
    command: pnpm run verify:tier:browser-smoke
    skipEnv: VERIFY_SKIP_BROWSER
```

`scripts/verify.mjs`：解析 `--tier`；顺序执行 tier；Jest 以 tier 级 case 汇总；Playwright 解析 JSON reporter 输出。

## 5. MVP Smoke

`e2e/playwright.config.ts` + `e2e/specs/smoke/login.spec.ts`：

- 访问 admin 登录页，填 admin/admin123，断言 URL 离开 `/auth/login`
- `webServer` 暂不自动起服务（文档要求先 `pnpm dev`）；本地闭环先跑 static + api-e2e，browser 可选

## 6. 根 scripts

```json
"verify": "node scripts/verify.mjs",
"verify:hub": "pnpm --filter @nova/verify-hub dev",
"verify:tier:static": "...",
"verify:tier:api-e2e": "pnpm --filter @nova/server test:e2e",
"verify:tier:browser-smoke": "pnpm exec playwright test -c e2e/playwright.config.ts"
```

## 7. 验收

1. `pnpm verify:hub` → Dashboard 可访问
2. `pnpm verify` → Hub 出现 run，static + api-e2e 有结果
3. 故意失败 → 复制 AI 包
4. `pnpm verify --tier api-e2e` 复测
