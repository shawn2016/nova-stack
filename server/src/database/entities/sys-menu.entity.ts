import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_menu')
export class SysMenuEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  /** 父菜单 ID；0=根节点 */
  @Column({ type: 'bigint', name: 'parent_id', default: 0, comment: '父菜单ID' })
  parentId!: string;

  @Column({ type: 'varchar', length: 64, comment: '菜单名称' })
  name!: string;

  /** 路由路径；null=无 */
  @Column({ type: 'varchar', length: 256, nullable: true, comment: '路由路径' })
  path!: string | null;

  /** Vue 组件路径；null=无 */
  @Column({ type: 'varchar', length: 256, nullable: true, comment: '组件路径' })
  component!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true, comment: '图标' })
  icon!: string | null;

  /** 类型：menu=菜单项等，见 seed */
  @Column({ type: 'varchar', length: 16, comment: '菜单类型' })
  type!: string;

  /** 关联权限码；null=不绑定 API 权限 */
  @Column({
    type: 'varchar',
    length: 128,
    name: 'permission_code',
    nullable: true,
    comment: '权限码',
  })
  permissionCode!: string | null;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort!: number;

  /** 是否可见：1=是，0=否 */
  @Column({ type: 'tinyint', default: 1, comment: '是否可见：1是 0否' })
  visible!: number;

  /** 状态：1=启用，0=禁用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
  status!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;
}
