## MODIFIED Requirements

### Requirement: 共享代码规范配置
系统 MUST 在根目录提供 eslint 与 prettier 配置，各子包 MUST 继承或引用根配置；**server 与 shared-types MUST 可执行 lint**。**人类与 Agent 写码规范 MUST 以 `docs/standards/README.md` 为索引，`docs/standards/ai-checklist.md` 为完成前自检清单。**

#### Scenario: 根级 lint 命令
- **WHEN** 开发者在根目录执行 lint 脚本
- **THEN** server 与 shared-types 代码规范检查可执行

#### Scenario: Agent 写码前查规范
- **WHEN** Agent 在本仓库新增或修改业务代码
- **THEN** 应遵循 `docs/standards/` 中对应专题与 ai-checklist 自检项
