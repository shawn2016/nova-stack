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
import { CreateSiteConfigDto } from './dto/create-site-config.dto';
import { ListSiteConfigDto } from './dto/list-site-config.dto';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
import { SiteConfigService } from './site-config.service';

@ApiTags('site-config')
@ApiBearerAuth()
@Controller('config')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get('by-key/:key')
  @ApiOperation({ summary: '按 key 读取站点配置（运行时）' })
  findByKey(@Param('key') key: string) {
    return this.siteConfigService.findByKey(key);
  }

  @Get('items')
  @RequirePermission('system:config:list')
  @ApiOperation({ summary: '站点配置列表' })
  list(@Query() query: ListSiteConfigDto) {
    return this.siteConfigService.list(query);
  }

  @Post('items')
  @RequirePermission('system:config:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建站点配置' })
  create(@Body() body: CreateSiteConfigDto) {
    return this.siteConfigService.create(body);
  }

  @Put('items/:id')
  @RequirePermission('system:config:update')
  @ApiOperation({ summary: '更新站点配置' })
  update(@Param('id') id: string, @Body() body: UpdateSiteConfigDto) {
    return this.siteConfigService.update(id, body);
  }

  @Delete('items/:id')
  @RequirePermission('system:config:delete')
  @ApiOperation({ summary: '删除站点配置' })
  remove(@Param('id') id: string) {
    return this.siteConfigService.remove(id);
  }
}
