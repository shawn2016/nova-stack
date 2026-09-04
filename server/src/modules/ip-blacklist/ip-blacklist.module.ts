import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysIpBlacklistEntity } from '../../database/entities';
import { IpBlacklistController } from './ip-blacklist.controller';
import { IpBlacklistMiddleware } from './ip-blacklist.middleware';
import { IpBlacklistService } from './ip-blacklist.service';

@Module({
  imports: [TypeOrmModule.forFeature([SysIpBlacklistEntity])],
  controllers: [IpBlacklistController],
  providers: [IpBlacklistService, IpBlacklistMiddleware],
  exports: [IpBlacklistService],
})
export class IpBlacklistModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IpBlacklistMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
