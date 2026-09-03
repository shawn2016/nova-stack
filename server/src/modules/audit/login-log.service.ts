import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysLoginLogEntity } from '../../database/entities';

export interface RecordLoginAttemptParams {
  username: string;
  userId?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  message?: string;
}

@Injectable()
export class LoginLogService {
  constructor(
    @InjectRepository(SysLoginLogEntity)
    private readonly loginLogRepo: Repository<SysLoginLogEntity>,
  ) {}

  async recordLoginAttempt(params: RecordLoginAttemptParams): Promise<void> {
    const entity = this.loginLogRepo.create({
      username: params.username,
      userId: params.userId ?? null,
      ip: params.ip,
      userAgent: params.userAgent ?? null,
      status: params.success ? 1 : 0,
      message: params.message ?? (params.success ? 'success' : null),
    });
    await this.loginLogRepo.save(entity);
  }
}
