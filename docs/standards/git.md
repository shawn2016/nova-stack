# Git

## 新需求分支（MUST — 项目约定）

**不要询问用户用什么分支**；每个新需求 Agent 自行建分支并执行全流程。

| 规则 | 说明 |
|------|------|
| 基线 | 从 `main` 拉分支（先 `git fetch` / `git pull` 若远程有更新且安全） |
| 工作方式 | **仅在主仓库目录**开发；**禁止** `git worktree` |
| Comet change | 分支名 **`comet/<change-name>`**，与 change 名一致 |
| 非 Comet 需求 | **`feat/<简短-kebab>`** 或 **`fix/<简短-kebab>`**（英文/拼音，见名知意） |
| 切换 | 新需求开始前：`git checkout main` → `git pull`（可选）→ `git checkout -b <分支>` |

示例：

```bash
git checkout main
git checkout -b comet/system-file-settings
# 或
git checkout -b feat/admin-export-users
```

## 归档与合并（MUST — 项目约定）

Comet Archive 或功能完成后：

1. 在当前分支完成 **archive commit**（含 OpenSpec 归档等）
2. **合并到 `main`**（本地 merge，不询问是否 merge）
3. **不要**为归档再向用户确认分支策略
4. `git push` / 开 PR：**仅在被用户明确要求时**

```bash
git checkout main
git merge comet/<change-name>   # 或 feat/xxx
# 合并后可选：git branch -d comet/<change-name>
```

Archive 时 Comet Skill 若提供 push/PR 选项：**默认选本地 archive + merge 到 main**；不选 worktree、不选「仅留 bound 分支不合并」。

## Commit（MUST）

- 中文：`<type>: <简述>`
- type：`feat` | `fix` | `chore` | `refactor` | `test` | `docs`
- 仅在被要求时 commit / push / PR

## MUST NOT

- 提交 `.env`、密钥
- 使用 `git worktree` 做新需求
- 每个新需求询问「用什么分支」
- 未经用户要求 `--no-verify`、force push `main`

PR（若用户要求）：Summary + Test plan。
