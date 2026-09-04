import { Entity, PrimaryColumn } from 'typeorm';

/** 用户-角色关联 */
@Entity('sys_user_role')
export class SysUserRoleEntity {
  @PrimaryColumn({ type: 'bigint', name: 'user_id', comment: '用户ID' })
  userId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'role_id', comment: '角色ID' })
  roleId!: string;
}
