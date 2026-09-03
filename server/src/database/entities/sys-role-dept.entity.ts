import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sys_role_dept')
export class SysRoleDeptEntity {
  @PrimaryColumn({ type: 'bigint', name: 'role_id' })
  roleId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'dept_id' })
  deptId!: string;
}
