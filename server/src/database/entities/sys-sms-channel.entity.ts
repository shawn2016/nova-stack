import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_sms_channel')
export class SysSmsChannelEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  provider!: string;

  @Column({ type: 'text' })
  config!: string;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
