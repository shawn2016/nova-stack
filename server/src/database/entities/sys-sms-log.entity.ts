import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sys_sms_log')
export class SysSmsLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', name: 'channel_id' })
  channelId!: string;

  @Column({ type: 'varchar', length: 64, name: 'template_code' })
  templateCode!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'tinyint' })
  status!: number;

  @Column({ type: 'varchar', length: 500, name: 'provider_message', nullable: true })
  providerMessage!: string | null;

  @Column({ type: 'datetime', name: 'sent_at' })
  sentAt!: Date;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;
}
