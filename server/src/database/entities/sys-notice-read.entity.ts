import { Column, Entity, PrimaryColumn } from 'typeorm';

/** 公告已读记录 */
@Entity('sys_notice_read')
export class SysNoticeReadEntity {
  @PrimaryColumn({ type: 'bigint', name: 'notice_id', comment: '公告ID' })
  noticeId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'user_id', comment: '用户ID' })
  userId!: string;

  @Column({ type: 'datetime', name: 'read_at', comment: '阅读时间' })
  readAt!: Date;
}
