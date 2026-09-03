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
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import {
  CreateSmsChannelDto,
  ListSmsChannelsDto,
  UpdateSmsChannelDto,
} from './dto/sms-channel.dto';
import {
  CreateSmsTemplateDto,
  ListSmsTemplatesDto,
  UpdateSmsTemplateDto,
} from './dto/sms-template.dto';
import { ListSmsLogsDto, SendSmsDto } from './dto/sms-send.dto';
import { SmsChannelService } from './sms-channel.service';
import { SmsLogService } from './sms-log.service';
import { SmsTemplateService } from './sms-template.service';
import { SmsService } from './sms.service';

@ApiTags('sms')
@ApiBearerAuth()
@Controller('sms')
export class SmsController {
  constructor(
    private readonly channelService: SmsChannelService,
    private readonly templateService: SmsTemplateService,
    private readonly logService: SmsLogService,
    private readonly smsService: SmsService,
  ) {}

  @Get('channels')
  @RequirePermission('infra:sms:channel:list')
  @ApiOperation({ summary: '短信通道列表' })
  listChannels(@Query() query: ListSmsChannelsDto) {
    return this.channelService.list(query);
  }

  @Get('channels/:id')
  @RequirePermission('infra:sms:channel:list')
  @ApiOperation({ summary: '短信通道详情' })
  findChannel(@Param('id') id: string) {
    return this.channelService.findById(id);
  }

  @Post('channels')
  @RequirePermission('infra:sms:channel:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建短信通道' })
  createChannel(@Body() dto: CreateSmsChannelDto) {
    return this.channelService.create(dto);
  }

  @Put('channels/:id')
  @RequirePermission('infra:sms:channel:update')
  @ApiOperation({ summary: '更新短信通道' })
  updateChannel(@Param('id') id: string, @Body() dto: UpdateSmsChannelDto) {
    return this.channelService.update(id, dto);
  }

  @Delete('channels/:id')
  @RequirePermission('infra:sms:channel:delete')
  @ApiOperation({ summary: '删除短信通道' })
  removeChannel(@Param('id') id: string) {
    return this.channelService.remove(id);
  }

  @Get('templates')
  @RequirePermission('infra:sms:template:list')
  @ApiOperation({ summary: '短信模板列表' })
  listTemplates(@Query() query: ListSmsTemplatesDto) {
    return this.templateService.list(query);
  }

  @Get('templates/:id')
  @RequirePermission('infra:sms:template:list')
  @ApiOperation({ summary: '短信模板详情' })
  findTemplate(@Param('id') id: string) {
    return this.templateService.findById(id);
  }

  @Post('templates')
  @RequirePermission('infra:sms:template:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建短信模板' })
  createTemplate(@Body() dto: CreateSmsTemplateDto) {
    return this.templateService.create(dto);
  }

  @Put('templates/:id')
  @RequirePermission('infra:sms:template:update')
  @ApiOperation({ summary: '更新短信模板' })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateSmsTemplateDto) {
    return this.templateService.update(id, dto);
  }

  @Delete('templates/:id')
  @RequirePermission('infra:sms:template:delete')
  @ApiOperation({ summary: '删除短信模板' })
  removeTemplate(@Param('id') id: string) {
    return this.templateService.remove(id);
  }

  @Get('logs')
  @RequirePermission('infra:sms:log:list')
  @ApiOperation({ summary: '短信发送日志' })
  listLogs(@Query() query: ListSmsLogsDto) {
    return this.logService.list(query);
  }

  @Post('send')
  @RequirePermission('infra:sms:send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '测试发送短信' })
  send(@Body() dto: SendSmsDto) {
    return this.smsService.send(dto);
  }
}
