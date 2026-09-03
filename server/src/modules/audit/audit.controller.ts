import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { ListLoginLogDto } from './dto/list-login-log.dto';
import { ListOperLogDto } from './dto/list-oper-log.dto';
import { LoginLogService } from './login-log.service';
import { OperLogService } from './oper-log.service';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(
    private readonly loginLogService: LoginLogService,
    private readonly operLogService: OperLogService,
  ) {}

  @Get('login-logs')
  @RequirePermission('system:audit:login:list')
  @ApiOperation({ summary: '登录日志列表' })
  listLoginLogs(@Query() query: ListLoginLogDto) {
    return this.loginLogService.list(query);
  }

  @Get('oper-logs')
  @RequirePermission('system:audit:oper:list')
  @ApiOperation({ summary: '操作日志列表' })
  listOperLogs(@Query() query: ListOperLogDto) {
    return this.operLogService.list(query);
  }
}
