import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_message')
export class SysMessageEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', name: 'sender_id' })
  senderId!: string;

  @Column({ type: 'bigint', name: 'receiver_id' })
  receiverId!: string;

  @Column({ type: 'varchar', length: 128 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'tinyint', name: 'is_read', default: 0 })
  isRead!: number;

  @Column({ type: 'datetime', name: 'read_at', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;
}
