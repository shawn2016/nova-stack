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
import { CreateNoticeDto, UpdateNoticeDto } from './dto/create-notice.dto';
import { ListMyNoticesDto, ListNoticesDto } from './dto/list-notices.dto';
import { NoticeService } from './notice.service';

@ApiTags('notices')
@ApiBearerAuth()
@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @RequirePermission('system:notice:list')
  @ApiOperation({ summary: '通知公告管理列表' })
  list(@Query() query: ListNoticesDto) {
    return this.noticeService.list(query);
  }

  @Get('my')
  @ApiOperation({ summary: '我的已发布公告' })
  listMy(@CurrentUser() user: AuthUser, @Query() query: ListMyNoticesDto) {
    return this.noticeService.listMy(user.userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '未读公告数' })
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.noticeService.unreadCount(user.userId);
  }

  @Post()
  @RequirePermission('system:notice:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建草稿公告' })
  create(@Body() body: CreateNoticeDto, @CurrentUser() user: AuthUser) {
    return this.noticeService.create(body, user.userId);
  }

  @Put(':id/publish')
  @RequirePermission('system:notice:publish')
  @ApiOperation({ summary: '发布公告' })
  publish(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.noticeService.publish(id, user.userId);
  }

  @Put(':id')
  @RequirePermission('system:notice:update')
  @ApiOperation({ summary: '更新公告' })
  update(@Param('id') id: string, @Body() body: UpdateNoticeDto) {
    return this.noticeService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('system:notice:delete')
  @ApiOperation({ summary: '删除草稿公告' })
  remove(@Param('id') id: string) {
    return this.noticeService.remove(id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '标记公告已读' })
  markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.noticeService.markRead(id, user.userId);
  }
}
