import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import type { AssignUserRolesDto as IAssignUserRolesDto } from '@nova/shared-types';

export class AssignUserRolesDto implements IAssignUserRolesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  roleIds!: string[];
}
