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
  CreateEmailChannelDto,
  ListEmailChannelsDto,
  UpdateEmailChannelDto,
} from './dto/email-channel.dto';
import {
  CreateEmailTemplateDto,
  ListEmailTemplatesDto,
  UpdateEmailTemplateDto,
} from './dto/email-template.dto';
import { ListEmailLogsDto, SendEmailDto } from './dto/email-send.dto';
import { EmailChannelService } from './email-channel.service';
import { EmailLogService } from './email-log.service';
import { EmailTemplateService } from './email-template.service';
import { EmailService } from './email.service';

@ApiTags('email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(
    private readonly channelService: EmailChannelService,
    private readonly templateService: EmailTemplateService,
    private readonly logService: EmailLogService,
    private readonly emailService: EmailService,
  ) {}

  @Get('channels')
  @RequirePermission('infra:email:channel:list')
  @ApiOperation({ summary: '邮件通道列表' })
  listChannels(@Query() query: ListEmailChannelsDto) {
    return this.channelService.list(query);
  }

  @Get('channels/:id')
  @RequirePermission('infra:email:channel:list')
  @ApiOperation({ summary: '邮件通道详情' })
  findChannel(@Param('id') id: string) {
    return this.channelService.findById(id);
  }

  @Post('channels')
  @RequirePermission('infra:email:channel:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建邮件通道' })
  createChannel(@Body() dto: CreateEmailChannelDto) {
    return this.channelService.create(dto);
  }

  @Put('channels/:id')
  @RequirePermission('infra:email:channel:update')
  @ApiOperation({ summary: '更新邮件通道' })
  updateChannel(@Param('id') id: string, @Body() dto: UpdateEmailChannelDto) {
    return this.channelService.update(id, dto);
  }

  @Delete('channels/:id')
  @RequirePermission('infra:email:channel:delete')
  @ApiOperation({ summary: '删除邮件通道' })
  removeChannel(@Param('id') id: string) {
    return this.channelService.remove(id);
  }

  @Get('templates')
  @RequirePermission('infra:email:template:list')
  @ApiOperation({ summary: '邮件模板列表' })
  listTemplates(@Query() query: ListEmailTemplatesDto) {
    return this.templateService.list(query);
  }

  @Get('templates/:id')
  @RequirePermission('infra:email:template:list')
  @ApiOperation({ summary: '邮件模板详情' })
  findTemplate(@Param('id') id: string) {
    return this.templateService.findById(id);
  }

  @Post('templates')
  @RequirePermission('infra:email:template:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建邮件模板' })
  createTemplate(@Body() dto: CreateEmailTemplateDto) {
    return this.templateService.create(dto);
  }

  @Put('templates/:id')
  @RequirePermission('infra:email:template:update')
  @ApiOperation({ summary: '更新邮件模板' })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
    return this.templateService.update(id, dto);
  }

  @Delete('templates/:id')
  @RequirePermission('infra:email:template:delete')
  @ApiOperation({ summary: '删除邮件模板' })
  removeTemplate(@Param('id') id: string) {
    return this.templateService.remove(id);
  }

  @Get('logs')
  @RequirePermission('infra:email:log:list')
  @ApiOperation({ summary: '邮件发送日志' })
  listLogs(@Query() query: ListEmailLogsDto) {
    return this.logService.list(query);
  }

  @Post('send')
  @RequirePermission('infra:email:send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '测试发送邮件' })
  send(@Body() dto: SendEmailDto) {
    return this.emailService.send(dto);
  }
}
