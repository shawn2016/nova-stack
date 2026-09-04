import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('article')
@Index(['status', 'publishedAt'])
export class ArticleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title!: string;

  @Column({ type: 'varchar', length: 500, default: '', comment: '摘要' })
  summary!: string;

  @Column({ type: 'text', comment: '正文' })
  content!: string;

  /** 封面 URL；null=无封面 */
  @Column({
    type: 'varchar',
    length: 512,
    name: 'cover_url',
    nullable: true,
    comment: '封面URL',
  })
  coverUrl!: string | null;

  /** 状态：0=草稿，1=已发布 */
  @Column({ type: 'tinyint', default: 0, comment: '状态：0草稿 1已发布' })
  status!: number;

  /** 作者 Admin 用户 ID */
  @Column({ type: 'bigint', name: 'author_id', comment: '作者用户ID' })
  authorId!: string;

  /** 发布时间；null=未发布 */
  @Column({
    type: 'datetime',
    name: 'published_at',
    nullable: true,
    comment: '发布时间',
  })
  publishedAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
