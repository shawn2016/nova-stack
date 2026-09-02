import { Entity, PrimaryColumn } from 'typeorm';

@Entity('sys_role_permission')
export class SysRolePermissionEntity {
  @PrimaryColumn({ type: 'bigint', name: 'role_id' })
  roleId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'permission_id' })
  permissionId!: string;
}
