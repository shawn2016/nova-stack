import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListDictTypesDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按名称或编码搜索' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  keyword?: string;
}
