import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
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
  listLoginLogs(@Query() query: ListLoginLogDto, @CurrentUser() user: AuthUser) {
    return this.loginLogService.list(query, user.userId);
  }

  @Get('oper-logs')
  @RequirePermission('system:audit:oper:list')
  @ApiOperation({ summary: '操作日志列表' })
  listOperLogs(@Query() query: ListOperLogDto, @CurrentUser() user: AuthUser) {
    return this.operLogService.list(query, user.userId);
  }
}
