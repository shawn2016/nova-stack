import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ListMenusDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按名称或路径搜索' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  keyword?: string;
}
