import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListArticlesDto extends PaginationDto {
  @ApiPropertyOptional({ enum: [0, 1], description: '按状态筛选' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: 0 | 1;
}
