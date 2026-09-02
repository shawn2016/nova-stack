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
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { ListDictTypesDto } from './dto/list-dict-types.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { DictTypeService } from './dict-type.service';

@ApiTags('dict-types')
@ApiBearerAuth()
@Controller('dict/types')
export class DictTypeController {
  constructor(private readonly dictTypeService: DictTypeService) {}

  @Get()
  @RequirePermission('system:dict:type:list')
  @ApiOperation({ summary: '字典类型列表' })
  list(@Query() query: ListDictTypesDto) {
    return this.dictTypeService.list(query);
  }

  @Post()
  @RequirePermission('system:dict:type:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建字典类型' })
  create(@Body() body: CreateDictTypeDto) {
    return this.dictTypeService.create(body);
  }

  @Put(':id')
  @RequirePermission('system:dict:type:update')
  @ApiOperation({ summary: '更新字典类型' })
  update(@Param('id') id: string, @Body() body: UpdateDictTypeDto) {
    return this.dictTypeService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission('system:dict:type:delete')
  @ApiOperation({ summary: '删除字典类型' })
  remove(@Param('id') id: string) {
    return this.dictTypeService.remove(id);
  }
}
