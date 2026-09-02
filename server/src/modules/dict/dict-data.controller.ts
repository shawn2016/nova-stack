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
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { ListDictDataDto } from './dto/list-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';
import { DictDataService } from './dict-data.service';

@ApiTags('dict-data')
@ApiBearerAuth()
@Controller('dict/data')
export class DictDataController {
  constructor(private readonly dictDataService: DictDataService) {}

  @Get('by-type/:code')
  @ApiOperation({ summary: '按类型编码获取启用字典项（下拉）' })
  findByType(@Param('code') code: string) {
    return this.dictDataService.findOptionsByTypeCode(code);
  }

  @Get()
  @RequirePermission('system:dict:data:list')
  @ApiOperation({ summary: '字典数据列表' })
  list(@Query() query: ListDictDataDto) {
    return this.dictDataService.list(query);
  }

  @Post()
  @RequirePermission('system:dict:data:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建字典数据' })
  create(@Body() body: CreateDictDataDto) {
    return this.dictDataService.create(body);
  }

  @Put(':id')
  @RequirePermission('system:dict:data:update')
  @ApiOperation({ summary: '更新字典数据' })
  update(@Param('id') id: string, @Body() body: UpdateDictDataDto) {
    return this.dictDataService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('system:dict:data:delete')
  @ApiOperation({ summary: '删除字典数据' })
  remove(@Param('id') id: string) {
    return this.dictDataService.remove(id);
  }
}
