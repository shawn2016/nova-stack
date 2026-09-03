import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_job_log')
export class SysJobLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', name: 'job_id' })
  jobId!: string;

  @Column({ type: 'varchar', length: 64, name: 'job_name' })
  jobName!: string;

  @Column({ type: 'varchar', length: 64, name: 'job_group' })
  jobGroup!: string;

  @Column({ type: 'varchar', length: 128, name: 'invoke_target' })
  invokeTarget!: string;

  @Column({ type: 'tinyint' })
  status!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  message!: string | null;

  @Column({ type: 'text', name: 'exception_info', nullable: true })
  exceptionInfo!: string | null;

  @Column({ type: 'datetime', name: 'start_time' })
  startTime!: Date;

  @Column({ type: 'datetime', name: 'end_time' })
  endTime!: Date;

  @Column({ type: 'int', name: 'duration_ms' })
  durationMs!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;
}
