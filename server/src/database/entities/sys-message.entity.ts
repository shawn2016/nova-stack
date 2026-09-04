import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_message')
export class SysMessageEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'bigint', name: 'sender_id', comment: '发送者用户ID' })
  senderId!: string;

  @Column({ type: 'bigint', name: 'receiver_id', comment: '接收者用户ID' })
  receiverId!: string;

  @Column({ type: 'varchar', length: 128, comment: '消息标题' })
  title!: string;

  @Column({ type: 'text', comment: '消息内容' })
  content!: string;

  /** 已读：1=已读，0=未读 */
  @Column({ type: 'tinyint', name: 'is_read', default: 0, comment: '已读：1已读 0未读' })
  isRead!: number;

  /** 阅读时间；null=未读 */
  @Column({ type: 'datetime', name: 'read_at', nullable: true, comment: '阅读时间' })
  readAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;
}
