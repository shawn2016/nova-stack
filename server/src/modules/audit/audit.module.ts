import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysLoginLogEntity } from '../../database/entities';
import { LoginLogService } from './login-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([SysLoginLogEntity])],
  providers: [LoginLogService],
  exports: [LoginLogService],
})
export class AuditModule {}
