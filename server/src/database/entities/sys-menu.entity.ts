import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_menu')
export class SysMenuEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', name: 'parent_id', default: 0 })
  parentId!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  path!: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  component!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  icon!: string | null;

  @Column({ type: 'varchar', length: 16 })
  type!: string;

  @Column({ type: 'varchar', length: 128, name: 'permission_code', nullable: true })
  permissionCode!: string | null;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ type: 'tinyint', default: 1 })
  visible!: number;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;
}
