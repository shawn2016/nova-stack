import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListRegionsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按名称或 code 搜索' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  keyword?: string;

  @ApiPropertyOptional({ enum: [1, 2, 3] })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2, 3])
  level?: 1 | 2 | 3;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}
