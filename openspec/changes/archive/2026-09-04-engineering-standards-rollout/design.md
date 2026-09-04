## 目标

1. 规范文档可执行、可自检、与 Comet Verify 打通
2. 主仓 Entity 与 `database.md` 对齐，作为 AI 可复制标杆

## 非目标

- 不改 Admin 页面结构（除后续独立 change）
- 不补全 main 上尚未 merge 的模块 Entity（dept/file/sms 等在其他分支）
- 不新增 ESLint 规则

## 存量策略

- **新改代码**：必须符合 `docs/standards/ai-checklist.md`
- **存量代码**：触到时顺手补备注；不为此 change 做全仓 Admin 重构

## Entity 备注规则（实施）

- 状态字段：`1=启用 0=禁用`（或文档定义）
- 可空外键：注明 null 语义
- `@PrimaryGeneratedColumn` / 时间戳：加 `comment` 即可

## 验证

- `pnpm lint`
- `pnpm --filter @nova/server test`
- 人工核对 Entity 含 comment
