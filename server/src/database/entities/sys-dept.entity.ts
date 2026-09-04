import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_dept')
export class SysDeptEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  /** 父部门 ID；0=根节点 */
  @Column({ type: 'bigint', name: 'parent_id', default: 0, comment: '父部门ID' })
  parentId!: string;

  @Column({ type: 'varchar', length: 64, comment: '部门名称' })
  name!: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort!: number;

  /** 负责人；null=未设置 */
  @Column({ type: 'varchar', length: 64, nullable: true, comment: '负责人' })
  leader!: string | null;

  /** 联系电话；null=未设置 */
  @Column({ type: 'varchar', length: 32, nullable: true, comment: '联系电话' })
  phone!: string | null;

  /** 状态：1=启用，0=禁用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
  status!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
