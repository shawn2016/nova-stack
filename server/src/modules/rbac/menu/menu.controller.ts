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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuService } from './menu.service';

@ApiTags('menus')
@ApiBearerAuth()
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @RequirePermission('system:menu:list')
  @ApiOperation({ summary: '菜单列表' })
  list() {
    return this.menuService.list();
  }

  @Post()
  @RequirePermission('system:menu:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建菜单' })
  create(@Body() body: CreateMenuDto) {
    return this.menuService.create(body);
  }

  @Put(':id')
  @RequirePermission('system:menu:update')
  @ApiOperation({ summary: '更新菜单' })
  update(@Param('id') id: string, @Body() body: UpdateMenuDto) {
    return this.menuService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('system:menu:delete')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
