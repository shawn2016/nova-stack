---
comet_change: system-data-scope
role: technical-design
canonical_spec: openspec
status: draft
---

# system-data-scope 深度技术设计

## 1. 架构

```
RoleController ──dataScope/customDeptIds──► RoleService ──► sys_role + sys_role_dept
UserController.list ──► UserService ──► DataScopeService.applyUserFilter()
DataScopeService ──► DeptService（子部门展开）
```

## 2. 实体

### sys_role 扩展
```typescript
@Column({ type: 'tinyint', name: 'data_scope', default: 1 })
dataScope!: number;
```

### sys_role_dept
```typescript
@Entity('sys_role_dept')
export class SysRoleDeptEntity {
  @PrimaryColumn({ type: 'bigint', name: 'role_id' }) roleId!: string;
  @PrimaryColumn({ type: 'bigint', name: 'dept_id' }) deptId!: string;
}
```

## 3. shared-types

```typescript
export type DataScope = 1 | 2 | 3 | 4 | 5;
// CreateRoleDto/UpdateRoleDto/SysRoleDetail 增加 dataScope?, customDeptIds?
```

## 4. DataScopeService

- `resolveForUser(userId): { mode: 'all' | 'self' | 'depts', deptIds?: string[] }`
- `applyUserFilter(qb, alias, userId)` — 对 user 表 qb 追加条件
- 读 `data_scope.module.enabled`，false 时等同 ALL

## 5. RoleService 变更

- create/update 保存 dataScope + 重建 sys_role_dept
- toDetail 返回 customDeptIds

## 6. UserService.list

- 注入 DataScopeService，list 前 applyUserFilter

## 7. Admin

- role-edit-dialog：dataScope select + dept tree multi（v-if dataScope===2）

## 8. 测试

- e2e: 创建 DEPT/SELF 角色用户，验证 list 过滤
- e2e: CUSTOM 角色 + customDeptIds
- seed: super_admin dataScope=1
