import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ListMenusDto extends PaginationDto {
  /** 菜单管理需拉取完整列表构建树，允许较大 pageSize */
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 500 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  declare pageSize: number;

  @ApiPropertyOptional({ description: '按名称或路径搜索' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  keyword?: string;
}
