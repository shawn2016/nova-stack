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
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', name: 'type_id' })
  typeId!: string;

  @Column({ type: 'varchar', length: 64 })
  label!: string;

  @Column({ type: 'varchar', length: 64 })
  value!: string;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
