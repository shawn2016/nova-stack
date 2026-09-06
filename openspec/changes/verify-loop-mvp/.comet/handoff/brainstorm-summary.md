# Brainstorm Summary

- Change: verify-loop-mvp
- Date: 2026-09-04

## Confirmed Technical Approach

- Runner（项目内 `scripts/verify.mjs` + `.verify/config.yaml`）按 tier 执行命令，聚合 verify-report.v1 并 POST Hub
- Hub（`tools/verify-hub/`）独立 Fastify + SQLite + 静态 Web UI，端口 9470
- 一条命令 `pnpm verify`；Hub 启动 `pnpm verify:hub`
- MVP Tier-1：static、api-e2e、browser-smoke（1 条登录 smoke）
- 失败 case 生成 AI Fix Bundle Markdown，Dashboard 一键复制

## Key Trade-offs and Risks

- 浏览器 smoke 依赖 MySQL/seed，本地可通过 `VERIFY_SKIP_BROWSER=1` 跳过
- SQLite 单用户本地存储，后续可换 Postgres
- Jest/Playwright 输出经适配层转为统一 cases

## Testing Strategy

- Hub API 手工 + Runner 集成跑通闭环
- `pnpm verify` 全绿/故意失败/ `--tier` 复测
- 保留现有 server test:e2e 作为 api-e2e tier

## Spec Patches

无
