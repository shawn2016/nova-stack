# Comet Design Handoff

- Change: system-dict
- Phase: design
- Mode: compact
- Context hash: 4ef013737dda1a488e7349775bcae1aeafd880aae60077fa6f5e071e8449f728

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/system-dict/proposal.md

- Source: openspec/changes/system-dict/proposal.md
- Lines: 1-35
- SHA256: 5afc0f30be1d4a0374e00ee95d0255856e0a702e76bac3306913baec6f6cd062

```md
## Why

脚手架后台基座已具备 RBAC、个人中心与文件上传，但缺少**系统字典**能力。业务表单（用户状态、文章状态等）无法复用统一的下拉数据源，后续站点配置与审计模块也依赖可维护的枚举/标签映射。这是 `scaffold-system-base` 批次第 2 项，需在站点配置与审计前补齐。

## What Changes

- **Server — 字典类型与字典项**：新增 `sys_dict_type`、`sys_dict_data` 实体与 CRUD API；按类型编码查询字典项（供下拉复用）
- **Server — RBAC 扩展**：字典管理相关 permission 码与 seed 菜单
- **shared-types**：字典 DTO 与列表项类型
- **Admin — 字典管理页**：字典类型 CRUD + 字典项 CRUD（主从/分栏），对接 API
- **Admin — 下拉复用**：提供 `useDict(typeCode)` 或等价 composable，从 API 加载选项

## Capabilities

### New Capabilities

- `dict-api`: 字典类型与字典项 CRUD、按类型编码查询
- `dict-admin-ui`: Admin 字典管理页面与下拉复用 composable

### Modified Capabilities

- （无）— 不修改现有 auth/rbac 行为，仅新增权限 seed

## Impact

- **主要影响**：`server/src/modules/dict/`（新建）、`server/src/database/entities/`、`admin/src/views/system/dict/`、`packages/shared-types/`
- **seed**：新增字典 permissions、系统管理下「字典管理」菜单、示例字典类型（可选）
- **不影响**：uni-app、Member 端、站点配置、审计日志（后续 change）

## Non-Goals

- 站点系统配置 KV（`site-config` change）
- 登录/操作审计（`audit-logs` change）
- 字典缓存到 Redis、国际化多语言字典、树形字典
- Member 端字典 API

```

## openspec/changes/system-dict/design.md

- Source: openspec/changes/system-dict/design.md
- Lines: 1-90
- SHA256: 3b5066d83e2fea13c6fc9510f66a809ae834765df2970680baa772cdb380ed55

[TRUNCATED]

```md
## Context

批次 `scaffold-system-base` 第 2 项。现有 RBAC 模块（用户/角色/菜单）与 Admin 系统管理 UI 模式已稳定，可复用 `useTable`、对话框、权限码与 seed 结构。项目尚无字典表与 API。

## Goals / Non-Goals

**Goals:**
- 字典类型（type）与字典项（data）完整 CRUD
- Admin 管理页：类型列表 + 选中类型下的字典项管理
- 按 `typeCode` 查询字典项 API，供 Admin 表单下拉复用
- RBAC 权限与动态菜单 seed

**Non-Goals:**
- 站点配置、审计、uni-app
- Redis 缓存、i18n、树形字典、批量导入导出

## Decisions

### 1. 数据模型

**选择**：两张表 `sys_dict_type`、`sys_dict_data`

| 表 | 关键字段 |
|----|----------|
| `sys_dict_type` | `name`, `code`（唯一）, `status`, `remark` |
| `sys_dict_data` | `type_id`（FK）, `label`, `value`, `sort`, `status`, `remark` |

**理由**：经典字典模型，与若依/ruoyi 等后台惯例一致，便于 Admin 主从 UI

**约束**：同一 `type_id` 下 `value` 唯一；`code` 全局唯一

### 2. API 设计

```
# 字典类型（Admin + RequirePermission）
GET    /dict/types          — 分页列表
POST   /dict/types
PUT    /dict/types/:id
DELETE /dict/types/:id

# 字典项
GET    /dict/data           — 分页，query: typeId | typeCode
POST   /dict/data
PUT    /dict/data/:id
DELETE /dict/data/:id

