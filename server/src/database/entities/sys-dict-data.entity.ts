import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_dict_data')
@Unique(['typeId', 'value'])
export class SysDictDataEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键' })
  id!: string;

  /** 字典类型 ID */
  @Column({ type: 'bigint', name: 'type_id', comment: '字典类型ID' })
  typeId!: string;

  @Column({ type: 'varchar', length: 64, comment: '显示标签' })
  label!: string;

  @Column({ type: 'varchar', length: 64, comment: '字典值' })
  value!: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort!: number;

  /** 状态：1=启用，0=禁用 */
  @Column({ type: 'tinyint', default: 1, comment: '状态：1启用 0禁用' })
  status!: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at', comment: '创建时间' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', comment: '更新时间' })
  updatedAt!: Date;
}
