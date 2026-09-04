/**
 * Entity 字段备注标杆片段（规范示例，非运行时代码）
 *
 * 复制到真实 Entity 时删除本文件顶部的说明块。
 */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_example')
export class SysExampleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  /** 状态：1=启用，0=禁用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
  status!: number;

  /** 部门 ID；null=未绑定 */
  @Column({ type: 'bigint', name: 'dept_id', nullable: true, comment: '部门ID' })
  deptId!: string | null;
}
