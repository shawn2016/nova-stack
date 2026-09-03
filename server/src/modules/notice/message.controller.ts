import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { CreateMessageDto, ListMessagesDto } from './dto/message.dto';
import { MessageService } from './message.service';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('inbox')
  @RequirePermission('system:message:list')
  @ApiOperation({ summary: '收件箱' })
  inbox(@CurrentUser() user: AuthUser, @Query() query: ListMessagesDto) {
    return this.messageService.inbox(user.userId, query);
  }

  @Get('sent')
  @RequirePermission('system:message:list')
  @ApiOperation({ summary: '发件箱' })
  sent(@CurrentUser() user: AuthUser, @Query() query: ListMessagesDto) {
    return this.messageService.sent(user.userId, query);
  }

  @Get('unread-count')
  @RequirePermission('system:message:list')
  @ApiOperation({ summary: '未读消息数' })
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.messageService.unreadCount(user.userId);
  }

  @Post()
  @RequirePermission('system:message:send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '发送站内消息' })
  send(@Body() body: CreateMessageDto, @CurrentUser() user: AuthUser) {
    return this.messageService.send(user.userId, body);
  }

  @Put(':id/read')
  @RequirePermission('system:message:list')
  @ApiOperation({ summary: '标记消息已读' })
  markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.messageService.markRead(id, user.userId);
  }

  @Delete(':id')
  @RequirePermission('system:message:delete')
  @ApiOperation({ summary: '删除消息' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.messageService.remove(id, user.userId);
  }
}
