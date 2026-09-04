import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_region')
@Unique(['code'])
export class SysRegionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  /** 父级 ID；0=根节点 */
  @Column({ type: 'bigint', name: 'parent_id', default: 0, comment: '父级ID' })
  parentId!: string;

  @Column({ type: 'varchar', length: 64, comment: '区划名称' })
  name!: string;

  @Column({ type: 'varchar', length: 12, comment: '区划编码' })
  code!: string;

  /** 层级：1=省 2=市 3=区县 */
  @Column({ type: 'tinyint', comment: '层级：1省 2市 3区县' })
  level!: number;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort!: number;

  /** 状态：1=启用，0=禁用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
  status!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
