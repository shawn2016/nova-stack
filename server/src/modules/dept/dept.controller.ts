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
import { CreateDeptDto } from './dto/create-dept.dto';
import { ListDeptsDto } from './dto/list-depts.dto';
import { UpdateDeptDto } from './dto/update-dept.dto';
import { UpdateDeptSettingsDto } from './dto/update-dept-settings.dto';
import { UpdateDeptStatusDto } from './dto/update-dept-status.dto';
import { DeptService } from './dept.service';

@ApiTags('depts')
@ApiBearerAuth()
@Controller('depts')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @Get('tree/all')
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: '部门树（含停用）' })
  treeAll(@CurrentUser() user: AuthUser) {
    return this.deptService.tree(false, user.userId);
  }

  @Get('tree')
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: '部门树（仅启用）' })
  tree(@CurrentUser() user: AuthUser) {
    return this.deptService.tree(true, user.userId);
  }

  @Get('settings')
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: '部门模块功能开关' })
  getSettings() {
    return this.deptService.getSettings();
  }

  @Put('settings')
  @RequirePermission('system:dept:settings')
  @ApiOperation({ summary: '更新部门模块功能开关' })
  updateSettings(@Body() body: UpdateDeptSettingsDto) {
    return this.deptService.updateSettings(body);
  }

  @Get()
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: '部门分页列表' })
  list(@Query() query: ListDeptsDto, @CurrentUser() user: AuthUser) {
    return this.deptService.list(query, user.userId);
  }

  @Get(':id')
  @RequirePermission('system:dept:list')
  @ApiOperation({ summary: '部门详情' })
  findOne(@Param('id') id: string) {
    return this.deptService.findById(id);
  }

  @Post()
  @RequirePermission('system:dept:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建部门' })
  create(@Body() body: CreateDeptDto) {
    return this.deptService.create(body);
  }

  @Put(':id/status')
  @RequirePermission('system:dept:update')
  @ApiOperation({ summary: '切换部门状态' })
  updateStatus(@Param('id') id: string, @Body() body: UpdateDeptStatusDto) {
    return this.deptService.updateStatus(id, body.status);
  }

  @Put(':id')
  @RequirePermission('system:dept:update')
  @ApiOperation({ summary: '更新部门' })
  update(@Param('id') id: string, @Body() body: UpdateDeptDto) {
    return this.deptService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('system:dept:delete')
  @ApiOperation({ summary: '删除部门' })
  remove(@Param('id') id: string) {
    return this.deptService.remove(id);
  }
}
