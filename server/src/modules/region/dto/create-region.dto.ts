import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRegionDto {
  @ApiProperty({ description: '上级地区 id，省级为 0' })
  @IsString()
  @IsNotEmpty()
  parentId!: string;

  @ApiProperty({ maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name!: string;

  @ApiProperty({ description: '行政区划代码 adcode' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  code!: string;

  @ApiPropertyOptional({ enum: [1, 2, 3] })
  @IsOptional()
  @IsIn([1, 2, 3])
  level?: 1 | 2 | 3;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ enum: [0, 1] })
  @IsOptional()
  @IsIn([0, 1])
  status?: 0 | 1;
}
