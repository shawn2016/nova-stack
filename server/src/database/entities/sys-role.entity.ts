import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_role')
@Unique(['code'])
export class SysRoleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'varchar', length: 64, comment: '角色名称' })
  name!: string;

  @Column({ type: 'varchar', length: 64, comment: '角色编码' })
  code!: string;

  /** 状态：1=启用，0=禁用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
  status!: number;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort!: number;

  /** 数据权限：1全部 2自定义 3本部门 4本部门及以下 5仅本人 */
  @Column({
    type: 'tinyint',
    name: 'data_scope',
    default: 1,
    comment: '数据权限：1全部 2自定义 3本部门 4本部门及以下 5仅本人',
  })
  dataScope!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
