import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_ip_blacklist')
export class SysIpBlacklistEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'varchar', length: 64, unique: true, comment: 'IPv4 地址' })
  ip!: string;

  /** 来源：manual=手动，auto=自动封禁 */
  @Column({ type: 'varchar', length: 16, comment: '来源：manual/auto' })
  source!: 'manual' | 'auto';

  /** 状态：1=启用，0=停用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0停用' })
  status!: number;

  /** 过期时间；null 表示永久封禁 */
  @Column({
    type: 'datetime',
    name: 'expires_at',
    nullable: true,
    comment: '过期时间，null=永久',
  })
  expiresAt!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark!: string | null;

  /** 手动封禁操作人；自动封禁为 null */
  @Column({
    type: 'bigint',
    name: 'created_by',
    nullable: true,
    comment: '创建人 userId',
  })
  createdBy!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
