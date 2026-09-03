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
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 64, name: 'config_key' })
  configKey!: string;

  @Column({ type: 'varchar', length: 64, name: 'config_name' })
  configName!: string;

  @Column({ type: 'text', name: 'config_value' })
  configValue!: string;

  @Column({ type: 'varchar', length: 32, name: 'config_group', nullable: true })
  configGroup!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
