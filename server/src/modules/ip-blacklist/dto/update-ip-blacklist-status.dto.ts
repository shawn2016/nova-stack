import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt } from 'class-validator';

export class UpdateIpBlacklistStatusBodyDto {
  @ApiProperty({ enum: [0, 1] })
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  status!: number;
}
