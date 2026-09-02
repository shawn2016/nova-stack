import { Entity, PrimaryColumn } from 'typeorm';

@Entity('sys_user_role')
export class SysUserRoleEntity {
  @PrimaryColumn({ type: 'bigint', name: 'user_id' })
  userId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'role_id' })
  roleId!: string;
}
