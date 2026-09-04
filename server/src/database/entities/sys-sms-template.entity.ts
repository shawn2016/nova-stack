import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_sms_template')
@Index(['code'], { unique: true })
export class SysSmsTemplateEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  @Column({ type: 'varchar', length: 64, comment: '模板编码' })
  code!: string;

  @Column({ type: 'varchar', length: 64, comment: '模板名称' })
  name!: string;

  @Column({ type: 'text', comment: '模板内容' })
  content!: string;

  @Column({ type: 'bigint', name: 'channel_id', comment: '短信渠道ID' })
  channelId!: string;

  /** 状态：1=启用，0=禁用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
  status!: number;

  /** 备注；null=无 */
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
