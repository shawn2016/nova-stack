import { ApiProperty } from '@nestjs/swagger';
import type { UpdateDeptStatusDto as IUpdateDeptStatusDto } from '@nova/shared-types';
import { IsIn } from 'class-validator';

export class UpdateDeptStatusDto implements IUpdateDeptStatusDto {
  @ApiProperty({ enum: [0, 1] })
  @IsIn([0, 1])
  status!: 0 | 1;
}
