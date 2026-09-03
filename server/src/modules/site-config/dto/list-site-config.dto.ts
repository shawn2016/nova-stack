import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListSiteConfigDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按 key 或 name 搜索' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  keyword?: string;

  @ApiPropertyOptional({ description: '按分组筛选' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  group?: string;
}
