import { Entity, PrimaryColumn } from 'typeorm';

/** 角色-部门关联（自定义数据权限） */
@Entity('sys_role_dept')
export class SysRoleDeptEntity {
  @PrimaryColumn({ type: 'bigint', name: 'role_id', comment: '角色ID' })
  roleId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'dept_id', comment: '部门ID' })
  deptId!: string;
}
