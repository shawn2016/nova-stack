import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sys_notice_read')
export class SysNoticeReadEntity {
  @PrimaryColumn({ type: 'bigint', name: 'notice_id' })
  noticeId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'user_id' })
  userId!: string;

  @Column({ type: 'datetime', name: 'read_at' })
  readAt!: Date;
}
