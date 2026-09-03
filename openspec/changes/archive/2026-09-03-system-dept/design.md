## Context

`system-region`、`system-notice` 已归档；项目具备树形 CRUD（region）、RBAC 用户管理、站点配置（sys_config）模式。见 proposal.md — Why。

## Goals / Non-Goals

**Goals:**
- 多级部门树：CRUD、排序、启用/停用
- 模块功能开关：总开关 + 用户部门绑定开关（sys_config dept 分组）
- 用户可选归属部门；列表/详情展示部门名
- RBAC 权限与菜单 seed

**Non-Goals:**
- 数据权限按部门过滤
- 岗位编制、成本中心
- Member 端部门选择

## Decisions

### 1. 数据模型

**sys_dept**

| 字段 | 说明 |
|------|------|
| id | bigint → API string |
| parent_id | 上级部门，根为 null |
| name | 部门名称 |
| sort | 排序 |
| leader | 负责人姓名（可选） |
| phone | 联系电话（可选） |
| status | `0` 停用 / `1` 启用（节点功能开关） |
| created_at / updated_at | |

**sys_user** 增量：`dept_id` bigint nullable FK → sys_dept.id

**sys_config**（dept 分组 seed）

| config_key | 说明 | 默认 |
|------------|------|------|
| dept.module.enabled | 部门模块总开关 | true |
| dept.user_binding.enabled | 允许用户绑定部门 | true |

### 2. API 设计

**部门**（`/depts`）

```
GET    /depts/tree           — 启用节点树（下拉/选择器）
GET    /depts/tree/all       — 含停用节点的完整树（管理页）
GET    /depts                — 分页平铺列表（keyword, status, parentId）
POST   /depts
PUT    /depts/:id
DELETE /depts/:id            — 有子部门或有关联用户时禁止
PUT    /depts/:id/status     — 切换 status 0/1
GET    /depts/settings       — 模块功能开关
PUT    /depts/settings       — 更新功能开关
```

**用户**（扩展现有 `/users`）

- create/update 接受可选 `deptId`
- list/detail 返回 `deptId`、`deptName`（JOIN 或二次查询）

**权限码**：
- `system:dept:list|create|update|delete|settings`

**模块总开关**：当 `dept.module.enabled=false` 时，除 settings 读/写外 dept CRUD 返回 403；Admin 菜单可隐藏（前端读 settings）。

### 3. Admin UI

- `/system/dept` — 树形表格 + 新增/编辑对话框 + 行内状态开关 + 顶部「功能开关」抽屉/卡片
- 用户管理 — 部门树选择器；列表增加部门列

### 4. Seed

- permissions + 菜单「部门管理」（sort 8，后续菜单顺延）
- 示例部门：总公司 → 研发部、运营部
- admin 用户归属总公司
- dept settings 默认值

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 删除部门有用户 | 删除前校验 user count |
| 停用父部门 | 允许；tree 接口过滤停用节点 |
| 用户 dept 与停用部门 | update 时校验目标部门 status=1 |

## Migration

- TypeORM synchronize 新增 sys_dept 表与 sys_user.dept_id 列
- seed 增量 permissions/menus/depts/settings

## Open Questions

- [ ] 部门 code 字段 — MVP 省略，仅用 name + id
- [ ] 用户单部门 — MVP 单 dept_id，多部门后续 change