# 下拉复用（Admin JWT，无需 list 权限也可读？→ 需 system:dict:data:list 或专用 dict:read）
GET    /dict/data/by-type/:code  — 返回 [{ label, value, sort }] 仅启用项
```

**权限码**：
- `system:dict:type:list|create|update|delete`
- `system:dict:data:list|create|update|delete`

**备选**：合并为单资源 `/dict/*` — 拒绝，类型与项生命周期不同

### 3. Admin UI

- 路由：`/system/dict`，组件 `views/system/dict/index`
- 布局：左侧类型表格 + 右侧选中类型的字典项表格（参考常见后台字典页）
- Composable：`useDict(typeCode)` → 调用 `by-type` API，返回 `ref<DictOption[]>`
- 权限：`v-permission` 控制增删改按钮

### 4. Seed

- permissions + 菜单「字典管理」挂到「系统管理」目录（sort 4）
- 可选示例：`user_status`（启用/禁用）、`article_status`（草稿/已发布）— 便于 smoke

### 5. 模块位置

- `server/src/modules/dict/` — DictModule，注册到 AppModule
- 遵循现有 RBAC controller/service/dto 分层

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 字典变更后前端缓存 stale | MVP 无缓存；`useDict` 每次 mount 拉取 |
| 删除类型级联 | 删除类型前检查是否有字典项，有则 400 |
| typeCode 被业务硬编码 | seed 示例 + 文档说明 |

```

Full source: openspec/changes/system-dict/design.md

## openspec/changes/system-dict/tasks.md

- Source: openspec/changes/system-dict/tasks.md
- Lines: 1-21
- SHA256: 94caea88598b37437992eca9f34abfe3a96710ec2a1cce68b5ea728740aa8f8d

```md
## 1. 数据模型与 shared-types

- [ ] 1.1 `sys_dict_type`、`sys_dict_data` 实体 + migration/sync — 验证：TypeORM 可建表
- [ ] 1.2 shared-types 字典 DTO/列表项 — 验证：编译通过

## 2. Server 字典 API

- [ ] 2.1 DictModule：类型 CRUD + 权限装饰器 — 验证：e2e 类型增删改查
- [ ] 2.2 字典项 CRUD + by-type 查询 — 验证：e2e 项 CRUD 与 by-type 返回启用项
- [ ] 2.3 seed：permissions、菜单、示例字典 — 验证：`pnpm seed` + seed 测试通过

## 3. Admin 字典管理 UI

- [ ] 3.1 API 层 + `useDict` composable — 验证：类型编译
- [ ] 3.2 字典管理页（类型 + 项主从） — 验证：dev smoke CRUD
- [ ] 3.3 权限按钮与动态菜单 — 验证：无权限隐藏按钮、菜单可见

## 4. 集成验证

- [ ] 4.1 server test + e2e、admin build — 验证：全绿
- [ ] 4.2 openspec validate system-dict --strict — 验证：通过

```

## openspec/changes/system-dict/specs/dict-admin-ui/spec.md

- Source: openspec/changes/system-dict/specs/dict-admin-ui/spec.md
- Lines: 1-19
- SHA256: 3b66feb0fcbe9f857d91104048fdddf34e36362c0a27fd4da36cb69ecfa8ab46

```md
## ADDED Requirements

### Requirement: 字典管理页
Admin MUST 提供字典管理页：字典类型列表与选中类型下的字典项列表，对接 dict API；操作受 `system:dict:*` 权限控制。

#### Scenario: 类型与项联动
- **WHEN** 管理员选中某字典类型
- **THEN** 右侧展示该类型下的字典项表格

#### Scenario: 新增字典项
- **WHEN** 有 `system:dict:data:create` 并提交 label/value
- **THEN** 调用 POST 成功并刷新项列表

### Requirement: 字典下拉复用
Admin MUST 提供 composable（如 `useDict(typeCode)`），从 `GET /dict/data/by-type/:code` 加载选项供 ElSelect 使用。

#### Scenario: 表单下拉
- **WHEN** 某页面调用 `useDict('user_status')`
- **THEN** 获得响应式选项列表，可用于 ElSelect options

```

## openspec/changes/system-dict/specs/dict-api/spec.md

- Source: openspec/changes/system-dict/specs/dict-api/spec.md
- Lines: 1-38
- SHA256: 6fde8998d1bbbbf2083ce2fcd6789ed751d780337133cbfb58cd491e5701f192

```md
## ADDED Requirements

### Requirement: 字典类型 CRUD
系统 MUST 提供字典类型的 list/create/update/delete API，需 Admin JWT 与对应 `@RequirePermission`。

#### Scenario: 创建字典类型
- **WHEN** 有 `system:dict:type:create` 权限 POST 合法类型（name、唯一 code）
- **THEN** 返回 201 及新类型 id

#### Scenario: 类型 code 重复
- **WHEN** POST 的 code 已存在
- **THEN** 返回 400，不创建

#### Scenario: 删除有关联项的类型
- **WHEN** 类型下仍有字典项时 DELETE
- **THEN** 返回 400，不删除

### Requirement: 字典项 CRUD
系统 MUST 提供字典项的 list/create/update/delete，支持按 typeId 或 typeCode 筛选。

#### Scenario: 按类型查询字典项
- **WHEN** GET `/dict/data?typeCode=user_status`
- **THEN** 返回该类型下字典项分页列表

#### Scenario: 同类型 value 唯一
- **WHEN** 同一 type 下 value 重复提交
- **THEN** 返回 400

### Requirement: 按类型编码读取启用项
系统 MUST 提供 `GET /dict/data/by-type/:code`，返回指定类型下 status=启用 的字典项，按 sort 升序。

#### Scenario: 下拉数据源
- **WHEN** Admin 请求 `GET /dict/data/by-type/user_status`
- **THEN** 返回 `[{ label, value, sort }]`，不含禁用项

#### Scenario: 未知类型
- **WHEN** code 不存在
- **THEN** 返回 404 或空数组（实现统一为 404）

```
