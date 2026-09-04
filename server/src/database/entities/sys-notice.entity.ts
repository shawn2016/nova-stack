import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_notice')
export class SysNoticeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'varchar', length: 128, comment: '标题' })
  title!: string;

  @Column({ type: 'text', comment: '内容' })
  content!: string;

  /** 类型：1=通知，2=公告 */
  @Column({ type: 'tinyint', comment: '类型：1通知 2公告' })
  type!: number;

  /** 状态：1=已发布，0=草稿 */
  @Column({ type: 'tinyint', default: 0, comment: '状态：1已发布 0草稿' })
  status!: number;

  @Column({ type: 'bigint', name: 'publisher_id', comment: '发布者用户ID' })
  publisherId!: string;

  /** 发布时间；null=未发布 */
  @Column({ type: 'datetime', name: 'published_at', nullable: true, comment: '发布时间' })
  publishedAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
