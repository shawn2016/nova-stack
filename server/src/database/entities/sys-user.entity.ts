import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_user')
@Unique(['username'])
export class SysUserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'varchar', length: 64, comment: '登录用户名' })
  username!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash', comment: '密码哈希' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 64, comment: '昵称' })
  nickname!: string;

  /** 头像 URL；null=无头像 */
  @Column({ type: 'varchar', length: 512, nullable: true, comment: '头像URL' })
  avatar!: string | null;

  /** 状态：1=启用，0=禁用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
  status!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
