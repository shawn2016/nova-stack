import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListDictDataDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按类型 ID 筛选' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null ? value : String(value)))
  @IsString()
  typeId?: string;

  @ApiPropertyOptional({ description: '按类型编码筛选' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  typeCode?: string;

  @ApiPropertyOptional({ description: '按标签或值搜索' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  keyword?: string;
}
