import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_dept')
export class SysDeptEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', name: 'parent_id', default: 0 })
  parentId!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  leader!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
