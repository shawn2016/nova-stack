import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '../../common/jwt/jwt.module';
import { SysConfigEntity } from '../../database/entities';
import { OnlineSessionController } from './online-session.controller';
import { OnlineSessionService } from './online-session.service';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([SysConfigEntity])],
  controllers: [OnlineSessionController],
  providers: [OnlineSessionService],
  exports: [OnlineSessionService],
})
export class OnlineSessionModule {}
