import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../decorators/require-permission.decorator';
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
}
