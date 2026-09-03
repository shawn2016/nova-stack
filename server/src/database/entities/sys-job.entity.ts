import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_job')
export class SysJobEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'varchar', length: 64, name: 'job_group', default: 'default' })
  jobGroup!: string;

  @Column({ type: 'varchar', length: 128, name: 'invoke_target' })
  invokeTarget!: string;

  @Column({ type: 'varchar', length: 64, name: 'cron_expression' })
  cronExpression!: string;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @Column({ type: 'tinyint', default: 0 })
  concurrent!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
