import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateDeptSettingsDto as IUpdateDeptSettingsDto } from '@nova/shared-types';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDeptSettingsDto implements IUpdateDeptSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  moduleEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  userBindingEnabled?: boolean;
}
