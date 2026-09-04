import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateUserDto as IUpdateUserDto } from '@nova/shared-types';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto implements IUpdateUserDto {
  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

  @ApiPropertyOptional({ enum: [0, 1] })
  @IsOptional()
  @IsIn([0, 1])
  status?: 0 | 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deptId?: string | null;
}
