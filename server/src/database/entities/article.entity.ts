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
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  summary!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 512, name: 'cover_url', nullable: true })
  coverUrl!: string | null;

  @Column({ type: 'tinyint', default: 0 })
  status!: number;

  @Column({ type: 'bigint', name: 'author_id' })
  authorId!: string;

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
