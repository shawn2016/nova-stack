import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_sms_template')
@Index(['code'], { unique: true })
export class SysSmsTemplateEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'bigint', name: 'channel_id' })
  channelId!: string;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
