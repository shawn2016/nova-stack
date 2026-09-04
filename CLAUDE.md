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

## 项目说明

**nova-stack** 是基于 pnpm monorepo 的全栈多端项目：NestJS 后端 + Vue3 Admin + uni-app C 端，共享类型包 `@nova/shared-types`。

### 目录结构

| 路径 | 包名 | 说明 |
|------|------|------|
| `server/` | `@nova/server` | NestJS API、TypeORM、JWT/RBAC |
| `admin/` | `@nova/admin` | Vue3 + Vite 管理后台 |
| `uni-app/` | `@nova/uni-app` | uni-app H5/小程序 |
| `packages/shared-types/` | `@nova/shared-types` | 三端共享 TypeScript 类型 |
| `openspec/` | — | OpenSpec 规格与变更 |
| `docs/standards/` | — | 编码规范（写码必查） |
| `docs/superpowers/` | — | 设计文档、计划、验证报告 |

### 常用命令

```bash
pnpm install
pnpm dev              # server + admin（predev 自动构建 shared-types）
pnpm dev:all          # server + admin + uni-app H5
pnpm seed             # 初始化 RBAC + 示例数据（需 MySQL）
pnpm --filter @nova/server test
pnpm --filter @nova/server test:e2e
```

各子包环境变量：复制 `server/.env.example`、`admin/.env.example`、`uni-app/.env.example` 为 `.env`。

### 本地开发账号（seed 后）

| 端 | 账号 | 密码 |
|----|------|------|
| Admin | `admin` | `admin123` |
| 会员 | `13800138000` | `member123` |

### Comet 工作流

- 默认工作流：**Classic**（`default_workflow: classic`）
- 入口：`/comet` → 解析后进入 `/comet-classic`
- 其他：`/comet-hotfix`（快速修复）、`/comet-tweak`（小改动）
- 产物语言：项目级 `language: zh-CN`；Classic 子配置 `classic.language` 见 `.comet/config.yaml`
- 状态查询：`comet status`、`comet dashboard`

### Agent 协作约定

- **AI 写码流程**：[`docs/standards/ai-checklist.md`](./docs/standards/ai-checklist.md) → [`AGENTS.md`](./AGENTS.md)
- **新需求分支**：从 `main` 自动建分支，禁止 worktree，不问分支名；归档 merge 到 `main`（[`docs/standards/git.md`](./docs/standards/git.md)）
- **与用户沟通使用简体中文**
- **commit message 使用中文**，格式见 [`docs/standards/git.md`](./docs/standards/git.md)
- 仅在被要求时 commit / push / PR
- 修改前先读周边代码；避免过度工程
- `server` 开发若 `nest start --watch` 报 `dist/main` 缺失：`rm -f server/*.tsbuildinfo && pnpm --filter @nova/server build`
