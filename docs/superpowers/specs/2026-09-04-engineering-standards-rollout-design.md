---
comet_change: engineering-standards-rollout
role: technical-design
canonical_spec: openspec
archived-with: 2026-09-04-engineering-standards-rollout
status: final
---

# engineering-standards-rollout — Technical Design

## 1. Goal

将「三层写码规范」（`docs/standards/` + `AGENTS.md` + Cursor rule）落地为可执行文档，并把 **main 分支现有 13 个 Entity** 对齐 `database.md` 字段备注要求，作为 AI 可复制标杆。

## 2. 文档结构

```
docs/standards/
├── README.md              # 场景索引 + 存量策略
├── ai-checklist.md        # 写码前/后自检（Verify 引用）
├── database.md / server.md / admin-ui.md / comments.md / git.md
├── uni-app.md             # C 端简版
└── examples/
    └── entity-fields.example.ts

AGENTS.md                  # 铁律 + 验证命令 + 指向 checklist
.cursor/rules/nova-coding-standards.mdc
```

`CLAUDE.md`：保留 ambient + 项目说明，Agent 协作指向 `ai-checklist.md`。

## 3. Entity 备注规则

- 业务字段：`/** 中文说明 */` + `@Column({ comment: '...' })`
- 状态：`1=启用 0=禁用`（或模块定义）
- 可空外键：JSDoc 注明 null 语义
- 主键/时间戳：至少 `comment`

标杆：`server/src/database/entities/sys-user.entity.ts`、`examples/entity-fields.example.ts`。

## 4. 存量策略

| 范围 | 策略 |
|------|------|
| 本 change 触达文件 | MUST 符合 checklist |
| 未触达存量 | 不强制全仓重构；触到时对齐 |
| 其他分支未 merge 模块 | merge 后再补（dept/file/sms 等） |

## 5. Comet / OpenSpec

- `comet-verify` Skill 增加 §2c 编码规范自检
- OpenSpec delta：`monorepo-workspace` 引用 `docs/standards/`

## 6. 验证

- `pnpm --filter @nova/server test`（Entity spec 覆盖 comment）
- 根 `pnpm lint`：已知 comet hook 脚本噪声，不以全仓 ESLint 为 gate；业务包无新增 lint 脚本

## 7. Git（项目约定）

- 分支 `comet/engineering-standards-rollout`（主仓，无 worktree）
- Archive 后 merge 到 `main`；push 仅用户要求时
