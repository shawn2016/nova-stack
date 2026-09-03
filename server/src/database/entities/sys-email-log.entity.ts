import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sys_email_log')
export class SysEmailLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', name: 'channel_id' })
  channelId!: string;

  @Column({ type: 'varchar', length: 64, name: 'template_code' })
  templateCode!: string;

  @Column({ type: 'varchar', length: 128, name: 'to' })
  to!: string;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

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
