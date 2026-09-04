import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_job_log')
export class SysJobLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'bigint', name: 'job_id', comment: '定时任务ID' })
  jobId!: string;

  @Column({ type: 'varchar', length: 64, name: 'job_name', comment: '任务名称' })
  jobName!: string;

  @Column({ type: 'varchar', length: 64, name: 'job_group', comment: '任务分组' })
  jobGroup!: string;

  @Column({ type: 'varchar', length: 128, name: 'invoke_target', comment: '调用目标' })
  invokeTarget!: string;

  /** 执行状态：1=成功，0=失败 */
  @Column({ type: 'tinyint', comment: '执行状态：1成功 0失败' })
  status!: number;

  /** 执行消息；null=无 */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '执行消息' })
  message!: string | null;

  /** 异常堆栈；null=无 */
  @Column({ type: 'text', name: 'exception_info', nullable: true, comment: '异常信息' })
  exceptionInfo!: string | null;

  @Column({ type: 'datetime', name: 'start_time', comment: '开始时间' })
  startTime!: Date;

  @Column({ type: 'datetime', name: 'end_time', comment: '结束时间' })
  endTime!: Date;

  @Column({ type: 'int', name: 'duration_ms', comment: '耗时（毫秒）' })
  durationMs!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;
}
