import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_config')
@Unique(['configKey'])
export class SysConfigEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'varchar', length: 64, name: 'config_key', comment: '配置键' })
  configKey!: string;

  @Column({ type: 'varchar', length: 64, name: 'config_name', comment: '配置名称' })
  configName!: string;

  @Column({ type: 'text', name: 'config_value', comment: '配置值' })
  configValue!: string;

  /** 配置分组；null=未分组 */
  @Column({
    type: 'varchar',
    length: 32,
    name: 'config_group',
    nullable: true,
    comment: '配置分组',
  })
  configGroup!: string | null;

  /** 备注；null=无 */
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
