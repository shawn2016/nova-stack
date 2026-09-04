import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sys_file')
export class SysFileEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 512 })
  url!: string;

  @Column({ type: 'varchar', length: 512, name: 'object_key' })
  objectKey!: string;

  @Column({ type: 'varchar', length: 32 })
  storage!: 'local' | 'oss' | 'aliyun_oss' | 'tencent_cos';

  @Column({ type: 'varchar', length: 128, name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'int' })
  size!: number;

  @Column({ type: 'varchar', length: 255, name: 'original_name', nullable: true })
  originalName!: string | null;

  @Column({ type: 'bigint', name: 'uploader_id' })
  uploaderId!: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;
}
