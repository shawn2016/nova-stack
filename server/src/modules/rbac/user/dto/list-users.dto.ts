import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ListUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按用户名或昵称搜索' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  keyword?: string;
}
