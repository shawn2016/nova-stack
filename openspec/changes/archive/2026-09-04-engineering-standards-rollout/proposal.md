## Why

项目已建立 `docs/standards/` 与 AI 自检流程，但规范文档未闭环（缺存量策略、uni-app、Verify 接入），且 **Entity 无字段备注**，与规范矛盾，AI 易抄错标杆。

## What Changes

- 完善 `docs/standards/`（存量策略、uni-app、Entity 标杆片段、Comet Verify 引用）
- 主仓全部 Entity 补齐 JSDoc + MySQL `comment`（状态/外键/可空优先）
- `comet-verify` Skill 增加编码规范自检节
- OpenSpec `monorepo-workspace` 引用写码规范路径

## Capabilities

### Modified Capabilities

- `monorepo-workspace`：写码规范入口指向 `docs/standards/`

## Impact

- 文档：`docs/standards/`、`AGENTS.md`、`.cursor/rules/`
- 代码：`server/src/database/entities/*.ts`
- Skill：`.agents/skills/comet-verify/SKILL.md`
- 无新 API、无 schema 变更（仅列 comment 元数据）
