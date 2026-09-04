import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('sys_permission')
@Unique(['code'])
export class SysPermissionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'varchar', length: 64, comment: '权限名称' })
  name!: string;

  @Column({ type: 'varchar', length: 128, comment: '权限码' })
  code!: string;

  /** 类型：api=接口权限等 */
  @Column({ type: 'varchar', length: 16, comment: '权限类型' })
  type!: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;
}
