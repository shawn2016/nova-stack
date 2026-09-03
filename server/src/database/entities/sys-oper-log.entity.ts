import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sys_oper_log')
export class SysOperLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 64 })
  username!: string;

  @Column({ type: 'varchar', length: 32 })
  module!: string;

  @Column({ type: 'varchar', length: 32 })
  action!: string;

  @Column({ type: 'varchar', length: 8 })
  method!: string;

  @Column({ type: 'varchar', length: 255 })
  path!: string;

  @Column({ type: 'varchar', length: 64 })
  ip!: string;

  @Column({ type: 'text', name: 'request_summary', nullable: true })
  requestSummary!: string | null;

  @Column({ type: 'tinyint' })
  status!: number;

  @Column({ type: 'varchar', length: 500, name: 'error_msg', nullable: true })
  errorMsg!: string | null;

  @Column({ type: 'int', name: 'duration_ms' })
  durationMs!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;
}
