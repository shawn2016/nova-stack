<comet-ambient-resume>
<!-- 由 Comet 管理。块内内容可能在 comet init/update 时被覆盖回英文模板。 -->
<!-- Contract: comet.resume_probe.v2 -->

## Comet 环境恢复（Ambient Resume）

在本仓库中，当 Comet 工作流可能已激活、且即将开始需要改代码或调查的任务时，先将当前用户请求传给只读探测：`comet resume-probe . --stdin --json`。

- 若用户通过宿主**显式调用** Comet Skill（例如 `@comet`、`/comet`、`@comet-native` 或 `/comet-hotfix`），该显式调用优先于本恢复协议；**不要**运行 resume probe，直接进入所调 Skill。
- 若用户显式调用非 Comet 的 skill 或斜杠命令，任务意图已在调用中明确；**不要**运行 resume probe，直接执行该 skill。
- 若已在 Comet 流程内（包括等待用户回答你在该流程中提出的问题），**不要**运行 resume probe；将选项回复等视为当前 change 的延续，按所选选项继续。
- 仅信任返回的 `workflow`、`skill`、`entrySource`；勿凭项目配置或无 config 兼容回退自行推断或切换工作流。
- 若 probe 返回 `auto_resume`，简要说明选中的活跃 change，并进入 `nextCommand` 中的永久入口；勿将 state 命令当作恢复入口或盲目推进。
- 若 probe 返回 `ask_user`，提一个简短问题并等待。
- 若当前请求未显式调用 Comet Skill，且 probe 返回 `out_of_scope` 或 `none`，**不要**进入 Comet 工作流。
- `out_of_scope` 或 `none` 仅表示**本新请求**不进入 Comet；不会暂停或退出已在进行中的 Comet 流程。
- 若配置或 state 无效且缺少 `nextCommand`，停止并报告原因；勿猜测其他工作流。
- 勿因存在活跃 change 而附带无关工作。Native 入口会检查未提交改动；probe 不会自动归因。
</comet-ambient-resume>

---

# nova-stack Agent 协作与编码规范

**AI 写码主流程**：[`docs/standards/ai-checklist.md`](./docs/standards/ai-checklist.md) → 专题 → 标杆文件 → 写码后勾选。

项目概览：[`CLAUDE.md`](./CLAUDE.md)。细则索引：[`docs/standards/README.md`](./docs/standards/README.md)。

## 项目速览

| 路径 | 说明 |
|------|------|
| `server/` | NestJS API、TypeORM、JWT/RBAC |
| `admin/` | Vue3 Admin |
| `uni-app/` | C 端 |
| `packages/shared-types/` | 三端类型（**改 API 先改这里**） |
| `docs/standards/` | 编码规范 |

```bash
pnpm install && pnpm dev    # 需 .env + MySQL seed
pnpm lint                   # server + shared-types
```

Admin `admin/admin123` · 会员 `13800138000/member123`（seed 后）

---

## 铁律（MUST）

| # | 规则 |
|---|------|
| 1 | 改 API → 先 `@nova/shared-types`，再 server/admin |
| 2 | 新权限 → `@RequirePermission` + `PERMISSION_SEEDS`（+ `MENU_SEEDS` 若有页） |
| 3 | Entity 状态/外键/可空 → JSDoc + `@Column({ comment })` |
| 4 | Admin CRUD → `ArtListPanel` + `useTable` + 独立 `*-dialog.vue` |
| 5 | Admin 写按钮 → `v-permission` 与后端码一致 |
| 6 | 导出 util / 复杂逻辑 → 一行中文 JSDoc |
| 7 | 最小 diff；改前读相邻文件 |
| 8 | 完成前跑 [ai-checklist.md §写码后](./docs/standards/ai-checklist.md#写码后完成前勾选) |

标杆：`admin/src/views/system/user/index.vue`、`user/modules/user-dialog.vue`

---

## Git / 分支（MUST — 勿问用户）

- **新需求**：`git checkout main` → `git checkout -b comet/<change-name>`（或 `feat/` / `fix/`）
- **禁止** `git worktree`；只在主仓库目录开发
- **不要询问**「用什么分支」
- **Archive 完成**：merge 到 `main`；push/PR 仅在被要求时

详见 [`docs/standards/git.md`](./docs/standards/git.md)。

---

## 提交前验证

```bash
pnpm lint
pnpm --filter @nova/shared-types build   # 若改了 shared-types
pnpm --filter @nova/server test          # 若改了 server
pnpm --filter @nova/admin build          # 若改了 admin
```

---

## Comet

`/comet` · `/comet-hotfix` · `/comet-tweak` · `comet status`  
分支：`comet/<change-name>`，**不用 worktree**；Verify 附 [ai-checklist](./docs/standards/ai-checklist.md)；Archive 后 **merge 到 `main`**
