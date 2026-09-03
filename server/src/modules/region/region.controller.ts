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
import { CreateRegionDto } from './dto/create-region.dto';
import { ListRegionsDto } from './dto/list-regions.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionService } from './region.service';

@ApiTags('regions')
@ApiBearerAuth()
@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get('tree')
  @RequirePermission('system:region:list')
  @ApiOperation({ summary: '地区树（仅启用）' })
  tree() {
    return this.regionService.tree();
  }

  @Get()
  @RequirePermission('system:region:list')
  @ApiOperation({ summary: '地区分页列表' })
  list(@Query() query: ListRegionsDto) {
    return this.regionService.list(query);
  }

  @Get(':id')
  @RequirePermission('system:region:list')
  @ApiOperation({ summary: '地区详情' })
  findOne(@Param('id') id: string) {
    return this.regionService.findById(id);
  }

  @Post()
  @RequirePermission('system:region:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建地区' })
  create(@Body() body: CreateRegionDto) {
    return this.regionService.create(body);
  }

  @Put(':id')
  @RequirePermission('system:region:update')
  @ApiOperation({ summary: '更新地区' })
  update(@Param('id') id: string, @Body() body: UpdateRegionDto) {
    return this.regionService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('system:region:delete')
  @ApiOperation({ summary: '删除地区' })
  remove(@Param('id') id: string) {
    return this.regionService.remove(id);
  }
}
