import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListOperLogDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按用户名筛选' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  username?: string;

  @ApiPropertyOptional({ description: '按模块筛选' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  module?: string;

  @ApiPropertyOptional({ description: '状态：1 成功 0 失败' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '开始时间（ISO 字符串）' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间（ISO 字符串）' })
  @IsOptional()
  @IsString()
  endTime?: string;
}
