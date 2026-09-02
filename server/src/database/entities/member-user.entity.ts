import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('member_user')
@Unique(['phone'])
export class MemberUserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash', nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'varchar', length: 64 })
  nickname!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  avatar!: string | null;

  @Column({ type: 'tinyint', default: 1 })
  status!: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;
}
