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
import { CurrentUser, AuthUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermission('system:user:list')
  @ApiOperation({ summary: '用户列表' })
  list(@Query() query: ListUsersDto) {
    return this.userService.list(query);
  }

  @Get(':id')
  @RequirePermission('system:user:list')
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @RequirePermission('system:user:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建用户' })
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Put(':id/roles')
  @RequirePermission('system:user:update')
  @ApiOperation({ summary: '分配用户角色' })
  assignRoles(@Param('id') id: string, @Body() body: AssignUserRolesDto) {
    return this.userService.assignRoles(id, body);
  }

  @Put(':id')
  @RequirePermission('system:user:update')
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('system:user:delete')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.userService.remove(id, user.userId);
  }
}
