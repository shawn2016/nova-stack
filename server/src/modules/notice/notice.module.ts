import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SysMessageEntity,
  SysNoticeEntity,
  SysNoticeReadEntity,
  SysUserEntity,
} from '../../database/entities';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { NoticeController } from './notice.controller';
import { NoticeService } from './notice.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SysNoticeEntity,
      SysNoticeReadEntity,
      SysMessageEntity,
      SysUserEntity,
    ]),
  ],
  controllers: [NoticeController, MessageController],
  providers: [NoticeService, MessageService],
})
export class NoticeModule {}
