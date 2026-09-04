import { Entity, PrimaryColumn } from 'typeorm';

/** 角色-权限关联 */
@Entity('sys_role_permission')
export class SysRolePermissionEntity {
  @PrimaryColumn({ type: 'bigint', name: 'role_id', comment: '角色ID' })
  roleId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'permission_id', comment: '权限ID' })
  permissionId!: string;
}
