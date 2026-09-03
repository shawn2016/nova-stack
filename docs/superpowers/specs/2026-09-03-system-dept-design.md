---
comet_change: system-dept
role: technical-design
canonical_spec: openspec
status: draft
---

# system-dept 深度技术设计

## 1. 背景

批次第 3 项：部门组织架构 + 模块功能开关。参考 `system-region` 树形 CRUD 与 `site-config` 键值配置模式。

## 2. 架构概览

```
Admin (/system/dept, /system/user)
    ↓ HTTP
DeptModule (/depts/*)  ←→  sys_dept
    ↓                      sys_config (dept group)
UserModule (/users/*)  ←→  sys_user.dept_id
```

## 3. 实体设计

### sys_dept

```typescript
@Entity('sys_dept')
export class SysDeptEntity {
  id: string;           // bigint PK
  parentId: string | null;
  name: string;
  sort: number;         // default 0
  leader: string | null;
  phone: string | null;
  status: number;       // 0|1
  createdAt: Date;
  updatedAt: Date;
}
```

### sys_user 扩展

```typescript
@Column({ type: 'bigint', name: 'dept_id', nullable: true })
deptId!: string | null;
```

## 4. API 详细设计

### DeptController

| Method | Path | Permission | 说明 |
|--------|------|------------|------|
| GET | /depts/tree | login | 启用树 |
| GET | /depts/tree/all | system:dept:list | 完整树 |
| GET | /depts | system:dept:list | 分页 |
| POST | /depts | system:dept:create | 创建 |
| PUT | /depts/:id | system:dept:update | 更新 |
| DELETE | /depts/:id | system:dept:delete | 删除 |
| PUT | /depts/:id/status | system:dept:update | 状态 |
| GET | /depts/settings | system:dept:list | 功能开关 |
| PUT | /depts/settings | system:dept:settings | 更新开关 |

### DeptService 核心逻辑

- `assertModuleEnabled()` — 读 config `dept.module.enabled`
- `buildTree(items, enabledOnly)` — 复用 region 模式
- `remove(id)` — 检查 children count + user count
- `updateStatus(id, status)` — 单字段更新
- `getSettings()` / `updateSettings(dto)` — 读写 sys_config

### UserService 扩展

- create/update: 若 dto.deptId 有值，校验部门存在且 status=1；若 `dept.user_binding.enabled=false` 则拒绝
- toListItem/toDetail: leftJoin dept 取 deptName

## 5. shared-types

```typescript
// packages/shared-types/src/dept.ts
export interface DeptListItem { id, parentId, name, sort, leader, phone, status, createdAt }
export interface DeptTreeNode extends DeptListItem { children?: DeptTreeNode[] }
export interface DeptSettings { moduleEnabled: boolean; userBindingEnabled: boolean }
export interface UpdateDeptSettingsDto { moduleEnabled?: boolean; userBindingEnabled?: boolean }
```

扩展 `SysUserListItem` / `SysUserDetail` / CreateUserDto / UpdateUserDto 增加 `deptId?`, `deptName?`.

## 6. Seed

**Permissions** (+5):
- system:dept:list, create, update, delete, settings

**Menu**: 部门管理 sort=8，站点配置→9，审计→10

**Depts**:
- 总公司 (root)
  - 研发部
  - 运营部

**Config**:
- dept.module.enabled = true
- dept.user_binding.enabled = true

**Users**: admin → 总公司

## 7. Admin UI

### dept/index.vue
- 参考 region/index.vue 树形 ArtTable
- 状态列 ElSwitch → PUT status
- 顶部「功能开关」ElDialog：两个 switch + 保存

### user 模块
- dialog 增加 ElTreeSelect dept
- 表格列 deptName

## 8. 测试策略

- e2e: dept CRUD、删除约束、status、settings、module disabled 403
- e2e: user create/update with deptId、停用部门 400
- seed.spec: permission count + menu
- shared-types dept.test.ts

## 9. 文件清单

| 路径 | 操作 |
|------|------|
| server/src/database/entities/sys-dept.entity.ts | 新建 |
| server/src/modules/dept/* | 新建 |
| server/src/modules/rbac/user/* | 修改 |
| server/test/dept/dept.e2e-spec.ts | 新建 |
| packages/shared-types/src/dept.ts | 新建 |
| admin/src/api/dept.ts | 新建 |
| admin/src/views/system/dept/* | 新建 |
| admin/src/views/system/user/* | 修改 |
