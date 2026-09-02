import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '../../common/jwt/jwt.module';
import { MemberUserEntity } from '../../database/entities';
import { MemberAuthController } from './member-auth.controller';
import { MemberAuthService } from './member-auth.service';
import { MemberAuthGuard } from './guards/member-auth.guard';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([MemberUserEntity]),
  ],
  controllers: [MemberAuthController],
  providers: [
    MemberAuthService,
    {
      provide: APP_GUARD,
      useClass: MemberAuthGuard,
    },
  ],
  exports: [MemberAuthService],
})
export class MemberAuthModule {}
