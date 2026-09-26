import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_role')
@Unique(['code'])
export class SysRoleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ type: 'tinyint', name: 'data_scope', default: 1 })
  dataScope!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
